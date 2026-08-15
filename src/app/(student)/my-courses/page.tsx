'use client';

import React, { useState, useEffect } from 'react';
import { dashboardApi, DashboardEnrollment } from '@/lib/api/dashboard';
import { DashboardCourseCard } from '@/components/dashboard/DashboardCourseCard';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MyCoursesPage() {
    const { user, isLoading: authLoading } = useAuthStore();
    const router = useRouter();
    const [enrollments, setEnrollments] = useState<DashboardEnrollment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [streakDays, setStreakDays] = useState<Record<string, number>>({});

    useEffect(() => {
        setIsMounted(true);
        
        // Use real activity dates from user profile instead of mock storage
        if (user && (user as any).activityDates) {
            const dates: string[] = (user as any).activityDates;
            const streakMap: Record<string, number> = {};
            dates.forEach(d => {
                streakMap[d] = 2; // Fixed activity level color (could be weighted later)
            });
            setStreakDays(streakMap);
        }
    }, [user]);

    useEffect(() => {
        if (isMounted && !user) {
            router.replace('/login');
        }
    }, [user, isMounted, router]);

    useEffect(() => {
        const fetchEnrollments = async () => {
             if (!user || authLoading) return;
             try {
                 const data = await dashboardApi.getDashboardEnrollments();
                 setEnrollments(data);
             } catch (err) {
                 console.error("My courses retrieval failed", err);
             } finally {
                 setIsLoading(false);
             }
        };

        if (user && !authLoading) {
            fetchEnrollments();
        }
    }, [user?.id, authLoading]);

    if (!isMounted || isLoading || authLoading || !user) {
         return (
             <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 flex flex-col pt-32 items-center text-slate-400">
                  <div className="animate-spin mb-4 rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                  Loading your courses...
             </div>
         );
    }

    const activeCourse = enrollments.length > 0 ? enrollments[0] : null;

    // Heatmap generator
    const renderHeatmap = () => {
        const days = [];
        for(let i=29; i>=0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const activityLevel = streakDays[dateStr] || 0;
            
            let color = 'bg-slate-200';
            if (activityLevel === 1) color = 'bg-emerald-200';
            if (activityLevel === 2) color = 'bg-emerald-400';
            if (activityLevel === 3) color = 'bg-emerald-600';
            if (activityLevel >= 4) color = 'bg-emerald-800';

            days.push(
                <div 
                   key={dateStr} 
                   className={`w-4 h-4 rounded-sm ${color} transition-colors duration-300 hover:ring-2 hover:ring-emerald-500 hover:ring-offset-1`}
                   title={`${dateStr}: ${activityLevel} lectures completed`}
                />
            );
        }
        return days;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 flex flex-col pt-24 pb-20">
            {/* Header Area */}
            <div className="bg-white dark:bg-slate-900 border-b border-gray-200 py-12 mb-8">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                  <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Student Dashboard</h1>
                    <p className="text-slate-500 mt-2 text-lg">Manage your learning journey and view your archived progress.</p>
                  </div>
                  
                  {/* Activity Heatmap Widget */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                     <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                        <span>Learning Activity (30 Days)</span>
                        {Object.keys(streakDays).length > 0 && (
                          <span className="text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                            {Object.keys(streakDays).length} Active Days! 🔥
                          </span>
                        )}
                     </div>
                     <div className="flex gap-1">
                        {renderHeatmap()}
                     </div>
                  </div>
               </div>
            </div>

            {/* Courses grid */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
               {enrollments.length > 0 ? (
                  <div className="space-y-12">
                     {/* Jump Back In Hero */}
                     {activeCourse && (
                         <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                            {/* Decorative background elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all duration-700"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-emerald-500/20 transition-all duration-700"></div>
                            
                            <div className="w-full md:w-1/3 aspect-video bg-slate-800 rounded-2xl overflow-hidden relative shadow-2xl border border-slate-700 z-10 shrink-0">
                               <img src={activeCourse.thumbnailUrl || '/placeholder-course.jpg'} alt="Thumbnail" className="w-full h-full object-cover opacity-80" />
                               <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
                               <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs font-bold border border-white/10">
                                  {Math.round(activeCourse.progressPercent || 0)}% Complete
                               </div>
                            </div>
                            
                            <div className="flex-1 z-10 text-center md:text-left">
                               <div className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest rounded-full mb-4">Jump Back In</div>
                               <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">{activeCourse.title}</h2>
                               <p className="text-slate-400 mb-8 max-w-xl line-clamp-2">Pick up exactly where you left off. The next lecture is waiting for you.</p>
                               <Link href={`/learn/${activeCourse.courseId}`}>
                                  <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all flex items-center justify-center md:justify-start gap-2 w-full md:w-auto group-hover:scale-105 duration-300">
                                     <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                     Resume Learning
                                  </button>
                               </Link>
                            </div>
                         </div>
                     )}

                     <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6">All Enrollments</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                           {enrollments.map(enroll => (
                               <DashboardCourseCard key={enroll.courseId} enrollment={enroll} />
                           ))}
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 border-dashed p-16 text-center flex flex-col items-center justify-center">
                     <div className="bg-blue-50 p-6 rounded-full mb-6 text-blue-600">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                     </div>
                     <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-3">No Joined Courses</h3>
                     <p className="text-slate-500 mb-8 max-w-md mx-auto italic">Explore our extensive library and join a learning path today.</p>
                     <Link href="/">
                        <button className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-95">
                           Browse Library
                        </button>
                     </Link>
                  </div>
               )}
            </main>
        </div>
    );
}
