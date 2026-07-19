'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { HeroSliderManager } from './HeroSliderManager'
import { updateBannerSettings } from '@/lib/actions/settings'
import { useRouter } from 'next/navigation'

export function BannerSettingsForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await updateBannerSettings(formData)
      if (result.success) {
        setMessage({ type: 'success', text: 'Banner settings updated successfully!' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update settings.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-12">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <HeroSliderManager 
            initialSlidesJson={initialSettings?.hero_slider_slides || '[]'} 
            initialInterval={initialSettings?.hero_slider_interval || '5'}
          />
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-xs font-bold uppercase tracking-widest ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-[#1C1C1C] hover:bg-[#FF7A00] text-white rounded-full px-8 transition-colors">
          {loading ? 'Saving...' : 'Save Banners'}
        </Button>
      </form>
    </div>
  )
}
