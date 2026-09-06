'use client'

import { useState, useRef } from 'react'
import { adminLogin } from '@/lib/actions/admin-auth'
import { Lock, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react'
import Image from 'next/image'

export function AdminLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pin, setPin] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function executeLogin(pinValue: string) {
    if (pinValue.length !== 4 || loading) return
    setLoading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('pin', pinValue)

    const result = await adminLogin(formData)
    
    if (result?.error) {
      setError(result.error)
      setPin('')
      setLoading(false)
      if (inputRef.current) inputRef.current.focus()
    }
  }

  function handlePinChange(val: string) {
    const clean = val.replace(/D/g, '').slice(0, 4)
    setPin(clean)
    setError(null)
    if (clean.length === 4) {
      executeLogin(clean)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0A0A0A] text-white selection:bg-[#FF7A00] selection:text-white relative overflow-hidden font-sans">
      {/* Background Decorative Glows */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-[#FF7A00]/20 via-[#D4AF37]/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-to-tl from-[#FF7A00]/15 via-purple-900/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* Left Column: Luxury Brand Experience (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 border-r border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="flex items-center gap-3">
          <div className="relative w-36 h-10">
            <Image
              src="/logo.png"
              alt="SHAHI BOUTIQUE"
              fill
              className="object-contain object-left invert brightness-0"
              priority
            />
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/20">Admin Portal</span>
        </div>

        <div className="max-w-lg space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span>Exclusive Control Gateway</span>
          </div>
          <h1 className="text-5xl xl:text-6xl font-serif font-black tracking-tight text-white leading-[1.1]">
            Control <br />
            <span className="bg-gradient-to-r from-[#FF7A00] via-[#FFA048] to-[#D4AF37] bg-clip-text text-transparent">
              Everything.
            </span>
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed font-medium">
            Welcome to the Shahi Boutique secure gateway. Enter your 4-digit PIN to access the store dashboard.
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold tracking-wider uppercase border-t border-white/5 pt-6">
          <span>&copy; {new Date().getFullYear()} Shahi Boutique</span>
          <span className="flex items-center gap-1.5 text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Protected & Encrypted
          </span>
        </div>
      </div>

      {/* Right Column: Interactive Login Area */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF7A00]/20 to-[#FF7A00]/5 border border-[#FF7A00]/30 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-[#FF7A00]/10">
              <Lock className="w-7 h-7 text-[#FF7A00]" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">Welcome Back</h2>
            <p className="text-xs text-gray-400 font-medium">Enter your 4-digit PIN to access the dashboard.</p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold text-center flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}

          {/* Hidden Controlled Input + 4 Luxury Visual Boxes */}
          <div className="relative">
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              disabled={loading}
              onChange={(e) => handlePinChange(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20"
              autoFocus
            />

            <div className="flex items-center justify-center gap-3 sm:gap-4" onClick={() => inputRef.current?.focus()}>
              {[0, 1, 2, 3].map((index) => {
                const isFilled = pin.length > index
                const isCurrent = pin.length === index
                return (
                  <div
                    key={index}
                    className={`w-14 h-16 sm:w-16 sm:h-20 rounded-2xl border flex items-center justify-center text-2xl font-black transition-all duration-300 ${
                      isCurrent
                        ? 'border-[#FF7A00] bg-[#FF7A00]/10 shadow-lg shadow-[#FF7A00]/20 scale-105'
                        : isFilled
                        ? 'border-white/30 bg-white/10 text-white'
                        : 'border-white/10 bg-white/[0.02] text-gray-600'
                    }`}
                  >
                    {isFilled ? (
                      <span className="w-3.5 h-3.5 rounded-full bg-[#FF7A00] shadow-sm shadow-[#FF7A00]" />
                    ) : (
                      <span className="text-gray-600 text-lg">•</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Status Indicator / Submit Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={loading || pin.length !== 4}
              onClick={() => executeLogin(pin)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#FFA048] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#FF7A00]/20 hover:shadow-[#FF7A00]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2 group cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Secure Login
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
