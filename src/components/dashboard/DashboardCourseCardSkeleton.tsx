import React from 'react';

export function DashboardCourseCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col h-full animate-pulse">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-200 dark:bg-slate-800" />

      <div className="flex flex-col flex-1 p-6 gap-6">
        {/* Title */}
        <div className="space-y-3">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
        </div>

        {/* Progress Bar */}
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-3">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-sm w-16" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-sm w-8" />
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>

        {/* Button */}
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
      </div>
    </div>
  );
}
