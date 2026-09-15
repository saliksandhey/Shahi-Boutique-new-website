'use client'

import { useState } from 'react'
import { updateStoreSettings, updateAdminPin, uploadHeroBanner } from '@/lib/actions/settings'
import { sendTestEmailAction } from '@/lib/actions/emails'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Power, Eye, AlertTriangle, Mail, Send, RefreshCw } from 'lucide-react'
import { MaintenanceScreen } from '@/components/storefront/MaintenanceScreen'

export function SettingsForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [storeLoading, setStoreLoading] = useState(false)
  const [storeMessage, setStoreMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [securityLoading, setSecurityLoading] = useState(false)
  const [securityMessage, setSecurityMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [bannerLoading, setBannerLoading] = useState(false)
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [testEmailRecipient, setTestEmailRecipient] = useState(initialSettings?.maintenance_email || initialSettings?.smtp_user || 'contact.shahiboutique@gmail.com')
  const [testEmailLoading, setTestEmailLoading] = useState(false)
  const [testEmailStatus, setTestEmailStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const [maintenanceMode, setMaintenanceMode] = useState(initialSettings?.maintenance_mode === 'true')
  const [maintenanceTitle, setMaintenanceTitle] = useState(initialSettings?.maintenance_title || "The site is currently down for maintenance")
  const [maintenanceMessage, setMaintenanceMessage] = useState(initialSettings?.maintenance_message || "We apologize for any inconveniences caused. We've almost done.")
  const [maintenanceNotice, setMaintenanceNotice] = useState(initialSettings?.maintenance_notice || "Our artisans & technical team are currently upgrading the online boutique experience.")
  const [maintenancePhone, setMaintenancePhone] = useState(initialSettings?.maintenance_phone || "+91 90417-62820")
  const [maintenanceEmail, setMaintenanceEmail] = useState(initialSettings?.maintenance_email || "info@shahiboutique.com")
  const [maintenanceWhatsapp, setMaintenanceWhatsapp] = useState(initialSettings?.maintenance_whatsapp || "919041762820")
  const [showMaintenancePreview, setShowMaintenancePreview] = useState(false)

  const [marqueeContent, setMarqueeContent] = useState(initialSettings?.marquee_content || '✦ Shop the Exclusive Bridal Collection ✦ Free Worldwide Shipping ✦')
  const [marqueeSpeed, setMarqueeSpeed] = useState(initialSettings?.marquee_speed || '25')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')

  const handleSendTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      setTestEmailStatus({ type: 'error', message: 'Please enter a valid email address.' })
      return
    }
    setTestEmailLoading(true)
    setTestEmailStatus(null)

    const res = await sendTestEmailAction(testEmailRecipient)
    if (res.success) {
      setTestEmailStatus({ type: 'success', message: `✓ Test email sent successfully to ${testEmailRecipient}! Check your inbox (or spam folder).` })
    } else {
      setTestEmailStatus({ type: 'error', message: `✗ Failed: ${res.error}` })
    }
    setTestEmailLoading(false)
  }

  const handleStoreSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStoreLoading(true)
    setStoreMessage(null)

    const formData = new FormData(e.currentTarget)

    const result = await updateStoreSettings(formData)
    if (result.success) {
      setStoreMessage({ type: 'success', text: 'Store settings saved successfully!' })
    } else {
      setStoreMessage({ type: 'error', text: result.error || 'Failed to update store settings' })
    }
    setStoreLoading(false)
  }

  const handleSecuritySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSecurityLoading(true)
    setSecurityMessage(null)

    const formData = new FormData(e.currentTarget)
    const newPin = formData.get('admin_pin') as string
    
    if (newPin && newPin.length === 4) {
      const pinRes = await updateAdminPin(formData)
      if (pinRes?.error) {
        setSecurityMessage({ type: 'error', text: pinRes.error })
      } else {
        setSecurityMessage({ type: 'success', text: 'Admin PIN updated successfully!' })
        const pinInput = document.getElementById('admin_pin') as HTMLInputElement
        if (pinInput) pinInput.value = ''
      }
    } else {
      setSecurityMessage({ type: 'error', text: 'Please enter a valid 4-digit PIN.' })
    }
    
    setSecurityLoading(false)
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0]
    if (!file) return

    setBannerLoading(true)
    setBannerMessage(null)

    const formData = new FormData()
    formData.append('hero_banner', file)
    formData.append('type', type)

    const result = await uploadHeroBanner(formData)
    if (result.success) {
      setBannerMessage({ type: 'success', text: `${type === 'desktop' ? 'Desktop' : 'Mobile'} hero banner uploaded successfully!` })
    } else {
      setBannerMessage({ type: 'error', text: result.error || 'Failed to upload banner.' })
    }
    setBannerLoading(false)
    e.target.value = '' // Reset input
  }

  return (
    <div className="space-y-12">
      {/* Store Settings Form */}
      <form onSubmit={handleStoreSubmit} className="space-y-12">

        {/* Website Maintenance Mode Configuration */}
        <div className="bg-[#FAF9F6] border-2 border-amber-200/80 rounded-2xl md:rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/60 pb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Power className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-black tracking-tight text-gray-900 uppercase">
                  Website Maintenance Mode (Close Storefront)
                </h3>
              </div>
              <p className="text-xs font-medium text-gray-600 max-w-xl">
                When enabled, the user-facing website is closed and visitors will only see the luxury maintenance screen. 
                <strong className="text-gray-900"> The Admin Panel remains 100% accessible to you.</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                maintenanceMode 
                  ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse' 
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${maintenanceMode ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                {maintenanceMode ? 'Website Closed (Offline)' : 'Website Public (Online)'}
              </span>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="grid gap-2 max-w-xl">
              <Label htmlFor="maintenance_mode" className="text-[10px] uppercase font-black tracking-widest text-gray-500">
                Maintenance Mode Control
              </Label>
              <select
                id="maintenance_mode"
                name="maintenance_mode"
                value={maintenanceMode ? 'true' : 'false'}
                onChange={(e) => setMaintenanceMode(e.target.value === 'true')}
                className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:ring-offset-2 transition-colors ${
                  maintenanceMode 
                    ? 'border-red-300 bg-red-50 text-red-900 font-black' 
                    : 'border-gray-200 bg-white text-gray-900'
                }`}
              >
                <option value="false">🟢 Disabled — Website is Live &amp; Publicly Open</option>
                <option value="true">🔴 Enabled — Close Website (Show Maintenance Screen to Visitors)</option>
              </select>
            </div>

              <div className="space-y-4 pt-4 border-t border-amber-200/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-800">
                    Maintenance Screen Content &amp; Contact Info
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    (Visible to customers when Maintenance Mode is Enabled)
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="maintenance_title" className="text-[10px] uppercase font-black tracking-widest text-gray-500">
                      Maintenance Heading
                    </Label>
                    <Input 
                      id="maintenance_title"
                      name="maintenance_title"
                      value={maintenanceTitle}
                      onChange={(e) => setMaintenanceTitle(e.target.value)}
                      placeholder="The site is currently down for maintenance"
                      className="rounded-xl border-gray-200 bg-white"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="maintenance_notice" className="text-[10px] uppercase font-black tracking-widest text-gray-500">
                      Sub-Notice / Status Text
                    </Label>
                    <Input 
                      id="maintenance_notice"
                      name="maintenance_notice"
                      value={maintenanceNotice}
                      onChange={(e) => setMaintenanceNotice(e.target.value)}
                      placeholder="Our artisans are currently upgrading the online experience."
                      className="rounded-xl border-gray-200 bg-white"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="maintenance_message" className="text-[10px] uppercase font-black tracking-widest text-gray-500">
                    Maintenance Description / Message
                  </Label>
                  <textarea 
                    id="maintenance_message"
                    name="maintenance_message"
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    rows={2}
                    placeholder="We apologize for any inconveniences caused. We've almost done."
                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4 pt-2">
                  <div className="grid gap-2">
                    <Label htmlFor="maintenance_whatsapp" className="text-[10px] uppercase font-black tracking-widest text-gray-500">
                      WhatsApp Number (For Direct Orders)
                    </Label>
                    <Input 
                      id="maintenance_whatsapp"
                      name="maintenance_whatsapp"
                      value={maintenanceWhatsapp}
                      onChange={(e) => setMaintenanceWhatsapp(e.target.value)}
                      placeholder="919041762820"
                      className="rounded-xl border-gray-200 bg-white"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="maintenance_phone" className="text-[10px] uppercase font-black tracking-widest text-gray-500">
                      Support Phone Number
                    </Label>
                    <Input 
                      id="maintenance_phone"
                      name="maintenance_phone"
                      value={maintenancePhone}
                      onChange={(e) => setMaintenancePhone(e.target.value)}
                      placeholder="+91 90417-62820"
                      className="rounded-xl border-gray-200 bg-white"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="maintenance_email" className="text-[10px] uppercase font-black tracking-widest text-gray-500">
                      Support Email
                    </Label>
                    <Input 
                      id="maintenance_email"
                      name="maintenance_email"
                      type="email"
                      value={maintenanceEmail}
                      onChange={(e) => setMaintenanceEmail(e.target.value)}
                      placeholder="info@shahiboutique.com"
                      className="rounded-xl border-gray-200 bg-white"
                    />
                  </div>
                </div>

                {/* Preview Toggle */}
                <div className="pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowMaintenancePreview(!showMaintenancePreview)}
                    className="text-xs font-bold text-[#FF7A00] hover:underline flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {showMaintenancePreview ? 'Hide Maintenance Screen Preview' : 'Show Maintenance Screen Preview in Admin'}
                  </button>

                  {showMaintenancePreview && (
                    <div className="mt-4 border border-gray-300 rounded-2xl overflow-hidden shadow-sm bg-white">
                      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-600 flex justify-between items-center">
                        <span>Customer View Preview</span>
                        <span className="text-gray-400">Read-Only</span>
                      </div>
                      <div className="p-2 sm:p-4 scale-90 sm:scale-95 origin-top pointer-events-none">
                        <MaintenanceScreen settings={{
                          maintenance_title: maintenanceTitle,
                          maintenance_message: maintenanceMessage,
                          maintenance_notice: maintenanceNotice,
                          maintenance_phone: maintenancePhone,
                          maintenance_email: maintenanceEmail,
                          maintenance_whatsapp: maintenanceWhatsapp
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
          </div>
        </div>

        {/* Automated Customer Email Notifications (SMTP) */}
        <div className="bg-white border border-gray-200 rounded-2xl md:rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="p-2 bg-amber-50 text-[#FF7A00] rounded-xl">
                  <Mail className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-black tracking-tight text-gray-900 uppercase">
                  Customer Email Notifications (Order Invoices &amp; Tracking)
                </h3>
              </div>
              <p className="text-xs font-medium text-gray-500 max-w-xl">
                Emails are automatically sent to the customer&apos;s email address entered at checkout for Order Confirmation, Invoices, Status updates (Shipped, Delivered), and Courier Tracking links.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="smtp_user" className="text-[10px] uppercase font-black tracking-widest text-gray-500">
                  Sender Gmail Address
                </Label>
                <Input 
                  id="smtp_user"
                  name="smtp_user"
                  type="email"
                  defaultValue={initialSettings?.smtp_user || 'contact.shahiboutique@gmail.com'}
                  placeholder="contact.shahiboutique@gmail.com"
                  className="rounded-xl border-gray-200"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="smtp_sender_name" className="text-[10px] uppercase font-black tracking-widest text-gray-500">
                  Sender Display Name
                </Label>
                <Input 
                  id="smtp_sender_name"
                  name="smtp_sender_name"
                  defaultValue={initialSettings?.smtp_sender_name || 'Shahi Boutique'}
                  placeholder="Shahi Boutique"
                  className="rounded-xl border-gray-200"
                />
              </div>
            </div>

            <div className="grid gap-2 max-w-xl">
              <Label htmlFor="smtp_password" className="text-[10px] uppercase font-black tracking-widest text-gray-500">
                Google 16-Character App Password
              </Label>
              <Input 
                id="smtp_password"
                name="smtp_password"
                type="password"
                defaultValue={initialSettings?.smtp_password || ''}
                placeholder="Enter 16-character App Password (e.g. abcd efgh ijkl mnop)"
                className="rounded-xl border-gray-200 font-mono text-sm"
              />
              <p className="text-[11px] text-gray-500 leading-relaxed">
                <strong>How to get Google App Password:</strong> Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-[#FF7A00] font-bold underline">Google Account Security &gt; App Passwords</a>, create a password for &quot;Shahi Website&quot;, and copy the 16 letters here.
              </p>
            </div>

            {/* Send Test Email Card */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-[#FF7A00]" />
                  Verify &amp; Test Live Email Sending
                </span>
                <span className="text-[10px] text-gray-400 font-medium">Instant Test</span>
              </div>
              <p className="text-xs text-gray-500">
                Test if automated emails are reaching inboxes. <em>(Save Store Settings first if you just updated your App Password)</em>.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <Input 
                  type="email"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  placeholder="Enter email to receive test message"
                  className="rounded-xl border-gray-200 bg-white sm:max-w-xs"
                />
                <Button
                  type="button"
                  disabled={testEmailLoading}
                  onClick={handleSendTestEmail}
                  variant="outline"
                  className="rounded-xl border-[#1C1C1C] text-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white font-bold text-xs"
                >
                  {testEmailLoading ? (
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5" /> Send Test Email
                    </span>
                  )}
                </Button>
              </div>

              {testEmailStatus && (
                <div className={`p-3 rounded-xl text-xs font-bold ${
                  testEmailStatus.type === 'success' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {testEmailStatus.message}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-8 border-t-2 border-gray-50">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-black tracking-tight text-gray-900 uppercase">Cashfree Payment Gateway (Recommended)</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800">
                Domestic UPI + International Cards
              </span>
            </div>
            <p className="text-xs font-medium text-gray-500 mb-4">
              Get your App ID &amp; Secret Key from <a href="https://merchant.cashfree.com" target="_blank" rel="noopener noreferrer" className="text-[#FF7A00] underline font-bold">Cashfree Merchant Dashboard</a> under Payment Gateway &gt; Developers &gt; API Keys.
            </p>
            
            <div className="grid gap-4 max-w-xl">
              <div className="grid gap-2">
                <Label htmlFor="cashfree_app_id" className="text-[10px] uppercase font-black tracking-widest text-gray-400">Cashfree App ID / Client ID</Label>
                <Input 
                  id="cashfree_app_id" 
                  name="cashfree_app_id" 
                  defaultValue={initialSettings?.cashfree_app_id || ''} 
                  placeholder="e.g. 123456... or TEST..."
                  className="rounded-xl border-gray-200"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="cashfree_secret_key" className="text-[10px] uppercase font-black tracking-widest text-gray-400">Cashfree Secret Key</Label>
                <Input 
                  id="cashfree_secret_key" 
                  name="cashfree_secret_key" 
                  type="password"
                  defaultValue={initialSettings?.cashfree_secret_key || ''} 
                  placeholder="e.g. cfsk_ma_..."
                  className="rounded-xl border-gray-200"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cashfree_mode" className="text-[10px] uppercase font-black tracking-widest text-gray-400">Environment Mode</Label>
                <select
                  id="cashfree_mode"
                  name="cashfree_mode"
                  defaultValue={initialSettings?.cashfree_mode || 'PRODUCTION'}
                  className="flex h-10 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:ring-offset-2"
                >
                  <option value="PRODUCTION">Production (Live Payments)</option>
                  <option value="SANDBOX">Sandbox (Test Mode)</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="active_payment_gateway" className="text-[10px] uppercase font-black tracking-widest text-gray-400">Primary Active Gateway</Label>
                <select
                  id="active_payment_gateway"
                  name="active_payment_gateway"
                  defaultValue={initialSettings?.active_payment_gateway || 'CASHFREE'}
                  className="flex h-10 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:ring-offset-2"
                >
                  <option value="CASHFREE">Cashfree Payments (UPI, Cards &amp; International)</option>
                  <option value="RAZORPAY">Razorpay</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-black tracking-tight text-gray-900 uppercase mb-1">Razorpay Configuration (Alternative)</h3>
            <p className="text-xs font-medium text-gray-500 mb-4">You can find these in your Razorpay Dashboard under Settings &gt; API Keys.</p>
            
            <div className="grid gap-4 max-w-xl">
              <div className="grid gap-2">
                <Label htmlFor="razorpay_key_id" className="text-[10px] uppercase font-black tracking-widest text-gray-400">Key ID</Label>
                <Input 
                  id="razorpay_key_id" 
                  name="razorpay_key_id" 
                  defaultValue={initialSettings?.razorpay_key_id || ''} 
                  placeholder="rzp_test_..."
                  className="rounded-xl border-gray-200"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="razorpay_key_secret" className="text-[10px] uppercase font-black tracking-widest text-gray-400">Key Secret</Label>
                <Input 
                  id="razorpay_key_secret" 
                  name="razorpay_key_secret" 
                  type="password"
                  defaultValue={initialSettings?.razorpay_key_secret || ''} 
                  placeholder="Enter secret key"
                  className="rounded-xl border-gray-200"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-black tracking-tight text-gray-900 uppercase mb-1">Announcement Marquee</h3>
            <p className="text-xs font-medium text-gray-500 mb-4">Manage the scrolling text banner below the hero section.</p>
            
            <div className="grid gap-6">
              <div className="grid gap-4 max-w-xl">
                <div className="grid gap-2">
                  <Label htmlFor="marquee_content" className="text-[10px] uppercase font-black tracking-widest text-gray-400">Marquee Content</Label>
                  <Input 
                    id="marquee_content" 
                    name="marquee_content" 
                    value={marqueeContent}
                    onChange={(e) => setMarqueeContent(e.target.value)}
                    placeholder="✦ Your text here ✦"
                    className="rounded-xl border-gray-200"
                  />
                  <p className="text-[10px] text-gray-400">Use special characters like ✦ to separate points.</p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="marquee_speed" className="text-[10px] uppercase font-black tracking-widest text-gray-400">Scrolling Speed</Label>
                  <select
                    id="marquee_speed"
                    name="marquee_speed"
                    value={marqueeSpeed}
                    onChange={(e) => setMarqueeSpeed(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:ring-offset-2"
                  >
                    <option value="40">Slow</option>
                    <option value="25">Normal</option>
                    <option value="15">Fast</option>
                    <option value="10">Very Fast</option>
                  </select>
                </div>
              </div>

              {/* Live Preview Container */}
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 mt-2">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-600">Live Preview</span>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                      type="button" 
                      onClick={() => setPreviewMode('desktop')}
                      className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-colors ${previewMode === 'desktop' ? 'bg-white shadow-sm text-[#1C1C1C]' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      Desktop
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setPreviewMode('mobile')}
                      className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-colors ${previewMode === 'mobile' ? 'bg-white shadow-sm text-[#1C1C1C]' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      Mobile
                    </button>
                  </div>
                </div>
                <div className={`mx-auto bg-white transition-all duration-300 ${previewMode === 'desktop' ? 'w-full' : 'w-[375px] border-x border-gray-200'}`}>
                  {/* The Marquee Preview */}
                  <div className="relative w-full bg-[#5E1218] border-y border-[#4A0D11] overflow-hidden py-3">
                    <div 
                      className="flex whitespace-nowrap"
                      style={{ animation: `marquee ${marqueeSpeed}s linear infinite` }}
                    >
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center mx-6">
                          <span className="text-white text-sm font-medium tracking-wider">
                            {marqueeContent}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-black tracking-tight text-gray-900 uppercase mb-1">Payment Methods</h3>
            <p className="text-xs font-medium text-gray-500 mb-4">Configure which payment methods are available to customers at checkout.</p>
            
            <div className="grid gap-4 max-w-xl">
              <div className="grid gap-2">
                <Label htmlFor="cod_enabled" className="text-[10px] uppercase font-black tracking-widest text-gray-400">Cash on Delivery (COD)</Label>
                <select
                  id="cod_enabled"
                  name="cod_enabled"
                  defaultValue={initialSettings?.cod_enabled || 'false'}
                  className="flex h-10 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:ring-offset-2"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {storeMessage && (
          <div className={`p-4 rounded-xl text-xs font-bold uppercase tracking-widest ${storeMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {storeMessage.text}
          </div>
        )}

        <Button type="submit" disabled={storeLoading} className="w-full sm:w-auto bg-[#1C1C1C] hover:bg-[#FF7A00] text-white rounded-full px-8 transition-colors">
          {storeLoading ? 'Saving...' : 'Save Store Settings'}
        </Button>
      </form>

      {/* Security Settings Form */}
      <form onSubmit={handleSecuritySubmit} className="space-y-6 pt-8 border-t-2 border-gray-50">
        <div>
          <h3 className="text-lg font-black tracking-tight text-gray-900 uppercase mb-1">Security & Login</h3>
          <p className="text-xs font-medium text-gray-500 mb-4">Update the secure 4-digit PIN used to access the admin gateway.</p>
          
          <div className="grid gap-4 max-w-xl">
            <div className="grid gap-2">
              <Label htmlFor="admin_pin" className="text-[10px] uppercase font-black tracking-widest text-gray-400">New Admin PIN</Label>
              <Input 
                id="admin_pin" 
                name="admin_pin" 
                type="text"
                pattern="\d{4}"
                maxLength={4}
                required
                placeholder="Enter 4-digit PIN"
                className="rounded-xl border-gray-200 tracking-[0.5em] font-black"
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, '')
                }}
              />
            </div>
          </div>
        </div>

        {securityMessage && (
          <div className={`p-4 rounded-xl text-xs font-bold uppercase tracking-widest ${securityMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {securityMessage.text}
          </div>
        )}

        <Button type="submit" disabled={securityLoading} className="w-full sm:w-auto bg-[#1C1C1C] hover:bg-[#FF7A00] text-white rounded-full px-8 transition-colors">
          {securityLoading ? 'Saving...' : 'Save Security Settings'}
        </Button>
      </form>
    </div>
  )
}
