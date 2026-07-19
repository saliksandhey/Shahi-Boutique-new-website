'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { motion, useScroll, useTransform, Variants } from 'framer-motion'
import { useRef } from 'react'

export function ServicesHero() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.21, 0.47, 0.32, 0.98], // Custom spring-like easing
      },
    },
  }

  return (
    <section ref={containerRef} className="relative bg-white pt-24 pb-16 overflow-hidden sm:pt-32 sm:pb-24 lg:pb-32 min-h-[90vh] flex items-center">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full z-10 relative">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <motion.div 
            className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-6 lg:text-left flex flex-col justify-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 variants={itemVariants} className="text-5xl font-black tracking-tighter text-gray-900 sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl uppercase leading-[0.9]">
              <span className="block">Our</span>
              <span className="block">Boutique</span>
              <span className="block text-[#FF7A00] italic pr-4">Services</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="mt-6 text-base text-gray-500 sm:mt-8 sm:text-xl lg:text-lg xl:text-xl font-medium max-w-md mx-auto lg:mx-0">
              From custom stitching to premium handwork, we create outfits with precision, elegance, and attention to every detail.
            </motion.p>
            
            <motion.div variants={itemVariants} className="mt-10 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/book-appointment"
                  className="group relative flex items-center justify-center rounded-full bg-[#111111] px-8 py-4 text-base font-bold uppercase tracking-widest text-white overflow-hidden transition-all hover:scale-105 shadow-xl"
                >
                  <span className="relative z-10 flex items-center">
                    Book Appointment
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-[#FF7A00] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out" />
                </Link>
                <Link
                  href="https://wa.me/yourwhatsappnumber"
                  target="_blank"
                  className="flex items-center justify-center rounded-full border-2 border-gray-200 bg-transparent px-8 py-4 text-base font-bold uppercase tracking-widest text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  <MessageCircle className="mr-2 h-5 w-5 text-[#25D366]" />
                  WhatsApp Us
                </Link>
              </div>
            </motion.div>
          </motion.div>
          
          <div className="hidden lg:flex relative lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:items-center">
            <motion.div 
              style={{ y, opacity }}
              className="relative mx-auto w-full rounded-[2rem] lg:max-w-md overflow-hidden aspect-[3/4]"
            >
              <Image
                src="/media/services_hero.png"
                alt="Premium boutique tailoring"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-center"
                priority
              />
              {/* Premium Inner Shadow Overlay */}
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[2rem]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
