'use client'

import { useState } from 'react'
import { adminLogin } from '@/lib/actions/admin-auth'
import { Lock } from 'lucide-react'

export function AdminLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pin, setPin] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (pin.length !== 4) {
      setError('PIN must be 4 digits.')
      return
    }

    setLoading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('pin', pin)

    const result = await adminLogin(formData)
    
    if (result?.error) {
      setError(result.error)
      setPin('')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Side - Branding/Image (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-[#1C1C1C] relative flex-col justify-between p-12 overflow-hidden">
        {/* Subtle Background Pattern/Glow */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-[#FF7A00] to-transparent blur-[120px]" />
          <div className="absolute bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-white to-transparent blur-[100px]" />
        </div>

        <div className="relative z-10">
          <h1 className="text-white font-black text-4xl tracking-widest uppercase">Shahi Boutique</h1>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
            Control <br/>
            <span className="text-[#FF7A00]">Everything.</span>
          </h2>
          <p className="mt-6 text-gray-400 text-sm font-medium leading-relaxed">
            Welcome to the Shahi Boutique secure admin gateway. 
            Enter your secure PIN to access the dashboard.
          </p>
        </div>
        
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-600">© {new Date().getFullYear()} Shahi Boutique</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 md:p-24 bg-gray-50/50">
        <div className="w-full max-w-sm space-y-10">
          {/* Mobile Only Header */}
          <div className="md:hidden text-center space-y-2 mb-10">
            <h1 className="text-2xl font-black tracking-widest uppercase text-gray-900">Shahi Boutique</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Admin Gateway</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
            <p className="text-sm font-medium text-gray-500">Please enter your 4-digit PIN to access the dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-medium text-center flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0"></span>
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2 text-center">
                <input
                  type="password"
                  name="pin"
                  required
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '')
                    setPin(val)
                  }}
                  className="w-full max-w-[200px] mx-auto text-center px-5 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF7A00] focus:ring-4 focus:ring-[#FF7A00]/10 transition-all text-3xl font-black tracking-[1em]"
                  placeholder="••••"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || pin.length !== 4}
              className="w-full py-4 bg-[#1C1C1C] text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-[#FF7A00] hover:shadow-lg hover:shadow-[#FF7A00]/30 transition-all duration-300 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none flex justify-center items-center group mt-8"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Secure Login
                  <Lock className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
