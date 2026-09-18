import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface InternationalOrderEmailProps {
  orderNumber: string
  customerName: string
  emailType: 'INQUIRY_RECEIVED' | 'QUOTE_READY' | 'STATUS_UPDATE'
  orderStatus?: string
  items: { name: string; quantity: number; price: number }[]
  totals: { subtotal: number; shipping: number; discount: number; total: number }
  shippingAddress: string
  country?: string
  currency?: string
  courierName?: string | null
  trackingUrl?: string | null
  trackingNumber?: string | null
  paymentLink?: string | null
  customNotes?: string | null
  websiteTrackingUrl?: string
  whatsappConciergeUrl?: string
}

const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

export default function InternationalOrderEmail({
  orderNumber = 'INT-2026-12345',
  customerName = 'Valued Customer',
  emailType = 'INQUIRY_RECEIVED',
  orderStatus = 'PENDING_REVIEW',
  items = [],
  totals = { subtotal: 0, shipping: 0, discount: 0, total: 0 },
  shippingAddress = 'Global Delivery Address',
  country = 'International',
  currency = 'USD',
  courierName = 'DHL Express Worldwide',
  trackingUrl,
  trackingNumber,
  paymentLink,
  customNotes,
  websiteTrackingUrl,
  whatsappConciergeUrl = 'https://wa.me/919041762820',
}: InternationalOrderEmailProps) {
  let headerTitle = 'International Order Inquiry Received'
  let subMessage = 'Thank you for your international inquiry with Shahi Boutique. Our boutique concierge is calculating express worldwide shipping rates to your address.'

  if (emailType === 'QUOTE_READY') {
    headerTitle = 'Your International Shipping Quote is Ready'
    subMessage = 'Your bespoke quote and courier rates have been prepared. Please review the itemized breakdown and complete your payment below.'
  } else if (emailType === 'STATUS_UPDATE') {
    if (orderStatus === 'CONFIRMED' || orderStatus === 'PAID') {
      headerTitle = 'Payment Confirmed — Atelier Tailoring in Progress'
      subMessage = 'We have received your payment! Your bespoke garments are now being handcrafted and prepared for international dispatch.'
    } else if (orderStatus === 'SHIPPED') {
      headerTitle = 'Your International Order Has Dispatched!'
      subMessage = `Your package has been handed over to ${courierName || 'DHL/FedEx'} and is on its way to ${country}.`
    } else if (orderStatus === 'DELIVERED') {
      headerTitle = 'Your International Order Has Been Delivered'
      subMessage = 'Your handcrafted pieces have arrived safely. Thank you for choosing Shahi Boutique.'
    }
  }

  return (
    <Html>
      <Head />
      <Preview>{headerTitle} - {orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerBanner}>
            <Heading style={logo}>SHAHI BOUTIQUE</Heading>
            <Text style={badge}>👑 Worldwide Couture Concierge</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>{headerTitle}</Heading>
            <Text style={greeting}>Dear {customerName},</Text>
            <Text style={introText}>{subMessage}</Text>
            
            <Section style={refBox}>
              <Text style={refLabel}>INTERNATIONAL REFERENCE</Text>
              <Text style={refNumber}>#{orderNumber}</Text>
              <Text style={destinationText}>Destination: {country} ({currency})</Text>
            </Section>

            {/* If Quote is Ready with Payment Link */}
            {emailType === 'QUOTE_READY' && paymentLink && (
              <Section style={paymentBox}>
                <Text style={paymentBoxTitle}>Complete Your Order Payment</Text>
                <Text style={paymentBoxDesc}>Click the secure link below to complete your checkout using Credit/Debit Card or International Gateway:</Text>
                <a href={paymentLink} style={buttonPayment}>
                  💳 Pay Now &amp; Confirm Order ➔
                </a>
              </Section>
            )}

            {/* If Shipped with Tracking */}
            {trackingNumber && (
              <Section style={trackingBox}>
                <Text style={trackingBoxTitle}>✈️ Courier Tracking Details</Text>
                <Text style={trackingText}>Carrier: <strong>{courierName || 'DHL Express'}</strong></Text>
                <Text style={trackingText}>Tracking No: <strong>{trackingNumber}</strong></Text>
                {trackingUrl && (
                  <div style={{ marginTop: '14px' }}>
                    <a href={trackingUrl} style={buttonSecondary}>Track via Courier Website</a>
                  </div>
                )}
              </Section>
            )}

            {/* Live Tracking Link on Website */}
            {websiteTrackingUrl && (
              <Section style={{ textAlign: 'center', margin: '24px 0 16px' }}>
                <a href={websiteTrackingUrl} style={buttonPrimary}>
                  ✦ Track Order on Website ➔
                </a>
              </Section>
            )}

            {/* WhatsApp Concierge Chat */}
            <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
              <a href={whatsappConciergeUrl} style={buttonWhatsApp}>
                💬 Chat with Senior Concierge on WhatsApp
              </a>
            </Section>

            {/* Order Items Summary */}
            <Hr style={hrLight} />
            <Heading style={h2}>Requested Garments &amp; Items</Heading>
            
            <table style={table}>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={tdLeft}>
                      <strong>{item.name}</strong>
                      <span style={{ display: 'block', color: '#888', fontSize: '12px' }}>Qty: {item.quantity}</span>
                    </td>
                    <td style={tdRight}>{formatPrice(item.price * item.quantity)}</td>
                  </tr>
                ))}
                <tr>
                  <td style={tdLeftLight}>Items Subtotal</td>
                  <td style={tdRight}>{formatPrice(totals.subtotal)}</td>
                </tr>
                {totals.discount > 0 && (
                  <tr>
                    <td style={tdLeftLight}>Bespoke Discount</td>
                    <td style={tdRight}>-{formatPrice(totals.discount)}</td>
                  </tr>
                )}
                <tr>
                  <td style={tdLeftLight}>International Express Courier</td>
                  <td style={tdRight}>
                    {totals.shipping > 0 ? formatPrice(totals.shipping) : 'Quoted by Concierge'}
                  </td>
                </tr>
                <tr>
                  <td style={tdTotal}>Total Payable</td>
                  <td style={tdTotalRight}>{formatPrice(totals.total)}</td>
                </tr>
              </tbody>
            </table>

            {/* Custom Notes */}
            {customNotes && (
              <>
                <Hr style={hrLight} />
                <Heading style={h2}>Bespoke Fitting Notes</Heading>
                <Text style={notesBox}>{customNotes}</Text>
              </>
            )}

            {/* Shipping Address */}
            <Hr style={hrLight} />
            <Heading style={h2}>Delivery Destination</Heading>
            <Text style={addressText}>{shippingAddress}</Text>

          </Section>
          
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Shahi Boutique — Luxury Bridal &amp; Festive Couture<br/>
              Telian Bazar, Malerkotla, Punjab 148023 India<br/>
              contact.shahiboutique@gmail.com | +91 90417 62820
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f8f9fa',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0 0 40px',
  marginBottom: '48px',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  maxWidth: '600px',
  overflow: 'hidden',
  border: '1px solid #e5e7eb',
}

