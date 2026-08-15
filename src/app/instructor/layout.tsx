'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import Image from 'next/image';
import InstructorNotifications from '@/components/instructor/InstructorNotifications';
import { getAvatarUrl } from '@/lib/utils';

const navItems = [
  {
    href: '/instructor/courses',
    label: 'My Courses',
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    href: '/instructor/earnings',
    label: 'Earnings',
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },

  {
    href: '/instructor/performance',
    label: 'Performance',
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: '/instructor/reviews',
    label: 'Course Reviews',
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    href: '/instructor/messages',
    label: 'Q&A Messages',
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    href: '/instructor/settings',
    label: 'Settings',
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    isSettings: true,
  },
];

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  const { user, isHydrated, isAuthenticated, isLoading: authLoading, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isHydrated && !authLoading) {
      if (!isAuthenticated || !user) {
        router.push('/login');
      } else if (user.role !== 'instructor') {
        router.push('/dashboard');
      }
    }
  }, [isHydrated, isAuthenticated, user, authLoading, router]);

  if (!isHydrated || authLoading || !user || user.role !== 'instructor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if ((user as any).approvalStatus === 'PENDING') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Admin Approval Pending</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Your instructor account has been created successfully, but it requires administrator approval before you can access the dashboard and publish courses.
          </p>
          <button 
            onClick={async () => { await logout(); router.push('/'); }}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold rounded-xl transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const mainNav = navItems.filter((item) => !item.isSettings);
  const settingsNav = navItems.filter((item) => item.isSettings);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 flex">
      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 hidden md:flex">
        {/* Brand */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/50">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-sm">
              <img src="/logo.svg" alt="" className="w-4.5 h-4.5 filter invert brightness-200" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-50 tracking-tight leading-none">EmberQuest</p>
              <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest leading-none mt-0.5">Instructor Studio</p>
            </div>
          </Link>
        </div>

        {/* Instructor Profile */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden relative border border-slate-200 dark:border-slate-800 flex-shrink-0">
              <Image
                src={getAvatarUrl(user.displayName, user.avatarUrl)}
                alt={user.displayName || 'Instructor'}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">{user.displayName}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <p className="text-[10px] text-slate-400 font-medium">Verified Instructor</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {mainNav.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800/50 hover:text-slate-900 dark:text-slate-50'
                }`}
              >
                <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Settings / bottom */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/50 space-y-0.5">
          {settingsNav.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800/50 hover:text-slate-900 dark:text-slate-50'
                }`}
              >
                <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={async () => { await logout(); router.push('/'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all mt-1"
          >
            <svg className="w-4.5 h-4.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-semibold text-blue-700">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
              Instructor Studio
            </span>
          </div>
          <div className="flex items-center gap-3">
            <InstructorNotifications />
            <Link
              href="/instructor/courses/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-br from-blue-600 to-blue-500 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow-[0_4px_16px_rgba(37,99,235,0.25)] hover:-translate-y-0.5 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Course
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
