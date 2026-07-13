'use client'

import Link from 'next/link'
import Image from 'next/image'

export function CategorySlider({ categories }: { categories: any[] }) {
  if (!categories || categories.length === 0) return null

  return (
    <section className="py-6 md:py-10 bg-white">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-12">
        <div className="flex gap-4 sm:gap-6 md:gap-8 overflow-x-auto pb-6 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/shop?category=${cat.slug}`} className="flex flex-col items-center shrink-0 group snap-start cursor-pointer">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#FF7A00] transition-all duration-300 p-1 bg-white mb-3 shadow-sm hover:shadow-lg">
                <div className="w-full h-full rounded-full overflow-hidden relative bg-gray-100">
                  {cat.image ? (
                    <Image src={cat.image} alt={cat.name} fill sizes="(max-width: 768px) 100px, 150px" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 font-bold text-xl md:text-3xl uppercase">
                      {cat.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-widest text-gray-900 group-hover:text-[#FF7A00] transition-colors text-center max-w-[80px] sm:max-w-[100px] md:max-w-[120px] truncate w-full px-2">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
