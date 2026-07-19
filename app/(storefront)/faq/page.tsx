'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    question: "What is your return policy?",
    answer: "We accept returns within 14 days of delivery. The items must be unworn, unwashed, and in their original condition with tags attached. Please visit our Returns & Exchanges page for full details and to initiate a return."
  },
  {
    question: "How long does shipping take?",
    answer: "Our signature Potli Purses involve intricate handwork and take 2 days to process. After processing, standard domestic shipping takes 3-5 business days, while express shipping takes 1-2 business days."
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes! We ship worldwide. International shipping costs and delivery times are calculated at checkout based on your location. Please note that customs duties and taxes are the responsibility of the customer."
  },
  {
    question: "Can I cancel or modify my order?",
    answer: "We process orders very quickly to get them to you as fast as possible. If you need to make a change or cancel, please email us at contact.shahiboutique@gmail.com within 1 hour of placing your order. We will do our best to accommodate your request, but cannot guarantee it if the order has already entered production."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order has shipped, you will receive a shipping confirmation email with a tracking link. You can also view live updates in your account's 'Orders' section."
  },
  {
    question: "Are your products truly handmade?",
    answer: "Yes, our core collection, especially our Potli Purses, are meticulously handcrafted by skilled artisans. Because of this, you may notice slight variations in the embellishments, which makes each piece entirely unique."
  }
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="bg-white min-h-screen pb-20 md:pb-32">
      {/* Header Section */}
      <div className="bg-[#F8F9FA] py-16 md:py-24 px-6 text-center rounded-b-[2rem] md:rounded-b-[3rem] mb-12 md:mb-20">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-sans font-black tracking-tighter text-gray-900 uppercase mb-4 md:mb-6 leading-none">
          FREQUENTLY ASKED
        </h1>
        <p className="text-gray-500 font-medium max-w-xl mx-auto text-sm md:text-base">
          Got questions? We've got answers. Here are some of the most common questions our customers ask.
        </p>
      </div>

      {/* Content Section */}
      <div className="mx-auto max-w-3xl px-6 sm:px-8">
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <div 
                key={index} 
                className={`border border-gray-100 rounded-3xl overflow-hidden transition-all duration-300 ${isOpen ? 'bg-[#F8F9FA] shadow-md' : 'bg-white hover:bg-gray-50'}`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none"
                >
                  <span className={`font-bold uppercase tracking-widest text-sm md:text-base transition-colors ${isOpen ? 'text-[#FF7A00]' : 'text-gray-900'}`}>
                    {faq.question}
                  </span>
                  <div className={`shrink-0 ml-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-[#FF7A00] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                </button>
                
                <div 
                  className={`px-6 md:px-8 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-8 opacity-100' : 'max-h-0 pb-0 opacity-0'}`}
                >
                  <p className="text-sm md:text-base text-gray-500 leading-relaxed font-medium">
                    {faq.answer}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-500 font-medium mb-4">Still have questions?</p>
          <a 
            href="mailto:contact.shahiboutique@gmail.com" 
            className="inline-flex items-center justify-center rounded-full bg-[#1C1C1C] text-white px-8 h-14 font-bold uppercase tracking-widest text-xs hover:bg-[#FF7A00] transition-colors shadow-lg"
          >
            Contact Customer Care
          </a>
        </div>
      </div>
    </div>
  )
}
