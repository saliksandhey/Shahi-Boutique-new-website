'use client'

import Image from 'next/image'
import { useState } from 'react'

const initialMedia = [
  { id: 1, type: 'video', src: '/media/potli_video_1.mp4', title: 'Heritage Meets Modernity', desc: 'Perfect for festive walks and evening galas.' },
  { id: 2, type: 'image', src: '/media/potli_image_new.jpeg', title: 'Exquisite Detailing', desc: '' },
  { id: 3, type: 'video', src: '/media/potli_video_2.mp4', title: 'The Shikara Collection', desc: '' },
]

export function PotliShowcase({ hideHeader = false }: { hideHeader?: boolean }) {
  const [media, setMedia] = useState(initialMedia)

  const handleSwap = (index: number) => {
    if (index === 0) return
    const newMedia = [...media]
    const temp = newMedia[0]
    newMedia[0] = newMedia[index]
    newMedia[index] = temp
    setMedia(newMedia)
  }

  return (
    <section className={`bg-white overflow-hidden ${hideHeader ? 'py-4 md:py-8' : 'py-10 md:py-16'}`}>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-12">
        {!hideHeader && (
          <div className="text-center md:text-left mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-sans font-black text-gray-900 mb-3 tracking-tighter uppercase">
              The <span className="text-[#FF7A00]">Potli</span> Collection
            </h2>
            <p className="text-gray-500 text-sm md:text-lg font-medium max-w-2xl mx-auto md:mx-0">
              Experience the elegance of handcrafted perfection. Our signature potli purses are designed to be the ultimate statement piece for every occasion.
            </p>
          </div>
        )}

        <div className={`flex overflow-x-auto md:grid md:grid-cols-12 gap-4 md:gap-6 lg:gap-8 pb-4 md:pb-0 snap-x snap-mandatory md:snap-none scroll-smooth ${hideHeader ? 'h-auto md:h-[500px] lg:h-[600px]' : 'h-auto md:h-[600px] lg:h-[700px]'}`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          
          {/* Main Video - Left Side (Desktop) / Carousel Item 1 (Mobile) */}
          <div className="shrink-0 snap-center w-[85vw] h-[55vh] md:w-auto md:h-full md:col-span-7 lg:col-span-8 rounded-3xl md:rounded-[2rem] overflow-hidden relative group">
            {media[0].type === 'video' ? (
              <video 
                key={media[0].src}
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              >
                <source src={media[0].src} type="video/mp4" />
              </video>
            ) : (
              <Image 
                src={media[0].src} 
                alt={media[0].title} 
                fill
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-8 left-8 right-8 z-10 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <h3 className="text-white font-black text-2xl lg:text-3xl uppercase tracking-widest mb-2">{media[0].title}</h3>
              {media[0].desc && <p className="text-white/90 font-medium text-sm">{media[0].desc}</p>}
            </div>
          </div>

          {/* Right Side Stack (Desktop) / Carousel Items (Mobile) */}
          <div className="shrink-0 snap-center w-[85vw] h-[55vh] md:w-auto md:h-full md:col-span-5 lg:col-span-4 flex flex-col gap-4 md:gap-6 lg:gap-8">
            
            {/* Thumbnail 1 */}
            <div 
              onClick={() => handleSwap(1)}
              className="flex-1 rounded-3xl md:rounded-[2rem] overflow-hidden relative group cursor-pointer h-1/2 md:h-auto"
            >
              {media[1].type === 'video' ? (
                <video 
                  key={media[1].src}
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                >
                  <source src={media[1].src} type="video/mp4" />
                </video>
              ) : (
                <Image 
                  src={media[1].src} 
                  alt={media[1].title} 
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-1000 ease-out"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                <span className="text-white font-bold uppercase tracking-widest text-xs">{media[1].title}</span>
              </div>
            </div>

            {/* Thumbnail 2 */}
            <div 
              onClick={() => handleSwap(2)}
              className="flex-1 rounded-3xl md:rounded-[2rem] overflow-hidden relative group cursor-pointer h-1/2 md:h-auto"
            >
              {media[2].type === 'video' ? (
                <video 
                  key={media[2].src}
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                >
                  <source src={media[2].src} type="video/mp4" />
                </video>
              ) : (
                <Image 
                  src={media[2].src} 
                  alt={media[2].title} 
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-1000 ease-out"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                <span className="text-white font-bold uppercase tracking-widest text-xs">{media[2].title}</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