const headerBanner = {
  backgroundColor: '#1C1C1C',
  padding: '32px 24px',
  textAlign: 'center' as const,
}

const logo = {
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: '900',
  letterSpacing: '5px',
  margin: '0 0 8px',
}

const badge = {
  color: '#FF7A00',
  fontSize: '11px',
  fontWeight: '800',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  margin: '0',
}

const content = {
  padding: '32px 40px',
}

const h1 = {
  color: '#111827',
  fontSize: '22px',
  fontWeight: '800',
  lineHeight: '28px',
  margin: '0 0 16px',
}

const h2 = {
  color: '#111827',
  fontSize: '14px',
  fontWeight: '800',
  margin: '24px 0 12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1.5px',
}

const greeting = {
  color: '#111827',
  fontSize: '15px',
  fontWeight: '700',
  margin: '0 0 8px',
}

const introText = {
  color: '#4B5563',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 20px',
}

const refBox = {
  backgroundColor: '#FFF7ED',
  border: '1px solid #FFEDD5',
  borderRadius: '12px',
  padding: '16px 20px',
  marginBottom: '24px',
}

const refLabel = {
  color: '#9A3412',
  fontSize: '10px',
  fontWeight: '900',
  letterSpacing: '1.5px',
  margin: '0 0 4px',
}

