'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Scissors, Sparkles, Palette, Ruler } from 'lucide-react'

// Define the Data Structure
const servicesData = [
  {
    id: 'stitching',
    title: 'Custom Suit Stitching',
    icon: Scissors,
    heroImage: 'bg-stone-900',
    description: 'Precision tailoring that transforms premium fabrics into flawless, perfectly fitted suits tailored to your exact measurements and unique style.',
    items: [
      { name: 'Punjabi Suit Stitching', desc: 'Authentic traditional tailoring.' },
      { name: 'Ladies Suit Stitching', desc: 'Elegant everyday and festive wear.' },
      { name: 'Designer Suit Stitching', desc: 'Bespoke high-end fashion.' },
      { name: 'Kurti Stitching', desc: 'Modern and classic kurti designs.' },
      { name: 'Blouse Stitching', desc: 'Perfectly fitted designer blouses.' },
      { name: 'Salwar Stitching', desc: 'Comfortable and stylish salwars.' },
      { name: 'Palazzo Stitching', desc: 'Flowy, contemporary palazzos.' },
      { name: 'Pant Stitching', desc: 'Crisp, tailored trouser fits.' },
      { name: 'Anarkali Stitching', desc: 'Regal and flowing anarkali suits.' },
      { name: 'Sharara Stitching', desc: 'Classic tiered sharara styles.' },
      { name: 'Gharara Stitching', desc: 'Traditional heavy ghararas.' },
      { name: 'Lehenga Stitching', desc: 'Flawless lehenga skirts.' },
      { name: 'Dupatta Finishing', desc: 'Premium edging and tassels.' },
      { name: 'Custom Fitting', desc: 'Alterations for a perfect silhouette.' }
    ]
  },
  {
    id: 'bridal',
    title: 'Bridal Couture',
    icon: Sparkles,
    heroImage: 'bg-[#FF7A00]',
    description: 'Breathtaking bridal ensembles crafted with exquisite detailing, luxurious fabrics, and masterful embroidery for your most unforgettable day.',
    items: [
      { name: 'Bridal Suit Stitching', desc: 'Heavy, premium bridal suits.' },
      { name: 'Bridal Lehenga Stitching', desc: 'The ultimate wedding lehenga.' },
      { name: 'Bridal Dupatta Styling', desc: 'Perfectly draped and finished.' },
      { name: 'Bridal Custom Design', desc: 'Bespoke creation from scratch.' },
      { name: 'Bridal Handwork', desc: 'Intricate artisan detailing.' },
      { name: 'Bridal Embroidery', desc: 'Masterful traditional patterns.' },
      { name: 'Bridal Alteration', desc: 'Flawless last-minute fitting.' },
      { name: 'Wedding Outfit Consultation', desc: 'Expert bridal styling.' },
      { name: 'Reception Outfit Stitching', desc: 'Glamorous evening wear.' },
      { name: 'Engagement Outfit Stitching', desc: 'Elegant pre-wedding attire.' }
    ]
  },
  {
    id: 'embroidery',
    title: 'Premium Hand Embroidery',
    icon: Palette,
    heroImage: 'bg-[#2A2A2A]',
    description: 'Intricate, timeless handwork by master artisans, preserving the rich heritage of traditional threadwork and contemporary embellishments.',
    items: [
      { name: 'Hand Embroidery', desc: 'Delicate manual threadwork.' },
      { name: 'Machine Embroidery', desc: 'Precise and complex patterns.' },
      { name: 'Gota Patti Work', desc: 'Traditional Rajasthani craft.' },
      { name: 'Zari Work', desc: 'Rich gold and silver thread.' },
      { name: 'Stone Work', desc: 'Sparkling gem embellishments.' },
      { name: 'Pearl Work', desc: 'Elegant pearl detailing.' },
      { name: 'Mirror Work', desc: 'Classic reflective accents.' },
      { name: 'Sequin Work', desc: 'Glamorous shimmering details.' },
      { name: 'Lace Work', desc: 'Delicate border finishing.' },
      { name: 'Tassel Work', desc: 'Custom handcrafted latkans.' },
      { name: 'Patch Work', desc: 'Creative fabric combinations.' },
      { name: 'Applique Work', desc: 'Layered fabric design.' },
      { name: 'Beads Work', desc: 'Intricate glass bead styling.' },
      { name: 'Cut Dana Work', desc: 'Sharp, geometric embellishments.' },
      { name: 'Thread Embroidery', desc: 'Vibrant multi-color artistry.' }
    ]
  },
  {
    id: 'consultation',
    title: 'Custom Design Consultation',
    icon: Ruler,
    heroImage: 'bg-[#F0E6DD]',
    description: 'Work one-on-one with our expert designers to conceptualize, plan, and create the ultimate personalized wardrobe that reflects your true elegance.',
    items: [
      { name: 'Custom Measurements', desc: 'Precise body profiling.' },
      { name: 'Perfect Fitting', desc: 'Ensuring a flawless drape.' },
      { name: 'Design Consultation', desc: 'Visualizing your dream outfit.' },
      { name: 'Fabric Consultation', desc: 'Selecting the perfect materials.' },
      { name: 'Style Consultation', desc: 'Matching trends to your body type.' },
      { name: 'Color Consultation', desc: 'Finding your perfect palette.' },
      { name: 'Outfit Planning', desc: 'Coordinating full wardrobes.' },
      { name: 'Fashion Consultation', desc: 'Expert modern styling advice.' },
      { name: 'Neck Design Consultation', desc: 'Choosing the right neckline.' },
      { name: 'Sleeve Design Consultation', desc: 'Detailing the perfect sleeves.' }
    ]
  }
]

