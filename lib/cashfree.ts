import { createAdminClient } from '@/lib/supabase/server'

export interface CashfreeConfig {
  appId: string
  secretKey: string
  mode: 'SANDBOX' | 'PRODUCTION'
  apiVersion: string
}

export async function getCashfreeConfig(): Promise<CashfreeConfig> {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('store_settings')
    .select('key, value')
    .in('key', ['cashfree_app_id', 'cashfree_secret_key', 'cashfree_mode'])

  const appId = data?.find((s: any) => s.key === 'cashfree_app_id')?.value || process.env.CASHFREE_APP_ID || ''
  const secretKey = data?.find((s: any) => s.key === 'cashfree_secret_key')?.value || process.env.CASHFREE_SECRET_KEY || ''
  const modeRaw = data?.find((s: any) => s.key === 'cashfree_mode')?.value || process.env.CASHFREE_MODE || 'PRODUCTION'
  const mode = modeRaw.toUpperCase() === 'SANDBOX' ? 'SANDBOX' : 'PRODUCTION'

  return {
    appId,
    secretKey,
    mode,
    apiVersion: '2023-08-01'
  }
}

function getBaseUrl(mode: 'SANDBOX' | 'PRODUCTION'): string {
  return mode === 'SANDBOX' 
    ? 'https://sandbox.cashfree.com/pg' 
    : 'https://api.cashfree.com/pg'
}

export interface CreateCashfreeOrderParams {
  orderId: string
  orderAmount: number
  orderCurrency?: string
  customerDetails: {
    customerId: string
    customerName: string
    customerEmail: string
    customerPhone: string
  }
  orderMeta?: {
    returnUrl?: string
    notifyUrl?: string
  }
}

export async function createCashfreeOrderSession(params: CreateCashfreeOrderParams) {
  const config = await getCashfreeConfig()

  if (!config.appId || !config.secretKey) {
    throw new Error('Cashfree credentials not configured. Please set App ID and Secret Key in Admin > Settings.')
  }

  // Sanitize phone number (remove +, spaces, dashes - Cashfree expects 10 digits for Indian or valid phone)
  let cleanPhone = params.customerDetails.customerPhone.replace(/\D/g, '')
  if (cleanPhone.length > 10 && cleanPhone.startsWith('91')) {
    cleanPhone = cleanPhone.substring(2)
  }
  if (!cleanPhone || cleanPhone.length < 8) {
    cleanPhone = '9999999999'
  }

  const payload = {
    order_id: params.orderId,
    order_amount: Number(params.orderAmount.toFixed(2)),
    order_currency: params.orderCurrency || 'INR',
    customer_details: {
      customer_id: params.customerDetails.customerId || `cust_${Date.now()}`,
      customer_name: params.customerDetails.customerName || 'Customer',
      customer_email: params.customerDetails.customerEmail || 'customer@example.com',
      customer_phone: cleanPhone
    },
    order_meta: {
      return_url: params.orderMeta?.returnUrl,
      notify_url: params.orderMeta?.notifyUrl
    }
  }

  const url = `${getBaseUrl(config.mode)}/orders`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-client-id': config.appId,
      'x-client-secret': config.secretKey,
      'x-api-version': config.apiVersion,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('Cashfree Create Order Error:', data)
    throw new Error(data.message || 'Failed to create Cashfree payment order.')
  }

  return {
    paymentSessionId: data.payment_session_id,
    orderId: data.order_id,
    orderStatus: data.order_status,
    environment: config.mode.toLowerCase()
  }
}

export async function verifyCashfreeOrderPayment(orderId: string) {
  const config = await getCashfreeConfig()

  if (!config.appId || !config.secretKey) {
    throw new Error('Cashfree credentials not configured.')
  }

  const url = `${getBaseUrl(config.mode)}/orders/${orderId}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-client-id': config.appId,
      'x-client-secret': config.secretKey,
      'x-api-version': config.apiVersion
    }
  })

  const orderData = await response.json()

  if (!response.ok) {
    console.error('Cashfree Order Fetch Error:', orderData)
    throw new Error(orderData.message || 'Failed to verify Cashfree order.')
  }

  // Also fetch payments for this order to get the transaction / payment ID
  let paymentId = null
  try {
    const paymentsRes = await fetch(`${getBaseUrl(config.mode)}/orders/${orderId}/payments`, {
      method: 'GET',
      headers: {
        'x-client-id': config.appId,
        'x-client-secret': config.secretKey,
        'x-api-version': config.apiVersion
      }
    })
    const paymentsData = await paymentsRes.json()
    if (Array.isArray(paymentsData) && paymentsData.length > 0) {
      const successfulPayment = paymentsData.find((p: any) => p.payment_status === 'SUCCESS') || paymentsData[0]
      paymentId = successfulPayment.cf_payment_id ? String(successfulPayment.cf_payment_id) : null
    }
  } catch (e) {
    console.warn('Could not fetch Cashfree payments list:', e)
  }

  const isPaid = orderData.order_status === 'PAID'

  return {
    isPaid,
    orderStatus: orderData.order_status,
    orderAmount: orderData.order_amount,
    orderCurrency: orderData.order_currency,
    cfOrderId: orderData.cf_order_id ? String(orderData.cf_order_id) : orderId,
    paymentId: paymentId || orderId
  }
}
