'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getAvatarUrl } from '@/lib/utils';
import Image from 'next/image';
import { ThemeToggle } from './ThemeToggle';
import { CornerDownLeft } from 'lucide-react';

function HeaderSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="hidden md:flex flex-1 max-w-sm mx-6">
      <form onSubmit={handleSearch} className="relative w-full">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-full py-2 pl-10 pr-10 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600/40 focus:bg-white dark:bg-slate-900 transition-all outline-none"
        />
        <svg
          className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 bg-slate-200/60 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-500 dark:text-slate-400 transition-colors"
          title="Press Enter to search"
        >
          <CornerDownLeft className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (pathname?.startsWith('/embed') || pathname?.startsWith('/programs')) return null;

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900/95 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-[0_1px_12px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">

          {/* Logo & Brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/logo.svg" alt="EmberQuest" className="h-10 w-auto object-contain dark:invert dark:brightness-200" />
            </Link>
            <div className="flex flex-col items-start leading-none">
              <Link href="/" className="text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight hidden sm:block hover:text-blue-600 transition-colors">
                EmberQuest
              </Link>
              <a href="https://www.skilvi.in" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-slate-400 tracking-widest hidden sm:block uppercase mt-0.5 hover:text-blue-600 transition-colors">
                POWERED BY SKILVI
              </a>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/courses" className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
              Courses
            </Link>
          </div>

          {/* Search */}
          <Suspense fallback={<div className="hidden md:flex flex-1 max-w-sm mx-6 h-9 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />}>
            <HeaderSearch />
          </Suspense>

          {/* User Section */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <ThemeToggle />
            {isHydrated && isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:border-slate-800 transition-all"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden relative border-2 border-blue-100 flex-shrink-0">
                    <Image
                      src={getAvatarUrl(user.displayName, user.avatarUrl)}
                      alt={user.displayName || "User"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden lg:block">{user.displayName}</span>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-slate-100 dark:border-slate-800/50 py-2 z-20 animate-fade-up">
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/50 mb-1">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Account</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate mt-0.5">{user.email}</p>
                      </div>
                      <Link href="/profile" onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile Settings
                      </Link>
                      {(!user.role || user.role === 'student') && (
                        <>
                          <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            My Learning
                          </Link>
                          <Link href="/dashboard/certificates" onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                            My Certificates
                          </Link>
                          <Link href="/dashboard/support" onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Help & Support
                          </Link>
                        </>
                      )}
                      {user.role === 'instructor' && (
                        <Link href="/instructor" onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Instructor Studio
                        </Link>
                      )}
                      {(user.role === 'admin' || user.role === 'superadmin') && (
                        <Link href="/admin/dashboard" onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100 dark:border-slate-800/50 mt-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                          Admin Center
                        </Link>
                      )}
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : isHydrated ? (
              <div className="flex items-center gap-2">
                <Link href="/login"
                  className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all hidden sm:inline-flex">
                  Log in
                </Link>
                <Link href="/register"
                  className="text-sm font-semibold text-white bg-gradient-to-br from-blue-600 to-blue-500 px-4 sm:px-5 py-2 rounded-[14px] shadow-[0_4px_16px_rgba(37,99,235,0.25)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all whitespace-nowrap">
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="h-9 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                <div className="h-9 w-24 bg-blue-100 rounded-[14px] animate-pulse" />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
