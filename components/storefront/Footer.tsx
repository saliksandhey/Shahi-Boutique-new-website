'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

export function Footer({ categories }: { categories: any[] }) {
  const [openSection, setOpenSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section)
  }

  return (
    <footer className="bg-white pt-16 md:pt-24 pb-8 md:pb-12 px-6 sm:px-8 lg:px-12 border-t border-gray-100">
      <div className="mx-auto max-w-[1400px]">
        
        {/* Top Section: Grid */}
        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-0 md:gap-12 lg:gap-8 mb-12 md:mb-20 text-center md:text-left">
          
          {/* Column 1: Brand Story */}
          <div className="lg:pr-8 flex flex-col items-center md:items-start">
            <Link href="/" className="font-sans text-4xl md:text-4xl font-black tracking-tighter text-gray-900 block mb-4 md:mb-6 uppercase">
              SHAHI
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed font-medium mb-6 md:mb-8 px-4 md:px-0">
              A legacy of exquisite craftsmanship and modern edge. We bring you the finest streetwear fashion, meticulously designed for the modern muse.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-900 hover:bg-[#FF7A00] hover:border-[#FF7A00] hover:text-white transition-all duration-300 shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-900 hover:bg-[#FF7A00] hover:border-[#FF7A00] hover:text-white transition-all duration-300 shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-900 hover:bg-[#FF7A00] hover:border-[#FF7A00] hover:text-white transition-all duration-300 shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation Links & Policies */}
          <div className="flex flex-col md:grid md:grid-cols-2 lg:col-span-3 lg:grid-cols-3 gap-0 md:gap-8 lg:gap-8 text-left md:text-left w-full mt-10 md:mt-0">
            {/* Column 2: Quick Links */}
            <div className="border-b border-gray-100 md:border-none py-4 md:py-0">
              <button 
                onClick={() => toggleSection('quick-links')} 
                className="flex justify-between w-full items-center md:cursor-auto"
              >
                <h3 className="font-sans font-bold text-gray-900 text-lg md:mb-6 tracking-wide">Quick Links</h3>
                <ChevronDown className={`w-5 h-5 md:hidden transition-transform ${openSection === 'quick-links' ? 'rotate-180' : ''}`} />
              </button>
              <ul className={`space-y-3 md:space-y-4 mt-4 md:mt-0 ${openSection === 'quick-links' ? 'block' : 'hidden md:block'}`}>
                <li><Link href="/shop" className="text-sm font-medium text-gray-500 hover:text-[#FF7A00] transition-colors">Shop All</Link></li>
                <li><Link href="/shop?collection=new" className="text-sm font-medium text-gray-500 hover:text-[#FF7A00] transition-colors">New Arrivals</Link></li>
                <li><Link href="/about" className="text-sm font-medium text-gray-500 hover:text-[#FF7A00] transition-colors">Our Story</Link></li>
                <li><Link href="/contact" className="text-sm font-medium text-gray-500 hover:text-[#FF7A00] transition-colors">Contact Us</Link></li>

              </ul>
            </div>

            {/* Column 3: Policies */}
            <div className="border-b border-gray-100 md:border-none py-4 md:py-0">
              <button 
                onClick={() => toggleSection('policies')} 
                className="flex justify-between w-full items-center md:cursor-auto"
              >
                <h3 className="font-sans font-bold text-gray-900 text-lg md:mb-6 tracking-wide">Policies</h3>
                <ChevronDown className={`w-5 h-5 md:hidden transition-transform ${openSection === 'policies' ? 'rotate-180' : ''}`} />
              </button>
              <ul className={`space-y-3 md:space-y-4 mt-4 md:mt-0 ${openSection === 'policies' ? 'block' : 'hidden md:block'}`}>
                <li><Link href="/shipping" className="text-sm font-medium text-gray-500 hover:text-[#FF7A00] transition-colors">Shipping</Link></li>
                <li><Link href="/returns" className="text-sm font-medium text-gray-500 hover:text-[#FF7A00] transition-colors">Returns</Link></li>
                <li><Link href="/privacy" className="text-sm font-medium text-gray-500 hover:text-[#FF7A00] transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="text-sm font-medium text-gray-500 hover:text-[#FF7A00] transition-colors">Terms</Link></li>
                <li><Link href="/faq" className="text-sm font-medium text-gray-500 hover:text-[#FF7A00] transition-colors">FAQ</Link></li>
              </ul>
            </div>

            {/* Column 4: Customer Care */}
            <div className="border-b border-gray-100 md:border-none py-4 md:py-0 w-full">
              <button 
                onClick={() => toggleSection('customer-care')} 
                className="flex justify-between w-full items-center md:cursor-auto"
              >
                <h3 className="font-sans font-bold text-gray-900 text-lg md:mb-6 tracking-wide">Customer Care</h3>
                <ChevronDown className={`w-5 h-5 md:hidden transition-transform ${openSection === 'customer-care' ? 'rotate-180' : ''}`} />
              </button>
              <ul className={`space-y-4 mt-4 md:mt-0 ${openSection === 'customer-care' ? 'block' : 'hidden md:block'}`}>
                <li className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-900 font-bold mb-1">Email Us</span>
                  <a href="mailto:contact.shahiboutique@gmail.com" className="text-sm font-medium text-gray-500 hover:text-[#FF7A00] transition-colors">contact.shahiboutique@gmail.com</a>
                </li>
                <li className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-900 font-bold mb-1">Call Us</span>
                  <a href="tel:+919217890060" className="text-sm font-medium text-gray-500 hover:text-[#FF7A00] transition-colors">+91 9217890060</a>
                </li>
                <li className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-900 font-bold mb-1">WhatsApp</span>
                  <a href="https://wa.me/919041762820" className="text-sm font-medium text-gray-500 hover:text-[#FF7A00] transition-colors">+91 9041762820</a>
                </li>
                <li className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-900 font-bold mb-1">Working Hours</span>
                  <span className="text-sm font-medium text-gray-500">Mon - Fri: 9:00 AM - 6:00 PM EST</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
          
          <p className="text-[10px] md:text-xs text-gray-500 tracking-widest uppercase text-center md:text-left font-bold order-3 md:order-1 mt-4 md:mt-0">
            &copy; {new Date().getFullYear()} Shahi Boutique. All Rights Reserved.
          </p>

          <div className="hidden md:flex flex-col sm:flex-row items-center gap-6 order-2">
            {/* Payment Icons */}
            <div className="flex items-center justify-center gap-4">
              {/* UPI */}
              <svg viewBox="0 0 512 512" className="h-4 w-auto grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300" fill="currentColor">
                <path d="M410.5 45.5H101.5C70.6 45.5 45.5 70.6 45.5 101.5v309c0 30.9 25.1 56 56 56h309c30.9 0 56-25.1 56-56v-309c0-30.9-25.1-56-56-56zm-175.7 348.6L164 324h35.8v-77h70.8v77h35.8l-71.6 70.1zM294 213h-44.5V108.6H294c30.9 0 56 25.1 56 56s-25.1 48.4-56 48.4zm-14.7-29.2h29.2c16.1 0 29.2-13.1 29.2-29.2s-13.1-29.2-29.2-29.2h-29.2v58.4z" />
              </svg>
              {/* Mastercard */}
              <svg viewBox="0 0 38 24" className="h-5 w-auto grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <path d="M12 24C18.627 24 24 18.627 24 12C24 5.373 18.627 0 12 0C5.373 0 0 5.373 0 12C0 18.627 5.373 24 12 24Z" fill="#EB001B"/>
                <path d="M26 24C32.627 24 38 18.627 38 12C38 5.373 32.627 0 26 0C19.373 0 14 5.373 14 12C14 18.627 19.373 24 26 24Z" fill="#F79E1B"/>
                <path d="M24 12C24 15.65 22.37 18.914 19.5 21.056C16.63 18.914 15 15.65 15 12C15 8.35 16.63 5.086 19.5 2.944C22.37 5.086 24 8.35 24 12Z" fill="#FF5F00"/>
              </svg>
              {/* Visa */}
              <svg viewBox="0 0 38 24" className="h-3.5 w-auto grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <path d="M13.623 20.378h3.336l3.14-14.283H16.76l-2.174 10.66-.46-2.183-1.637-7.857a.897.897 0 0 0-.85-.62h-5.23l-.066.31c1.077.275 2.296.69 3.033 1.144.225.138.288.262.366.526l2.973 12.303h3.415V20.378h-.469z" fill="#1434CB"/>
                <path d="M29.566 6.095h-2.585c-.534 0-.936.15-1.173.693l-4.593 11.08h3.518l.702-1.956h4.3l.407 1.956h3.09l-3.666-11.773zm-3.056 6.945l1.092-2.986 1.488-4.108.674 3.237.585 2.766-.184.148-3.655.943v-.002z" fill="#1434CB"/>
                <path d="M8.79 6.095H4.21C3.843 6.095 3.514 6.28 3.376 6.61L.034 20.377h3.425l.685-1.895h4.19l.397 1.896h3.013L8.79 6.095zm-2.984 6.726l1.066-2.895 1.45-3.98h.04l.658 3.136.57 2.7-.18.14-3.604.9z" fill="#1434CB"/>
                <path d="M34.704 6.095c-1.32-.34-3.535-.618-5.32-.618-2.673 0-4.558 1.433-4.57 3.493-.016 1.523 1.348 2.373 2.37 2.88 1.047.518 1.402.85 1.402 1.312 0 .71-.84 1.04-1.616 1.04-1.353 0-2.078-.198-3.19-.696l-.45-.213-.482 3.036c.792.365 2.25.684 3.77.697 2.85 0 4.704-1.42 4.72-3.633.016-1.22-.72-2.146-2.274-2.898-.946-.492-1.527-.82-1.527-1.32 0-.613.673-1.252 1.554-1.252 1.085-.015 1.868.256 2.477.536l.295.14.478-2.51v-.004z" fill="#1434CB"/>
              </svg>
              {/* PayPal */}
              <svg viewBox="0 0 38 24" className="h-5 w-auto grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <path d="M14.07 19.34l-1.37 8.66h3.69c.28 0 .52-.22.56-.5l.98-6.17.06-.32.06-.38c.04-.28.28-.5.56-.5h1.61c3.55 0 5.6-1.74 6.22-5.06.27-1.46.12-2.73-.39-3.7-.87-1.64-2.76-2.38-5.46-2.38H15.1c-.28 0-.52.22-.56.5l-.47 2.96v.01l-.98 6.17-.02.13v.58z" fill="#003087"/>
                <path d="M13.62 20.18l-.51 3.22h-3.6l1.83-11.58c.04-.28.28-.5.56-.5h5.48c2.19 0 3.76.57 4.58 1.63.45.58.74 1.33.8 2.22H17.4c-.9 0-1.68.65-1.8 1.53l-1.12 7.07-.86 5.41h3.62l.86-5.41c.04-.28.28-.5.56-.5h1.61c.45 0 .86-.03 1.25-.09-1.2 1.6-3.4 2.27-6.04 2.27H14.1c-.28 0-.52-.22-.56-.5l.08-.43v-.01z" fill="#0079C1"/>
                <path d="M18.8 8.94H13.6l1.37-8.66C15.01.22 15.25 0 15.53 0h5.48c2.81 0 4.81.82 5.76 2.6.51.97.66 2.24.39 3.7-.62 3.32-2.67 5.06-6.22 5.06H19.33c-.28 0-.52-.22-.56-.5l.03-.18v-1.74z" fill="#00457C"/>
              </svg>
            </div>
            
            {/* Trust Badges */}
            <div className="flex items-center justify-center sm:border-l border-gray-200 sm:pl-6">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Norton_by_Symantec_logo.svg/1200px-Norton_by_Symantec_logo.svg.png" alt="Norton Secure" className="h-6 w-auto grayscale opacity-30" />
            </div>
          </div>

        </div>

      </div>
    </footer>
  )
}
