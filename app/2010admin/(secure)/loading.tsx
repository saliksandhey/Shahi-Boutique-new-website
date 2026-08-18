export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-[#09090B]/20 border-t-[#09090B] rounded-full animate-spin"></div>
        <p className="text-sm font-medium tracking-tight text-gray-500">Loading Dashboard...</p>
      </div>
    </div>
  )
}
