import Image from 'next/image'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-48 h-20 animate-pulse">
          <Image 
            src="/logo.png" 
            alt="Loading Shahi Boutique..." 
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="flex gap-1.5 items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
