export default function CoursesLoading() {
  return (
    <div className="min-h-screen bg-[#f0f2f8] dark:bg-slate-950 animate-pulse">
      {/* Hero shimmer */}
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-10 flex flex-col items-center gap-5">
        <div className="h-7 w-36 bg-white dark:bg-slate-800 rounded-full shadow-sm" />
        <div className="h-12 w-3/4 bg-white dark:bg-slate-800 rounded-xl" />
        <div className="h-6 w-1/2 bg-white dark:bg-slate-800 rounded-xl" />
        <div className="flex gap-8 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-slate-800" />
              <div className="space-y-1.5">
                <div className="h-4 w-14 bg-white dark:bg-slate-800 rounded" />
                <div className="h-3 w-16 bg-slate-100 dark:bg-slate-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter bar shimmer */}
      <div className="sticky top-16 z-30 bg-[#f0f2f8] dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800 py-3 px-6">
        <div className="max-w-7xl mx-auto flex gap-3 items-center">
          <div className="flex-1 h-10 bg-white dark:bg-slate-800 rounded-xl" />
          <div className="h-10 w-28 bg-white dark:bg-slate-800 rounded-xl" />
          <div className="h-10 w-28 bg-white dark:bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* Card grid shimmer */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="h-5 w-40 bg-white dark:bg-slate-800 rounded-lg mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="h-44 bg-slate-100 dark:bg-slate-800" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-4/5" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-3/5" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-2/5" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-6 w-20 bg-blue-100 dark:bg-blue-900/30 rounded-lg" />
                  <div className="h-8 w-28 bg-blue-50 dark:bg-blue-900/20 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
