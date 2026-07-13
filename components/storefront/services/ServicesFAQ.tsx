'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    question: "How long does stitching take?",
    answer: "Standard stitching usually takes 7-10 business days. For intricate bridal wear or custom handwork, we recommend allowing 3-4 weeks to ensure flawless detailing and perfect fittings."
  },
  {
    question: "Can I bring my own fabric?",
    answer: "Absolutely! You are welcome to bring your own premium fabrics. Our master tailors will guide you on the best cuts and styles that suit your chosen material."
  },
  {
    question: "Do you provide handwork?",
    answer: "Yes, we specialize in premium hand embroidery, including Gota Patti, pearl work, stone embellishments, mirror work, and intricate zardosi. Every piece is handcrafted by skilled artisans."
  },
  {
    question: "How do appointments work?",
    answer: "You can book an appointment online or via WhatsApp. During your session, our lead designer will discuss your vision, take precise measurements, and help you select the perfect design and fabric."
  },
  {
    question: "Can I order from another city?",
    answer: "Yes! We offer online design consultations and worldwide shipping. You can share your measurements virtually, and our team will craft your outfit and deliver it securely to your doorstep."
  }
]

export function ServicesFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-sans font-black text-gray-900 mb-4 tracking-tighter uppercase">
            Frequently Asked <span className="text-[#FF7A00]">Questions</span>
          </h2>
          <p className="text-gray-500 text-base md:text-lg font-medium">
            Everything you need to know about our boutique services.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div 
                key={index} 
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen ? 'border-[#FF7A00]/30 bg-gray-50/50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className={`text-base md:text-lg font-bold tracking-wide transition-colors duration-300 ${isOpen ? 'text-[#FF7A00]' : 'text-gray-900'}`}>
                    {faq.question}
                  </span>
                  <span className={`flex-shrink-0 ml-4 p-2 rounded-full transition-colors duration-300 ${isOpen ? 'bg-[#FF7A00]/10 text-[#FF7A00]' : 'bg-gray-50 text-gray-400'}`}>
                    {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </span>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-6 pt-0 text-gray-500 font-medium leading-relaxed text-sm md:text-base">
                    {faq.answer}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
