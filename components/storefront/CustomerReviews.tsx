'use client'

import { useEffect, useState } from 'react'
import { Star, Quote, BadgeCheck } from 'lucide-react'

export function CustomerReviews() {
  const reviews = [
    {
      id: 1,
      name: "Priya Sharma",
      country: "India",
      flag: "in",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces",
      purchased: "Ruby Red Bridal Potli",
      review: "I bought a gorgeous Bridal Potli for my sister's wedding. The intricate handwork is exquisite and it arrived perfectly packaged. It's truly a statement piece that tied my whole look together!",
    },
    {
      id: 2,
      name: "Simran Kaur",
      country: "Canada",
      flag: "ca",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces",
      purchased: "Classic Pearl Potli",
      review: "Living in Canada, finding authentic premium Indian accessories is hard. The Pearl Potli I ordered exceeded all my expectations! The craftsmanship is pristine and shipping to Toronto was super fast.",
    },
    {
      id: 3,
      name: "Natasha K.",
      country: "New Zealand",
      flag: "nz",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
      purchased: "Golden Zari Shikara",
      review: "The Golden Zari Potli is a masterpiece. I've received so many compliments at every party. It's surprisingly spacious, fits my iPhone easily, and looks extremely premium. 10/10 recommend!",
    },
    {
      id: 4,
      name: "Ananya Verma",
      country: "India",
      flag: "in",
      image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=faces",
      purchased: "Custom Suit Stitching",
      review: "Got my festive suit custom stitched from Shahi Boutique. The fitting was absolute perfection right out of the box, and the hand embroidery is flawless. Highly recommend their bespoke services!",
    },
    {
      id: 5,
      name: "Amandeep K.",
      country: "Canada",
      flag: "ca",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=faces",
      purchased: "Bridal Couture Service",
      review: "I used their custom design consultation for my reception outfit. The virtual process was seamless and the final stitched suit arrived perfectly tailored to my exact measurements. Beyond happy!",
    },
    {
      id: 6,
      name: "Meera Desai",
      country: "New Zealand",
      flag: "nz",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=faces",
      purchased: "Premium Hand Embroidery",
      review: "Their bridal couture and embroidery service is incredible. The detailed zari and thread work on my lehenga was breathtaking. Best decision I made for my big day, the artisans are true masters.",
    },
    {
      id: 7,
      name: "Neha Gupta",
      country: "India",
      flag: "in",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=faces",
      purchased: "Emerald Velvet Clutch",
      review: "This Emerald Velvet Potli is my new favorite accessory! It adds such a luxurious touch to my ethnic outfits. The velvet feels extremely premium and the drawstring tassels are beautiful. Thank you!",
    },
    {
      id: 8,
      name: "Riya Patel",
      country: "Canada",
      flag: "ca",
      image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop&crop=faces",
      purchased: "Rose Gold Embellished Potli",
      review: "Beautiful packaging and the product itself is gorgeous. The rose gold color is so elegant and the beads are very securely attached. Will definitely be ordering more for upcoming family weddings!",
    },
    {
      id: 9,
      name: "Harleen Kaur",
      country: "New Zealand",
      flag: "nz",
      image: "https://images.unsplash.com/photo-1513245543132-31f507417b26?w=150&h=150&fit=crop&crop=faces",
      purchased: "Bridesmaid Potli Set",
      review: "Ordered potlis as gifts for my bridesmaids and they are obsessed! The quality of the fabric, the intricate work, and the sturdy handle makes it so worth it. Customer service was also super helpful.",
    }
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [reviews.length])

  // Responsive items per view
  // Mobile: 1, Tablet: 2, Desktop: 3
  const getVisibleCards = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) return 1
      if (window.innerWidth < 1024) return 2
    }
    return 3
  }

  const [itemsPerView, setItemsPerView] = useState(3)

  useEffect(() => {
    const handleResize = () => setItemsPerView(getVisibleCards())
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <section className="py-12 md:py-20 bg-[#F8F9FA] relative overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
        
        <div className="text-center mb-10 md:mb-16 relative z-10">
          <h2 className="text-3xl md:text-5xl font-sans font-black text-gray-900 mb-3 tracking-tighter uppercase">
            Words From <span className="text-[#FF7A00]">Our Muses</span>
          </h2>
          <p className="text-gray-500 text-sm md:text-lg font-medium">
            Join thousands of satisfied women worldwide.
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative">
          <div className="overflow-hidden px-2 -mx-2 py-4">
            <div 
              className="flex transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
            >
              {reviews.map((review) => (
                <div 
                  key={review.id} 
                  className="flex-shrink-0 px-4"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <div className="bg-white rounded-3xl p-8 md:p-10 h-full flex flex-col relative group hover:shadow-md transition-shadow duration-300 shadow-sm border border-gray-50">
                    
                    {/* Background Quote Icon */}
                    <Quote className="absolute top-6 right-6 w-12 h-12 text-gray-50 transition-all duration-500" strokeWidth={1} />
                    
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                      <div className="w-14 h-14 rounded-full overflow-hidden shadow-sm shrink-0">
                        <img src={review.image} alt={review.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-gray-900 tracking-wide">{review.name}</h4>
                          <BadgeCheck className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <img src={`https://flagcdn.com/${review.flag}.svg`} alt={review.country} className="w-4 h-3 object-cover rounded-sm shadow-sm" />
                          <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">{review.country}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stars */}
                    <div className="flex gap-1 mb-4 relative z-10">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#FF7A00] text-[#FF7A00]" />
                      ))}
                    </div>

                    {/* Purchased Item */}
                    <div className="mb-4 relative z-10">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Purchased: </span>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#FF7A00]">{review.purchased}</span>
                    </div>

                    {/* Review Text */}
                    <p className="text-gray-700 text-[15px] leading-relaxed font-medium flex-grow relative z-10 italic">
                      "{review.review}"
                    </p>

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-3 mt-10">
            {reviews.slice(0, reviews.length - itemsPerView + 1).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx 
                    ? 'bg-[#FF7A00] w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