export function ServicesExplorer() {
  const [activeTab, setActiveTab] = useState(servicesData[0].id)

  const activeService = servicesData.find(s => s.id === activeTab) || servicesData[0]

  return (
    <section className="bg-gray-50 text-gray-900 w-full min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        
        <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
          
          {/* ==========================================
              LEFT SIDE: Sticky Navigation 
              ========================================== */}
          <div className="w-full lg:w-[350px] xl:w-[400px] shrink-0">
            <div className="sticky top-32 flex flex-col gap-2">
              <h3 className="text-sm font-bold tracking-[0.2em] text-gray-400 uppercase mb-6 ml-4">
                Main Services
              </h3>
              
              <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 hide-scrollbar snap-x lg:snap-none gap-3">
                {servicesData.map((service) => {
                  const isActive = activeTab === service.id
                  const Icon = service.icon
                  
                  return (
                    <button
                      key={service.id}
                      onClick={() => setActiveTab(service.id)}
                      className={`
                        group relative flex items-center w-max lg:w-full text-left px-6 py-5 rounded-2xl transition-all duration-300 snap-start
                        ${isActive ? 'bg-white shadow-xl shadow-black/5' : 'hover:bg-white/60 text-gray-500 hover:text-gray-900'}
                      `}
                    >
                      <Icon className={`w-5 h-5 mr-4 transition-colors duration-300 ${isActive ? 'text-[#FF7A00]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                      <span className={`text-lg font-bold tracking-tight transition-colors duration-300 ${isActive ? 'text-gray-900' : ''}`}>
                        {service.title}
                      </span>
                      
                      {/* Active Indicator Line */}
                      {isActive && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[60%] bg-[#FF7A00] rounded-r-full hidden lg:block"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ==========================================
              RIGHT SIDE: Dynamic Content 
              ========================================== */}
          <div className="flex-1 w-full min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeService.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col w-full"
              >
                
                {/* 1. Large Hero Image */}
                <div className={`w-full h-[300px] md:h-[450px] rounded-[2rem] mb-10 relative overflow-hidden shadow-2xl shadow-black/10 ${activeService.heroImage}`}>
                  <div className="absolute inset-0 bg-black/20" />
                  
                  {/* Decorative Elements replacing a real photo for now */}
                  <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at center, white 10%, transparent 10%)', backgroundSize: '20px 20px' }}></div>
                  
                  <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-md bg-white/20 border border-white/30`}>
                      <activeService.icon className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>

                {/* 2. Service Title */}
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-gray-900 mb-6">
                  {activeService.title}
                </h2>

                {/* 3. Short Premium Description */}
                <p className="text-xl md:text-2xl text-gray-500 leading-relaxed font-medium max-w-3xl mb-16">
                  {activeService.description}
                </p>

                {/* 4. Services Included Grid (Image Cards) */}
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">
                    Services Included
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeService.items.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                        className="group relative h-[320px] rounded-[1.5rem] overflow-hidden bg-white shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col"
                      >
                        {/* Image Background (Scaling on hover) */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 group-hover:scale-110 transition-transform duration-700 ease-out" />
                        
                        {/* Dark Overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
                        
                        {/* Content Container */}
                        <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
                          
                          {/* Service Name */}
                          <h5 className="text-white text-2xl font-bold tracking-tight mb-2 transform group-hover:-translate-y-2 transition-transform duration-500">
                            {item.name}
                          </h5>
                          
                          {/* Small Description */}
                          <p className="text-gray-300 text-sm font-medium mb-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:-translate-y-2 transition-all duration-500 delay-75">
                            {item.desc}
                          </p>
                          
                          {/* Explore Arrow */}
                          <div className="flex items-center text-[#FF7A00] font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:-translate-y-2 transition-all duration-500 delay-100">
                            Explore Service 
                            <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  )
}
