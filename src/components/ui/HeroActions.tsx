'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export function HeroActions() {
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
        <div className="h-12 w-44 bg-blue-100 rounded-[14px] animate-pulse" />
        <div className="h-12 w-36 bg-slate-100 dark:bg-slate-800 rounded-[14px] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
      <Link
        href="/courses"
        className="inline-flex items-center gap-2 px-7 py-3 bg-gradient-to-br from-blue-600 to-blue-500 text-white font-semibold rounded-[14px] shadow-[0_8px_30px_rgba(37,99,235,0.25)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all text-base"
      >
        Explore Courses
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>

      {!isAuthenticated && (
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-7 py-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-800 rounded-[14px] hover:border-blue-200 hover:text-blue-700 hover:bg-blue-50 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(37,99,235,0.1)] active:translate-y-0 transition-all text-base"
        >
          Join for free
        </Link>
      )}

      {isAuthenticated && (
        <Link
          href={user?.role === 'instructor' ? '/instructor/courses' : '/dashboard'}
          className="inline-flex items-center gap-2 px-7 py-3 bg-white dark:bg-slate-900 text-emerald-700 font-semibold border border-emerald-200 rounded-[14px] hover:bg-emerald-50 hover:border-emerald-300 hover:-translate-y-0.5 active:translate-y-0 transition-all text-base"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Go to Dashboard
        </Link>
      )}
    </div>
  );
}