const refNumber = {
  color: '#7C2D12',
  fontSize: '18px',
  fontWeight: '900',
  fontFamily: 'monospace',
  margin: '0 0 4px',
}

const destinationText = {
  color: '#C2410C',
  fontSize: '12px',
  fontWeight: '600',
  margin: '0',
}

const paymentBox = {
  backgroundColor: '#ECFDF5',
  border: '2px solid #10B981',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '24px',
  textAlign: 'center' as const,
}

const paymentBoxTitle = {
  color: '#065F46',
  fontSize: '16px',
  fontWeight: '900',
  margin: '0 0 6px',
}

const paymentBoxDesc = {
  color: '#047857',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0 0 16px',
}

const trackingBox = {
  backgroundColor: '#F3F4F6',
  borderRadius: '12px',
  padding: '18px 20px',
  marginBottom: '24px',
}

const trackingBoxTitle = {
  color: '#111827',
  fontSize: '13px',
  fontWeight: '800',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 10px',
}

const trackingText = {
  fontSize: '13px',
  color: '#374151',
  margin: '0 0 4px',
}

const buttonPrimary = {
  backgroundColor: '#1C1C1C',
  borderRadius: '30px',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: '800',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 28px',
  letterSpacing: '1px',
  textTransform: 'uppercase' as const,
}

const buttonPayment = {
  backgroundColor: '#059669',
  borderRadius: '30px',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: '900',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  letterSpacing: '1px',
  textTransform: 'uppercase' as const,
}

const buttonSecondary = {
  backgroundColor: '#4B5563',
  borderRadius: '20px',
  color: '#ffffff',
  fontSize: '11px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '8px 20px',
}

const buttonWhatsApp = {
  backgroundColor: '#25D366',
  borderRadius: '30px',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: '800',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const hr = {
  borderColor: '#E5E7EB',
  margin: '24px 0',
}

const hrLight = {
  borderColor: '#F3F4F6',
  margin: '20px 0',
}

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
}

const tdLeft = {
  padding: '10px 0',
  color: '#1F2937',
  fontSize: '13px',
}

const tdLeftLight = {
  padding: '8px 0',
  color: '#6B7280',
  fontSize: '13px',
}

const tdRight = {
  padding: '8px 0',
  color: '#111827',
  fontSize: '13px',
  fontWeight: '600',
  textAlign: 'right' as const,
}

const tdTotal = {
  padding: '14px 0 0',
  color: '#111827',
  fontSize: '15px',
  fontWeight: '900',
  borderTop: '2px solid #E5E7EB',
}

const tdTotalRight = {
  ...tdTotal,
  color: '#FF7A00',
  fontSize: '16px',
  textAlign: 'right' as const,
}

const notesBox = {
  backgroundColor: '#FFFBEB',
  border: '1px solid #FDE68A',
  borderRadius: '8px',
  padding: '12px 16px',
  color: '#92400E',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0',
}

const addressText = {
  color: '#4B5563',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
}

const footer = {
  padding: '0 40px',
}

const footerText = {
  color: '#9CA3AF',
  fontSize: '11px',
  lineHeight: '18px',
  textAlign: 'center' as const,
}
