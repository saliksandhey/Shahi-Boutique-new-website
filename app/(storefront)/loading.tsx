export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#FF7A00]/20 border-t-[#FF7A00] rounded-full animate-spin"></div>
        <p className="text-sm font-medium tracking-widest text-gray-400 uppercase">Loading Collection...</p>
      </div>
    </div>
  )
}
