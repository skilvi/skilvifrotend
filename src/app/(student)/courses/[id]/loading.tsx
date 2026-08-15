import React from 'react';

export default function CourseDetailLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 animate-pulse">
      {/* Hero Skeleton */}
      <div className="border-b border-slate-200 dark:border-slate-800 py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>
            
            <div className="h-12 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-12 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-xl" />

            <div className="space-y-3 mt-6">
              <div className="h-4 w-full max-w-2xl bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-4 w-5/6 max-w-2xl bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-4 w-4/6 max-w-2xl bg-slate-200 dark:bg-slate-800 rounded-lg" />
            </div>

            <div className="flex gap-6 mt-8">
              <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            </div>
          </div>

          {/* Right Panel Skeleton */}
          <div className="md:w-[400px] shrink-0">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[20px] p-6 border border-slate-200 dark:border-slate-800 h-[400px] flex flex-col">
              <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-800 rounded-xl mb-6" />
              <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl mt-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
        <div className="flex-1 space-y-8">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="space-y-4">
            <div className="h-16 w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
            <div className="h-16 w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
            <div className="h-16 w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
          </div>
        </div>
        <div className="md:w-[300px] shrink-0 space-y-6">
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-32 w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
