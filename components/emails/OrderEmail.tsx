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

interface OrderEmailProps {
  orderNumber: string
  customerName: string
  orderStatus: string // 'CONFIRMED', 'SHIPPED', 'DELIVERED', etc.
  items: { name: string; quantity: number; price: number }[]
  totals: { subtotal: number; shipping: number; discount: number; total: number }
  shippingAddress: string
  trackingUrl?: string | null
  trackingNumber?: string | null
  websiteTrackingUrl?: string
}

const formatPrice = (price: number) => `₹${price.toFixed(2)}`

export default function OrderEmail({
  orderNumber = 'SHAHI-2024-123456',
  customerName = 'Salik Sandhey',
  orderStatus = 'CONFIRMED',
  items = [],
  totals = { subtotal: 0, shipping: 0, discount: 0, total: 0 },
  shippingAddress = '123 Test St',
  trackingUrl,
  trackingNumber,
  websiteTrackingUrl,
}: OrderEmailProps) {
  const isUpdate = orderStatus !== 'CONFIRMED'
  
  let headerText = 'Order Confirmation'
  let subText = 'Thank you for your order! We are getting it ready for you.'
  
  if (orderStatus === 'SHIPPED') {
    headerText = 'Your Order Has Shipped!'
    subText = 'Great news! Your order is on its way to you.'
  } else if (orderStatus === 'DELIVERED') {
    headerText = 'Your Order Has Been Delivered'
    subText = 'We hope you love your new pieces. Thank you for shopping with us.'
  } else if (orderStatus === 'REFUNDED') {
    headerText = 'Order Refunded'
    subText = 'Your order has been refunded. Please allow a few days for the funds to appear.'
  }

  return (
    <Html>
      <Head />
      <Preview>{headerText} - {orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={logo}>SHAHI BOUTIQUE</Heading>
          <Hr style={hr} />
          
          <Section style={content}>
            <Heading style={h1}>{headerText}</Heading>
            <Text style={text}>Hi {customerName},</Text>
            <Text style={text}>{subText}</Text>
            
            <Text style={orderNumText}>Order No: {orderNumber}</Text>

            {orderStatus === 'SHIPPED' && trackingUrl && (
              <Section style={trackingBox}>
                <Text style={trackingText}>Courier Tracking Number: <strong>{trackingNumber}</strong></Text>
                <a href={trackingUrl} style={buttonSecondary}>Track via Courier</a>
              </Section>
            )}

            {websiteTrackingUrl && (
              <Section style={{ textAlign: 'center', margin: '28px 0' }}>
                <a href={websiteTrackingUrl} style={button}>
                  ✦ Track Live Order Status &amp; Updates ➔
                </a>
              </Section>
            )}

            {!isUpdate && (
              <>
                <Hr style={hrLight} />
                <Heading style={h2}>Order Summary</Heading>
                
                <table style={table}>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td style={tdLeft}>
                        {item.quantity}x {item.name}
                      </td>
                      <td style={tdRight}>{formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={tdLeftLight}>Subtotal</td>
                    <td style={tdRight}>{formatPrice(totals.subtotal)}</td>
                  </tr>
                  <tr>
                    <td style={tdLeftLight}>Shipping</td>
                    <td style={tdRight}>{formatPrice(totals.shipping)}</td>
                  </tr>
                  {totals.discount > 0 && (
                    <tr>
                      <td style={tdLeftLight}>Discount</td>
                      <td style={tdRight}>-{formatPrice(totals.discount)}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={tdTotal}>Total</td>
                    <td style={tdTotalRight}>{formatPrice(totals.total)}</td>
                  </tr>
                </table>

                <Hr style={hrLight} />
                <Heading style={h2}>Shipping Address</Heading>
                <Text style={addressText}>{shippingAddress}</Text>
              </>
            )}

          </Section>
          
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Shahi Boutique | Telian Bazar, Malerkotla, Punjab 148023 India<br/>
              contact.shahiboutique@gmail.com | +91 9217890060
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  maxWidth: '600px',
}

const logo = {
  color: '#111111',
  fontSize: '24px',
  fontWeight: '900',
  letterSpacing: '4px',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const content = {
  padding: '0 48px',
}

const h1 = {
  color: '#111',
  fontSize: '24px',
  fontWeight: '700',
  margin: '24px 0 16px',
}

const h2 = {
  color: '#111',
  fontSize: '16px',
  fontWeight: '600',
  margin: '24px 0 16px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
}

const text = {
  color: '#555',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 8px',
}

const orderNumText = {
  color: '#111',
  fontSize: '15px',
  fontWeight: 'bold',
  marginTop: '16px',
  marginBottom: '24px',
}

const trackingBox = {
  backgroundColor: '#fff7ed',
  padding: '24px',
  borderRadius: '8px',
  marginBottom: '24px',
  textAlign: 'center' as const,
}

const trackingText = {
  fontSize: '14px',
  color: '#111',
  marginBottom: '16px',
}

const button = {
  backgroundColor: '#5E1218',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  letterSpacing: '1px',
}

const buttonSecondary = {
  ...button,
  backgroundColor: '#1C1C1C',
  padding: '10px 24px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const hrLight = {
  borderColor: '#f0f0f0',
  margin: '24px 0',
}

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
}

const tdLeft = {
  padding: '8px 0',
  color: '#333',
  fontSize: '14px',
}

const tdLeftLight = {
  padding: '8px 0',
  color: '#666',
  fontSize: '14px',
}

const tdRight = {
  padding: '8px 0',
  color: '#111',
  fontSize: '14px',
  textAlign: 'right' as const,
}

const tdTotal = {
  padding: '16px 0 0',
  color: '#111',
  fontSize: '16px',
  fontWeight: 'bold',
  borderTop: '1px solid #eee',
}

const tdTotalRight = {
  ...tdTotal,
  textAlign: 'right' as const,
}

const addressText = {
  color: '#555',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
}

const footer = {
  padding: '0 48px',
}

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
}
