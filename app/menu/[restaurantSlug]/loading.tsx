export default function MenuLoading() {
  return (
    <div className="min-h-dvh bg-black px-4 sm:px-8 pb-16">
      {/* Header skeleton */}
      <div className="pt-12 pb-8 flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full shimmer-skeleton" />
        <div className="w-32 h-3 rounded-full shimmer-skeleton" />
        <div className="w-56 h-8 rounded-xl shimmer-skeleton" />
        <div className="w-72 h-3 rounded-full shimmer-skeleton mt-1" />
      </div>

      {/* Category nav skeleton */}
      <div className="h-12 flex gap-2 mb-4">
        {[80, 100, 70, 110, 90].map((w, i) => (
          <div
            key={i}
            className="flex-shrink-0 h-9 rounded-full shimmer-skeleton"
            style={{ width: w }}
          />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden glass border border-white/5">
            <div className="h-52 shimmer-skeleton" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 rounded shimmer-skeleton" />
              <div className="h-3 w-full rounded shimmer-skeleton" />
              <div className="h-3 w-5/6 rounded shimmer-skeleton" />
              <div className="flex justify-between items-center mt-4">
                <div className="h-7 w-16 rounded shimmer-skeleton" />
                <div className="h-8 w-20 rounded-full shimmer-skeleton" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
