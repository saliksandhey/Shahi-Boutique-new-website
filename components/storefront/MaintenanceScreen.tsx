'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Phone, Mail, MessageCircle, Shield, Sparkles } from 'lucide-react'

interface MaintenanceScreenProps {
  settings?: Record<string, string>
}

export function MaintenanceScreen({ settings }: MaintenanceScreenProps) {
  const title = settings?.maintenance_title || "The site is currently down for maintenance"
  const message = settings?.maintenance_message || "We apologize for any inconveniences caused. We've almost done."
  const notice = settings?.maintenance_notice || "Our artisans & technical team are currently upgrading the online boutique experience with exclusive collections."
  const phone = settings?.maintenance_phone || "+91 90417-62820"
  const email = settings?.maintenance_email || "info@shahiboutique.com"
  const whatsapp = (settings?.maintenance_whatsapp || "919041762820").replace(/[^0-9]/g, '')
  const whatsappUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Hello Shahi Boutique! I am reaching out from your website for an order/inquiry.')}`

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1C1C1C] flex flex-col justify-between selection:bg-[#FF7A00] selection:text-white relative overflow-hidden font-sans">
      
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FF7A00]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-radial from-[#00D1FF]/5 to-transparent rounded-full blur-3xl opacity-60"></div>
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-28 h-9 sm:w-36 sm:h-10">
            <Image 
              src="/logo.png" 
              alt="Shahi Boutique" 
              fill 
              className="object-contain object-left" 
              priority
            />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3.5 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#FF7A00] animate-ping"></span>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#1C1C1C]">
            Maintenance Mode
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-6 py-6 sm:py-12 flex flex-col items-center text-center">
        
        {/* Animated Graphic (Matching reference cable/plug illustration with luxury aesthetics) */}
        <div className="relative w-full max-w-[460px] h-32 sm:h-40 my-2 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 500 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Left Cable Track */}
            <path 
              d="M0 80 H140 C155 80 165 95 165 110 C165 115 170 120 178 120 H205" 
              stroke="#67E8F9" 
              strokeWidth="10" 
              strokeLinecap="round" 
              className="opacity-90"
            />
            {/* Left Plug Base */}
            <rect x="205" y="100" width="35" height="40" rx="8" fill="#0284C7" />
            <rect x="200" y="108" width="8" height="24" rx="4" fill="#38BDF8" />
            
            {/* Left Male Prongs */}
            <rect x="240" y="107" width="22" height="8" rx="2" fill="#0284C7" />
            <rect x="240" y="125" width="22" height="8" rx="2" fill="#0284C7" />

            {/* Middle Spark / Energy Particles */}
            <g className="animate-pulse">
              <circle cx="272" cy="111" r="3" fill="#FF7A00" />
              <circle cx="272" cy="129" r="3" fill="#D4AF37" />
              <circle cx="265" cy="98" r="2" fill="#38BDF8" />
              <circle cx="279" cy="142" r="2" fill="#22C55E" />
            </g>

            {/* Right Female Socket */}
            <rect x="290" y="100" width="38" height="40" rx="8" fill="#16A34A" />
            <rect x="284" y="106" width="6" height="28" rx="3" fill="#4ADE80" />

            {/* Right Cable Track */}
            <path 
              d="M328 120 H345 C355 120 360 115 360 110 C360 95 370 80 385 80 H500" 
              stroke="#22C55E" 
              strokeWidth="10" 
              strokeLinecap="round" 
              className="opacity-90"
            />
          </svg>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase text-gray-900 leading-tight max-w-3xl font-serif">
          {title}
        </h1>

        {/* Subtitle / Message */}
        <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl font-medium leading-relaxed">
          {message}
        </p>

        {notice && (
          <p className="mt-2 text-xs sm:text-sm text-gray-400 max-w-xl">
            {notice}
          </p>
        )}

        {/* Concierge / Urgent Order CTA Banner */}
        <div className="mt-8 sm:mt-10 p-5 sm:p-6 bg-white border border-gray-100 rounded-3xl shadow-sm max-w-xl w-full">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#FF7A00]" />
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-gray-900">
              Need Assistance or Urgent Custom Orders?
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-4 font-normal">
            Our team is active and accepting bespoke boutique orders directly on WhatsApp &amp; Phone.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a 
              href={whatsappUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-sm hover:scale-105"
            >
              <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
              Chat on WhatsApp
            </a>

            <a 
              href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1C1C1C] hover:bg-[#FF7A00] text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-sm hover:scale-105"
            >
              <Phone className="w-3.5 h-3.5" />
              Call Concierge
            </a>
          </div>
        </div>

      </main>

      {/* Footer Info Bar */}
      <footer className="relative z-10 w-full border-t border-gray-200/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-gray-500">
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2">
            <span>
              <strong className="text-gray-900 font-bold">You can contact us:</strong>
            </span>
            <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="hover:text-[#FF7A00] transition-colors font-semibold">
              Phone: {phone}
            </a>
            <span className="hidden sm:inline text-gray-300">|</span>
            <a href={`mailto:${email}`} className="hover:text-[#FF7A00] transition-colors font-semibold">
              Email: {email}
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/2010admin"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-wider"
              title="Administrator Portal"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Access</span>
            </Link>
          </div>

        </div>
      </footer>

    </div>
  )
}
