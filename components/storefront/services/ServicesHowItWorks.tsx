'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const steps = [
  { id: '01', title: 'Book Appointment', desc: 'Schedule a time online or via WhatsApp. Let us know what you have in mind.' },
  { id: '02', title: 'Visit / Contact', desc: 'Visit our boutique or consult virtually with our head designer.' },
  { id: '03', title: 'Measurements', desc: 'We take precise measurements to ensure a flawless, custom fit.' },
  { id: '04', title: 'Choose Design', desc: 'Select fabrics, cuts, and handwork details from our premium collection.' },
  { id: '05', title: 'Stitching', desc: 'Our master tailors begin crafting your outfit with meticulous attention.' },
  { id: '06', title: 'Quality Check', desc: 'Rigorous finishing and quality inspection before we notify you.' },
  { id: '07', title: 'Delivery', desc: 'Pick up your flawless custom outfit, ready to make a statement.' },
]

export function ServicesHowItWorks() {
  const containerRef = useRef(null)
  
  // For the animated line
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  })

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  return (
    <section ref={containerRef} className="py-24 md:py-32 bg-white relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Desktop Sticky Layout */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-16">
          
          <div className="lg:col-span-5 relative mb-16 lg:mb-0">
            <div className="lg:sticky lg:top-40">
              <h2 className="text-4xl md:text-6xl font-sans font-black text-gray-900 mb-6 tracking-tighter uppercase leading-[0.9]">
                How It <br/>
                <span className="text-[#FF7A00] italic">Works</span>
              </h2>
              <p className="text-gray-500 text-lg md:text-xl font-medium max-w-md">
                A seamless, luxury journey from the first consultation to the final fitting. We make sure every detail is perfect.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 relative">
            {/* Animated Line */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gray-100 hidden sm:block">
              <motion.div 
                className="w-full bg-[#FF7A00]" 
                style={{ height: lineHeight }}
              />
            </div>

            <div className="space-y-12 sm:space-y-24">
              {steps.map((step, index) => (
                <motion.div 
                  key={step.id} 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="relative flex flex-col sm:flex-row items-start sm:items-center group"
                >
                  
                  {/* Step Number Circle */}
                  <div className="relative z-10 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white border-4 border-gray-100 shadow-sm flex items-center justify-center mb-4 sm:mb-0 sm:mr-8 group-hover:border-[#FF7A00] transition-colors duration-500 flex-shrink-0">
                    <span className="text-sm md:text-lg font-black text-gray-400 group-hover:text-[#FF7A00] transition-colors">
                      {step.id}
                    </span>
                  </div>
                  
                  {/* Step Content */}
                  <div className="bg-gray-50/50 p-6 md:p-8 rounded-[2rem] border border-transparent group-hover:border-gray-100 group-hover:bg-white group-hover:shadow-2xl group-hover:shadow-gray-200/50 transition-all duration-500 w-full">
                    <h4 className="text-xl md:text-2xl font-bold text-gray-900 uppercase tracking-widest mb-3">
                      {step.title}
                    </h4>
                    <p className="text-base font-medium text-gray-500">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
