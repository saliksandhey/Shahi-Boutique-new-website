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

interface PasswordResetEmailProps {
  customerName?: string
  otpCode: string
  expiryMinutes?: number
}

export default function PasswordResetEmail({
  customerName = 'Valued Customer',
  otpCode = '8492',
  expiryMinutes = 10,
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Password Reset Code: {otpCode} — Shahi Boutique</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Banner */}
          <Section style={headerBanner}>
            <Heading style={logo}>SHAHI BOUTIQUE</Heading>
            <Text style={badge}>✦ Account Security ✦</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Password Reset Code</Heading>
            <Text style={greeting}>Hello {customerName},</Text>
            <Text style={introText}>
              We received a request to reset the password for your Shahi Boutique account. Use the 4-digit verification code below to set your new password:
            </Text>

            {/* OTP Box */}
            <Section style={otpCard}>
              <Text style={otpLabel}>YOUR 4-DIGIT VERIFICATION CODE</Text>
              <Text style={otpNumber}>{otpCode}</Text>
              <Text style={expiryText}>⏱ Valid for {expiryMinutes} minutes only</Text>
            </Section>

            <Text style={noteText}>
              Enter this code on the password reset screen to continue. If you did not request a password reset, please ignore this email or contact our support if you have concerns.
            </Text>

            <Hr style={hrLight} />

            <Section style={securityBox}>
              <Text style={securityTitle}>🔒 Security Tip</Text>
              <Text style={securityDesc}>
                Never share this verification code with anyone. Shahi Boutique staff will never ask for your password or OTP.
              </Text>
            </Section>
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
  maxWidth: '560px',
  overflow: 'hidden',
  border: '1px solid #e5e7eb',
}

const headerBanner = {
  backgroundColor: '#1C1C1C',
  padding: '28px 24px',
  textAlign: 'center' as const,
}

const logo = {
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: '900',
  letterSpacing: '5px',
  margin: '0 0 6px',
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
  padding: '32px 36px',
}

const h1 = {
  color: '#111827',
  fontSize: '22px',
  fontWeight: '800',
  margin: '0 0 16px',
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
  margin: '0 0 24px',
}

const otpCard = {
  backgroundColor: '#FFF7ED',
  border: '2px dashed #FF7A00',
  borderRadius: '16px',
  padding: '24px 20px',
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const otpLabel = {
  color: '#9A3412',
  fontSize: '11px',
  fontWeight: '900',
  letterSpacing: '2px',
  margin: '0 0 8px',
}

const otpNumber = {
  color: '#7C2D12',
  fontSize: '36px',
  fontWeight: '900',
  letterSpacing: '10px',
  fontFamily: 'monospace',
  margin: '0 0 8px',
}

const expiryText = {
  color: '#EA580C',
  fontSize: '12px',
  fontWeight: '700',
  margin: '0',
}

const noteText = {
  color: '#6B7280',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 16px',
}

const securityBox = {
  backgroundColor: '#F9FAFB',
  borderRadius: '10px',
  padding: '14px 16px',
  border: '1px solid #E5E7EB',
}

const securityTitle = {
  color: '#374151',
  fontSize: '12px',
  fontWeight: '800',
  margin: '0 0 4px',
}

const securityDesc = {
  color: '#6B7280',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0',
}

const hr = {
  borderColor: '#E5E7EB',
  margin: '24px 0',
}

const hrLight = {
  borderColor: '#F3F4F6',
  margin: '24px 0 16px',
}

const footer = {
  padding: '0 36px',
}

const footerText = {
  color: '#9CA3AF',
  fontSize: '11px',
  lineHeight: '18px',
  textAlign: 'center' as const,
}
