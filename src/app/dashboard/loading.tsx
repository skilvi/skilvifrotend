export default function DashboardLoading() {
  return (
    <div className="flex-1 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full" />
            </div>
            <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2" />
            <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-24 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-1/3 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
