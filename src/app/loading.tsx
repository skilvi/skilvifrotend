export default function GlobalLoading() {
  return (
    <>
      {/* Top progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-blue-100 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 animate-progress-bar"
          style={{ width: '100%' }}
        />
      </div>

      {/* Page shimmer skeleton */}
      <div className="min-h-screen bg-[#f0f2f8] dark:bg-slate-950 pt-16 animate-pulse">
        {/* Hero area shimmer */}
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-10 flex flex-col items-center gap-5">
          <div className="h-7 w-32 bg-white dark:bg-slate-800 rounded-full" />
          <div className="h-12 w-3/4 bg-white dark:bg-slate-800 rounded-xl" />
          <div className="h-6 w-1/2 bg-white dark:bg-slate-800 rounded-xl" />
          <div className="flex gap-6 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-24 bg-white dark:bg-slate-800 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Card grid shimmer */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="h-5 w-48 bg-white dark:bg-slate-800 rounded-lg mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <div className="h-44 bg-slate-100 dark:bg-slate-800" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-4/5" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-3/5" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-2/5" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-6 w-20 bg-blue-100 dark:bg-blue-900/30 rounded-lg" />
                    <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
