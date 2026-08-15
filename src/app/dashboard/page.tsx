'use client';

import React, { useState, useEffect } from 'react';
import { dashboardApi, DashboardEnrollment } from '@/lib/api/dashboard';
import { DashboardCourseCard } from '@/components/dashboard/DashboardCourseCard';
import { DashboardCourseCardSkeleton } from '@/components/dashboard/DashboardCourseCardSkeleton';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getMediaUrl } from '@/lib/utils';

export default function Dashboard() {
  const { user, isHydrated, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<DashboardEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'InProgress' | 'Completed'>('All');

  useEffect(() => { 
    if (isHydrated && !authLoading && !user) {
      router.replace('/login'); 
    }
  }, [user, isHydrated, authLoading, router]);

  useEffect(() => {
    let mounted = true;
    const fetchDashboard = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      
      // Fix for Token Reuse Race Condition (Google Auth):
      // If we don't have a token, we MUST wait for authLoading to finish.
      // Otherwise, we'll fire an API request without a token, which triggers the 
      // Axios interceptor to call /auth/refresh at the EXACT same time that 
      // checkSession is calling /auth/refresh. This dual-request triggers the 
      // backend's Token Replay Detection and revokes the user's session.
      if (!token && authLoading) return;
      
      // Don't fetch if we know for a fact the user is totally logged out
      if (isHydrated && !authLoading && !user) return;
      
      try {
        const data = await dashboardApi.getDashboardEnrollments();
        if (mounted) setEnrollments(data);
      } catch (err) {
        console.error('Dashboard metric retrieval failed', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchDashboard();
    return () => { mounted = false; };
  }, [isHydrated, authLoading, user?.id]);

  if (!isHydrated || authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 pb-24 animate-pulse">
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="h-24 w-full md:w-[400px] bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
           <div className="h-[300px] w-full bg-slate-200 dark:bg-slate-800 rounded-[20px]" />
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-[20px]" />
             <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-[20px]" />
             <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-[20px]" />
           </div>
        </div>
      </div>
    );
  }

  if (!user) return null; // Wait for router.replace to handle this

  const resumeCourse = enrollments.find(e => e.lastAccessed) || enrollments[0];

  const filteredEnrollments = enrollments.filter(enroll => {
    if (filter === 'InProgress') return enroll.progressPercent > 0 && enroll.progressPercent < 100;
    if (filter === 'Completed') return enroll.progressPercent >= 100;
    return true;
  });

  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((acc, curr) => acc + curr.progressPercent, 0) / enrollments.length)
    : 0;

  const completedCount = enrollments.filter(e => e.progressPercent >= 100).length;

  const computeStreak = () => {
    const dates = enrollments.filter(e => e.lastAccessed).map(e => new Date(e.lastAccessed).toDateString());
    const uniqueDates = Array.from(new Set(dates)).sort().reverse();
    if (!uniqueDates.length) return 0;
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < uniqueDates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      if (uniqueDates.includes(checkDate.toDateString())) streak++;
      else break;
    }
    return streak || (uniqueDates.length > 0 ? 1 : 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 pb-24">

      {/* ── Page Header ── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div>
              <div className="inline-flex items-center px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-semibold text-blue-700 mb-3">
                Student Dashboard
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">{user.displayName}</span>
              </h1>
              <p className="text-slate-500 font-medium mt-1.5 text-sm">Continue your journey towards engineering excellence.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-4 sm:gap-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{enrollments.length}</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Enrolled</p>
              </div>
              <div className="hidden sm:block w-px bg-slate-200 self-stretch" />
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{avgProgress}%</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Avg Progress</p>
              </div>
              <div className="hidden sm:block w-px bg-slate-200 self-stretch" />
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-500">{computeStreak()}🔥</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Day Streak</p>
              </div>
              <div className="hidden sm:block w-px bg-slate-200 self-stretch" />
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{completedCount}</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">

        {enrollments.length > 0 ? (
          <>
            {/* ── Resume Card ── */}
            {resumeCourse && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  {/* Thumbnail */}
                  <div className="lg:w-2/5 aspect-video lg:aspect-auto relative bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                    <Image
                      src={getMediaUrl(resumeCourse.thumbnailUrl)}
                      alt={resumeCourse.title}
                      fill
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/30 via-transparent to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-8 md:p-10 flex flex-col justify-center gap-6">
                    <div>
                      <span className="inline-flex items-center px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-4">
                        📖 Continue Learning
                      </span>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight leading-snug">{resumeCourse.title}</h2>
                    </div>

                    {/* Progress */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 rounded-xl p-5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Progress</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-50">{Math.round(resumeCourse.progressPercent)}%</span>
                      </div>
                      <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-700"
                          style={{ width: `${resumeCourse.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <Link href={`/learn/${resumeCourse.courseId}`}>
                      <button className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-br from-blue-600 to-blue-500 text-white font-semibold text-sm rounded-[14px] shadow-[0_8px_30px_rgba(37,99,235,0.25)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Resume Learning
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* ── All Courses ── */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Your Courses</h2>
                  <p className="text-sm text-slate-500 font-medium mt-0.5">{enrollments.length} active learning paths</p>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  {[
                    { id: 'All', label: 'All' },
                    { id: 'InProgress', label: 'In Progress' },
                    { id: 'Completed', label: 'Completed' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id as any)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        filter === f.id
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm border border-slate-200 dark:border-slate-800'
                          : 'text-slate-500 hover:text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEnrollments.map((enroll) => (
                  <DashboardCourseCard key={enroll.courseId} enrollment={enroll} />
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-20 text-center flex flex-col items-center gap-8 max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">No courses yet</h3>
              <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                Level up your engineering skills by exploring our expert-taught masterclasses.
              </p>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-br from-blue-600 to-blue-500 text-white font-semibold text-sm rounded-[14px] shadow-[0_8px_30px_rgba(37,99,235,0.25)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all"
            >
              Browse Library
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
