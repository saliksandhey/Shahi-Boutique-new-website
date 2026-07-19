'use client'

import { useState } from 'react'
import { updateStoreSettings, updateEmail, updatePassword, uploadHeroBanner } from '@/lib/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SettingsForm({ initialSettings, currentEmail }: { initialSettings: Record<string, string>, currentEmail: string }) {
  const [storeLoading, setStoreLoading] = useState(false)
  const [storeMessage, setStoreMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [securityLoading, setSecurityLoading] = useState(false)
  const [securityMessage, setSecurityMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [bannerLoading, setBannerLoading] = useState(false)
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [marqueeContent, setMarqueeContent] = useState(initialSettings?.marquee_content || '✦ Shop the Exclusive Bridal Collection ✦ Free Worldwide Shipping ✦')
  const [marqueeSpeed, setMarqueeSpeed] = useState(initialSettings?.marquee_speed || '25')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')

  const handleStoreSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStoreLoading(true)
    setStoreMessage(null)

    const formData = new FormData(e.currentTarget)
    
    // Only save if there's a difference
    const razorpayKeyId = formData.get('razorpay_key_id') as string
    const razorpayKeySecret = formData.get('razorpay_key_secret') as string
    const codEnabled = formData.get('cod_enabled') as string
    const newMarqueeContent = formData.get('marquee_content') as string
    const newMarqueeSpeed = formData.get('marquee_speed') as string

    if (
      razorpayKeyId === (initialSettings?.razorpay_key_id || '') &&
      razorpayKeySecret === (initialSettings?.razorpay_key_secret || '') &&
      codEnabled === (initialSettings?.cod_enabled || 'false') &&
      newMarqueeContent === (initialSettings?.marquee_content || '') &&
      newMarqueeSpeed === (initialSettings?.marquee_speed || '')
    ) {
      setStoreMessage({ type: 'success', text: 'No changes to save.' })
      setStoreLoading(false)
      return
    }

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
    let errorMsg = null
    let changed = false

    const newEmail = formData.get('email') as string
    if (newEmail && newEmail !== currentEmail) {
      changed = true
      const emailRes = await updateEmail(formData)
      if (emailRes?.error) errorMsg = emailRes.error
    }

    const newPassword = formData.get('password') as string
    if (newPassword && newPassword.length > 0) {
      changed = true
      const passRes = await updatePassword(formData)
      if (passRes?.error) errorMsg = passRes.error
      else {
        const passInput = document.getElementById('password') as HTMLInputElement
        if (passInput) passInput.value = ''
      }
    }

    if (!changed) {
      setSecurityMessage({ type: 'success', text: 'No changes to save.' })
    } else if (!errorMsg) {
      setSecurityMessage({ type: 'success', text: 'Security settings updated successfully!' })
    } else {
      setSecurityMessage({ type: 'error', text: errorMsg })
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

        <div className="space-y-4 pt-8 border-t-2 border-gray-50">
          <div>
            <h3 className="text-lg font-black tracking-tight text-gray-900 uppercase mb-1">Razorpay Configuration</h3>
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
          <p className="text-xs font-medium text-gray-500 mb-4">Update your admin credentials via Supabase Authentication.</p>
          
          <div className="grid gap-4 max-w-xl">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-[10px] uppercase font-black tracking-widest text-gray-400">Admin Email Address</Label>
              <Input 
                id="email" 
                name="email" 
                type="email"
                defaultValue={currentEmail} 
                required
                className="rounded-xl border-gray-200"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-[10px] uppercase font-black tracking-widest text-gray-400">New Password (Optional)</Label>
              <Input 
                id="password" 
                name="password" 
                type="password"
                placeholder="Leave blank to keep current password"
                minLength={6}
                className="rounded-xl border-gray-200"
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
