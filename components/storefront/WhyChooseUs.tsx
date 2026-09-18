import { ShieldCheck, Truck, RefreshCcw, Sparkles } from 'lucide-react'

export function WhyChooseUs() {
  const features = [
    {
      name: 'Premium Quality',
      description: 'Hand-selected fabrics & pure embroidery crafted to endure.',
      icon: Sparkles,
    },
    {
      name: 'Worldwide Shipping',
      description: 'Fast, insured doorstep delivery across 50+ countries.',
      icon: Truck,
    },
    {
      name: 'Bespoke Fitting',
      description: 'Custom-tailored to your exact measurements with perfection.',
      icon: RefreshCcw,
    },
    {
      name: 'Secure Payments',
      description: '100% encrypted & trusted international payment gateways.',
      icon: ShieldCheck,
    },
  ]

  return (
    <section className="py-10 sm:py-14 md:py-18 bg-[#F8F9FA] px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="w-8 h-[1px] bg-[#FF7A00]" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#FF7A00]">
              WHY CHOOSE US
            </span>
            <span className="w-8 h-[1px] bg-[#FF7A00]" />
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-5xl font-sans font-black text-gray-900 mb-2 tracking-tighter uppercase">
            THE SHAHI <span className="text-[#FF7A00]">EXPERIENCE</span>
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm md:text-base font-medium max-w-lg mx-auto">
            Uncompromising Quality & Bespoke Couture Tailoring
          </p>
        </div>

        {/* Unified Luxury Benefits Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-4 sm:p-6 md:p-8 shadow-xs">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {features.map((feature) => (
              <div 
                key={feature.name} 
                className="flex flex-col items-center sm:items-start text-center sm:text-left p-2.5 sm:p-3 rounded-xl hover:bg-gray-50/80 transition-colors duration-200 group"
              >
                <div className="mb-2 sm:mb-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 bg-[#1C1C1C] group-hover:bg-[#FF7A00] rounded-xl flex items-center justify-center shadow-xs transition-colors duration-300">
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF7A00] group-hover:text-white transition-colors duration-300" strokeWidth={2} />
                  </div>
                </div>

                <h3 className="text-xs sm:text-sm md:text-base font-black uppercase tracking-tight text-gray-900 mb-1">
                  {feature.name}
                </h3>
                
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 leading-snug font-normal">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </section>
  )
}
