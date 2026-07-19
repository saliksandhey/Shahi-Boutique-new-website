'use server'

import { render } from '@react-email/render'
import nodemailer from 'nodemailer'
import OrderEmail from '@/components/emails/OrderEmail'

// Define the transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'contact.shahiboutique@gmail.com',
    pass: process.env.EMAIL_APP_PASSWORD, // e.g., 'abcd efgh ijkl mnop'
  },
})

export async function sendOrderConfirmationEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  items: { name: string; quantity: number; price: number }[],
  totals: { subtotal: number; shipping: number; discount: number; total: number },
  shippingAddress: string
) {
  try {
    if (!process.env.EMAIL_APP_PASSWORD) {
      console.warn("EMAIL_APP_PASSWORD not set. Skipping email send.")
      return { success: false, error: "Email configuration missing." }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const websiteTrackingUrl = `${siteUrl}/account/orders`

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
      from: '"Shahi Boutique" <contact.shahiboutique@gmail.com>',
      to: customerEmail,
      subject: `Order Confirmation - ${orderNumber}`,
      html: emailHtml,
    }

    await transporter.sendMail(options)
    return { success: true }
  } catch (error: any) {
    console.error('Failed to send order confirmation email:', error)
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
    if (!process.env.EMAIL_APP_PASSWORD) {
      console.warn("EMAIL_APP_PASSWORD not set. Skipping email send.")
      return { success: false, error: "Email configuration missing." }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const websiteTrackingUrl = `${siteUrl}/account/orders`

    const emailHtml = await render(
      OrderEmail({
        orderNumber,
        customerName,
        orderStatus: newStatus.toUpperCase(),
        items: [], // Not needed for status update emails
        totals: { subtotal: 0, shipping: 0, discount: 0, total: 0 },
        shippingAddress: '',
        trackingNumber,
        trackingUrl,
        websiteTrackingUrl
      })
    )

    let subject = `Order Update - ${orderNumber}`
    if (newStatus.toUpperCase() === 'SHIPPED') subject = `Your Order Has Shipped! - ${orderNumber}`
    if (newStatus.toUpperCase() === 'DELIVERED') subject = `Your Order Has Been Delivered! - ${orderNumber}`

    const options = {
      from: '"Shahi Boutique" <contact.shahiboutique@gmail.com>',
      to: customerEmail,
      subject,
      html: emailHtml,
    }

    await transporter.sendMail(options)
    return { success: true }
  } catch (error: any) {
    console.error('Failed to send order status email:', error)
    return { success: false, error: error.message }
  }
}
