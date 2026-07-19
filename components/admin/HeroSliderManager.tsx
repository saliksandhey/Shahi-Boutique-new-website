'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Smartphone } from 'lucide-react'
import { uploadImage } from '@/lib/actions/settings'

export type Slide = {
  id: string;
  desktopUrl: string;
  mobileUrl: string;
  link: string;
}

interface HeroSliderManagerProps {
  initialSlidesJson: string;
  initialInterval: string;
}

export function HeroSliderManager({ initialSlidesJson, initialInterval }: HeroSliderManagerProps) {
  const [slides, setSlides] = useState<Slide[]>(() => {
    try {
      return JSON.parse(initialSlidesJson || '[]')
    } catch {
      return []
    }
  })
  
  const [intervalSecs, setIntervalSecs] = useState(initialInterval || '5')
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  const handleAddSlide = () => {
    setSlides([...slides, { id: Date.now().toString(), desktopUrl: '', mobileUrl: '', link: '' }])
  }

  const handleDeleteSlide = (id: string) => {
    setSlides(slides.filter(s => s.id !== id))
  }

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newSlides = [...slides]
      const temp = newSlides[index]
      newSlides[index] = newSlides[index - 1]
      newSlides[index - 1] = temp
      setSlides(newSlides)
    } else if (direction === 'down' && index < slides.length - 1) {
      const newSlides = [...slides]
      const temp = newSlides[index]
      newSlides[index] = newSlides[index + 1]
      newSlides[index + 1] = temp
      setSlides(newSlides)
    }
  }

  const handleUpdateSlideLink = (id: string, link: string) => {
    setSlides(slides.map(s => s.id === id ? { ...s, link } : s))
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string, type: 'desktopUrl' | 'mobileUrl') => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingId(`${id}-${type}`)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await uploadImage(formData)
      if (res.success && res.url) {
        setSlides(slides.map(s => s.id === id ? { ...s, [type]: res.url } : s))
      } else {
        alert(res.error || 'Upload failed')
      }
    } catch (err) {
      console.error(err)
      alert('Upload failed')
    } finally {
      setUploadingId(null)
      e.target.value = '' // reset input
    }
  }

  return (
    <div className="space-y-6">
      {/* Hidden inputs for the main form submission */}
      <input type="hidden" name="hero_slider_slides" value={JSON.stringify(slides)} />
      <input type="hidden" name="hero_slider_interval" value={intervalSecs} />

      <div>
        <h3 className="text-lg font-black tracking-tight text-gray-900 uppercase mb-1">Hero Slider Configuration</h3>
        <p className="text-xs font-medium text-gray-500 mb-4">Manage dynamic slider images and transition speed.</p>
        
        <div className="grid gap-4 max-w-xl">
          <div className="grid gap-2">
            <Label htmlFor="hero_slider_interval_display" className="text-[10px] uppercase font-black tracking-widest text-gray-400">Slide Moving Seconds</Label>
            <Input 
              id="hero_slider_interval_display"
              type="number"
              min="1"
              max="20"
              value={intervalSecs}
              onChange={(e) => setIntervalSecs(e.target.value)}
              className="max-w-[200px] rounded-xl border-gray-200"
            />
            <p className="text-[10px] text-gray-500">How many seconds each slide is displayed.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {slides.map((slide, index) => (
          <div key={slide.id} className="border border-gray-200 rounded-xl p-4 sm:p-6 bg-gray-50 flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold uppercase tracking-widest text-gray-700">Slide {index + 1}</span>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => handleMoveSlide(index, 'up')} disabled={index === 0}>
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => handleMoveSlide(index, 'down')} disabled={index === slides.length - 1}>
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <Button type="button" variant="destructive" size="icon" className="h-8 w-8 ml-2" onClick={() => handleDeleteSlide(slide.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Desktop Image */}
              <div className="space-y-2 border-2 border-dashed border-gray-300 rounded-xl p-4 bg-white flex flex-col items-center justify-center text-center">
                <Label className="text-[10px] uppercase font-black tracking-widest text-gray-400 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> Desktop Image (2.75:1)
                </Label>
                {slide.desktopUrl && (
                  <div className="w-full h-24 relative rounded-md overflow-hidden border border-gray-100 mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={slide.desktopUrl} alt="Desktop slide" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="relative">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleUpload(e, slide.id, 'desktopUrl')}
                    disabled={uploadingId === `${slide.id}-desktopUrl`}
                    className="max-w-[200px]"
                  />
                  {uploadingId === `${slide.id}-desktopUrl` && <span className="text-xs text-blue-600 font-bold absolute -bottom-6 left-0">Uploading...</span>}
                </div>
              </div>

              {/* Mobile Image */}
              <div className="space-y-2 border-2 border-dashed border-gray-300 rounded-xl p-4 bg-white flex flex-col items-center justify-center text-center">
                <Label className="text-[10px] uppercase font-black tracking-widest text-gray-400 flex items-center gap-1">
                  <Smartphone className="w-3 h-3" /> Mobile Image (3:2)
                </Label>
                {slide.mobileUrl && (
                  <div className="w-24 h-32 relative rounded-md overflow-hidden border border-gray-100 mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={slide.mobileUrl} alt="Mobile slide" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="relative">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleUpload(e, slide.id, 'mobileUrl')}
                    disabled={uploadingId === `${slide.id}-mobileUrl`}
                    className="max-w-[200px]"
                  />
                  {uploadingId === `${slide.id}-mobileUrl` && <span className="text-xs text-blue-600 font-bold absolute -bottom-6 left-0">Uploading...</span>}
                </div>
              </div>
            </div>

            <div className="space-y-2 max-w-xl mt-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Target Link (Optional)</Label>
              <Input 
                value={slide.link} 
                onChange={(e) => handleUpdateSlideLink(slide.id, e.target.value)} 
                placeholder="e.g. /collections/bridal" 
                className="rounded-xl border-gray-200"
              />
            </div>
          </div>
        ))}
        
        {slides.length === 0 && (
          <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-500 font-medium">
            No slides added yet. Click below to add your first slide.
          </div>
        )}

        <Button type="button" onClick={handleAddSlide} variant="secondary" className="w-full sm:w-auto flex items-center gap-2 font-bold tracking-widest uppercase text-xs rounded-xl">
          <Plus className="w-4 h-4" /> Add Slide
        </Button>
      </div>
    </div>
  )
}
