'use server'

import { render } from '@react-email/render'
import nodemailer from 'nodemailer'
import OrderEmail from '@/components/emails/OrderEmail'
import { createAdminClient } from '@/lib/supabase/server'

async function getEmailTransporter() {
  let user = 'contact.shahiboutique@gmail.com'
  let pass = process.env.EMAIL_APP_PASSWORD || ''
  let senderName = 'Shahi Boutique'

  try {
    const supabase = await createAdminClient()
    const { data: settings } = await supabase
      .from('store_settings')
      .select('key, value')
      .in('key', ['smtp_user', 'smtp_password', 'smtp_sender_name'])

    if (settings && settings.length > 0) {
      const map = settings.reduce((acc: any, s: any) => {
        acc[s.key] = s.value
        return acc
      }, {})

      if (map.smtp_user) user = map.smtp_user
      if (map.smtp_password) pass = map.smtp_password
      if (map.smtp_sender_name) senderName = map.smtp_sender_name
    }
  } catch (err) {
    console.error('Error loading email settings:', err)
  }

  if (!pass) {
    return null
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user.trim(),
      pass: pass.trim().replace(/\s+/g, ''), // Strip spaces from App Passwords like "abcd efgh ijkl mnop"
    },
  })

  return {
    transporter,
    from: `"${senderName}" <${user.trim()}>`,
    user
  }
}

export async function sendOrderConfirmationEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  items: { name: string; quantity: number; price: number }[],
  totals: { subtotal: number; shipping: number; discount: number; total: number },
  shippingAddress: string
) {
  try {
    if (!customerEmail || !customerEmail.includes('@')) {
      console.warn('Invalid customer email, skipping email dispatch:', customerEmail)
      return { success: false, error: 'Invalid customer email' }
    }

    const mailer = await getEmailTransporter()
    if (!mailer) {
      console.warn('EMAIL_APP_PASSWORD / smtp_password not configured. Skipping email send.')
      return { success: false, error: 'Email configuration missing.' }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shahiboutique.com'
    const websiteTrackingUrl = `${siteUrl}/track-order?orderId=${encodeURIComponent(orderNumber)}`

    const emailHtml = await render(
      OrderEmail({
        orderNumber,
        customerName,
        orderStatus: 'CONFIRMED',
        items,
        totals,
        shippingAddress,
        websiteTrackingUrl
      })
    )

    const options = {
      from: mailer.from,
      to: customerEmail.trim(),
      subject: `Order Confirmation - ${orderNumber} | Shahi Boutique`,
      html: emailHtml,
    }

    const info = await mailer.transporter.sendMail(options)
    console.log(`Order confirmation email sent to ${customerEmail}:`, info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error(`Failed to send order confirmation email to ${customerEmail}:`, error)
    return { success: false, error: error.message }
  }
}

export async function sendOrderStatusEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  newStatus: string,
  trackingNumber?: string | null,
  trackingUrl?: string | null
) {
  try {
    if (!customerEmail || !customerEmail.includes('@')) {
      return { success: false, error: 'Invalid customer email' }
    }

    const mailer = await getEmailTransporter()
    if (!mailer) {
      console.warn('EMAIL_APP_PASSWORD / smtp_password not configured. Skipping email send.')
      return { success: false, error: 'Email configuration missing.' }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shahiboutique.com'
    const websiteTrackingUrl = `${siteUrl}/track-order?orderId=${encodeURIComponent(orderNumber)}`

    const emailHtml = await render(
      OrderEmail({
        orderNumber,
        customerName,
        orderStatus: newStatus.toUpperCase(),
        items: [],
        totals: { subtotal: 0, shipping: 0, discount: 0, total: 0 },
        shippingAddress: '',
        trackingNumber,
        trackingUrl,
        websiteTrackingUrl
      })
    )

    let subject = `Order Update - ${orderNumber} | Shahi Boutique`
    if (newStatus.toUpperCase() === 'SHIPPED') subject = `Your Order Has Shipped! - ${orderNumber} | Shahi Boutique`
    if (newStatus.toUpperCase() === 'DELIVERED') subject = `Your Order Has Been Delivered! - ${orderNumber} | Shahi Boutique`
    if (newStatus.toUpperCase() === 'CANCELLED') subject = `Order Cancelled - ${orderNumber} | Shahi Boutique`
    if (newStatus.toUpperCase() === 'REFUNDED') subject = `Order Refunded - ${orderNumber} | Shahi Boutique`

    const options = {
      from: mailer.from,
      to: customerEmail.trim(),
      subject,
      html: emailHtml,
    }

    const info = await mailer.transporter.sendMail(options)
    console.log(`Order status email (${newStatus}) sent to ${customerEmail}:`, info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error(`Failed to send order status email to ${customerEmail}:`, error)
    return { success: false, error: error.message }
  }
}

export async function sendTestEmailAction(targetEmail: string) {
  try {
    if (!targetEmail || !targetEmail.includes('@')) {
      return { success: false, error: 'Please provide a valid email address.' }
    }

    const mailer = await getEmailTransporter()
    if (!mailer) {
      return { 
        success: false, 
        error: 'Email App Password is not configured in Settings. Please set your 16-letter Google App Password.' 
      }
    }

    const info = await mailer.transporter.sendMail({
      from: mailer.from,
      to: targetEmail.trim(),
      subject: 'Test Email Delivery — Shahi Boutique',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 32px; background: #FAF9F6; border-radius: 16px; max-width: 520px; margin: 0 auto; border: 1px solid #E5E7EB;">
          <h2 style="color: #1C1C1C; margin-top: 0; text-transform: uppercase; letter-spacing: 2px; font-size: 20px;">✦ SHAHI BOUTIQUE ✦</h2>
          <p style="color: #4B5563; font-size: 14px; line-height: 1.6;">
            Hello! This is a test email confirming that your store automated email notifications are connected and working!
          </p>
          <div style="background: #ECFDF5; border: 1px solid #A7F3D0; padding: 14px 16px; border-radius: 12px; color: #065F46; font-size: 13px; font-weight: bold; margin: 20px 0;">
            ✓ Customer Notification System Verified
          </div>
          <p style="color: #6B7280; font-size: 12px; line-height: 1.5;">
            Whenever a customer enters their email during checkout, order confirmation invoices and shipping updates will be delivered here directly.
          </p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
          <p style="color: #9CA3AF; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">
            Shahi Boutique — Malerkotla, Punjab
          </p>
        </div>
      `
    })

    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('Test email failed:', error)
    return { success: false, error: error.message || 'Failed to send test email.' }
  }
}
