'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Scissors, Sparkles, Palette, Ruler } from 'lucide-react'
import Link from 'next/link'

const servicesData = [
  {
    id: 'stitching',
    title: 'Custom Suit Stitching',
    icon: Scissors,
    imageSrc: '/media/service_suit_stitching.png',
    description: 'Precision tailoring that transforms premium fabrics into flawless, perfectly fitted suits tailored to your exact measurements and unique style.',
    items: [
      'Punjabi Suit', 'Ladies Suit', 'Designer Suit', 
      'Kurti Stitching', 'Blouse Stitching', 'Salwar Stitching', 'Palazzo Stitching', 
      'Pant Stitching', 'Anarkali', 'Sharara', 'Gharara', 
      'Lehenga', 'Dupatta Finishing', 'Custom Fitting'
    ]
  },
  {
    id: 'bridal',
    title: 'Bridal Couture',
    icon: Sparkles,
    imageSrc: '/media/service_bridal_couture.png',
    description: 'Breathtaking bridal ensembles crafted with exquisite detailing, luxurious fabrics, and masterful embroidery for your most unforgettable day.',
    items: [
      'Bridal Suit', 'Bridal Lehenga', 'Bridal Dupatta', 
      'Custom Design', 'Bridal Handwork', 'Bridal Embroidery', 
      'Bridal Alteration', 'Wedding Consultation', 'Reception Outfit', 
      'Engagement Outfit'
    ]
  },
  {
    id: 'embroidery',
    title: 'Premium Hand Embroidery',
    icon: Palette,
    imageSrc: '/media/service_hand_embroidery.png',
    description: 'Intricate, timeless handwork by master artisans, preserving the rich heritage of traditional threadwork and contemporary embellishments.',
    items: [
      'Hand Embroidery', 'Machine Embroidery', 'Gota Patti Work', 'Zari Work', 
      'Stone Work', 'Pearl Work', 'Mirror Work', 'Sequin Work', 'Lace Work', 
      'Tassel Work', 'Patch Work', 'Applique Work', 'Beads Work', 'Cut Dana', 
      'Thread Embroidery'
    ]
  },
  {
    id: 'consultation',
    title: 'Custom Design Consultation',
    icon: Ruler,
    imageSrc: '/media/service_design_consultation.png',
    description: 'Work one-on-one with our expert designers to conceptualize, plan, and create the ultimate personalized wardrobe that reflects your true elegance.',
    items: [
      'Custom Measurements', 'Perfect Fitting', 'Design Consultation', 
      'Fabric Consultation', 'Style Consultation', 'Color Consultation', 
      'Outfit Planning', 'Fashion Consultation', 'Neck Design', 
      'Sleeve Design'
    ]
  }
]

export function ServicesEditorial() {
  return (
    <div className="w-full bg-white">
      {servicesData.map((service, index) => {
        // Alternate layout: Image Left on even (0, 2), Image Right on odd (1, 3)
        const isImageLeft = index % 2 === 0
        const Icon = service.icon

        return (
          <section key={service.id} className="w-full relative bg-white border-b border-gray-100 last:border-0">
            {/* 
              MOBILE STICKY PARALLAX BACKGROUND
              Only visible/sticky on mobile. Hidden/standard on lg screens.
            */}
            <div className="block lg:hidden sticky top-20 w-full h-[55vh] -z-0">
              <div className="w-full h-full relative overflow-hidden bg-gray-100">
                <img src={service.imageSrc} alt={service.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="absolute top-6 left-6 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md bg-white/20 border border-white/30">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* MAIN CONTENT WRAPPER */}
            <div className="max-w-[1600px] mx-auto lg:px-12 relative z-10">
              
              {/* 
                MOBILE: Slides up over the sticky image (mt-[45vh] bg-white rounded-t-3xl)
                DESKTOP: Standard flex layout (py-32)
              */}
              <div className={`
                flex flex-col lg:flex-row items-center
                mt-[45vh] lg:mt-0 
                bg-white lg:bg-transparent 
                rounded-t-[2.5rem] lg:rounded-none
                px-6 py-12 lg:py-32
                gap-10 lg:gap-24 
                ${isImageLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'}
                shadow-[0_-20px_40px_rgba(0,0,0,0.1)] lg:shadow-none
              `}>
                
                {/* DESKTOP IMAGE (Hidden on mobile) */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 50 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="hidden lg:block w-full lg:w-1/2"
                >
                  <div className="w-full aspect-[4/5] rounded-[2rem] relative overflow-hidden shadow-2xl shadow-black/10 bg-gray-100">
                    <img src={service.imageSrc} alt={service.title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/10 transition-opacity hover:bg-transparent duration-500" />
                    <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    <div className="absolute top-8 left-8 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md bg-white/20 border border-white/30 shadow-lg">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </motion.div>

                {/* Text Side (50% width on Desktop) */}
                <motion.div 
                  initial={{ opacity: 0, x: isImageLeft ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full lg:w-1/2 flex flex-col"
                >
                  
                  {/* Title & Description */}
                  <div className="mb-12">
                    <span className="text-sm font-bold tracking-[0.2em] text-[#FF7A00] uppercase mb-4 block">
                      Service {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <h2 className="text-4xl md:text-6xl xl:text-7xl font-black uppercase tracking-tighter text-gray-900 leading-[0.9] mb-6">
                      {service.title}
                    </h2>
                    <p className="text-lg md:text-xl text-gray-500 leading-relaxed font-medium">
                      {service.description}
                    </p>
                  </div>

                  {/* Sub-services perfectly aligned grid */}
                  <div className="border-t border-gray-200 pt-12">
                    <h4 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 md:mb-8">
                      Included in this service
                    </h4>
                    
                    {/* Mobile: Tight 1-col or 2-col, Desktop: 2-col */}
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 md:gap-y-4">
                      {service.items.map((item, i) => (
                        <motion.li 
                          key={item}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: 0.1 + (i * 0.05) }}
                          className="flex items-center text-gray-700 font-medium text-base md:text-lg py-1 md:py-2 group cursor-pointer"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] mr-3 md:mr-4 opacity-50 group-hover:opacity-100 group-hover:scale-150 transition-all shrink-0" />
                          <span className="group-hover:text-black transition-colors">{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Call to Action */}
                  <div className="mt-12 md:mt-16 w-full sm:w-auto">
                    <Link 
                      href="/book-appointment" 
                      className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-[#111111] px-8 py-4 text-sm font-bold uppercase tracking-widest text-white hover:bg-[#FF7A00] transition-colors duration-300"
                    >
                      Book Appointment
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </div>

                </motion.div>

              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
