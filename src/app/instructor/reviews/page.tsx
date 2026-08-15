'use client';

import React, { useState, useEffect } from 'react';
import { instructorApi } from '@/lib/api/instructor';
import Image from 'next/image';
import { getAvatarUrl } from '@/lib/utils';

interface AggregatedReview {
  id: string;
  rating: number;
  comment?: string;
  courseTitle: string;
  courseId: string;
  createdAt?: string;
  user?: {
    displayName?: string;
    avatarUrl?: string;
  };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<AggregatedReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [stats, setStats] = useState({ average: 0, total: 0 });

  useEffect(() => {
    const fetchAllReviews = async () => {
      try {
        // Use the optimized single endpoint for instructor reviews
        const res: any = await instructorApi.getInstructorReviews(50, 0); // fetching up to 50 for dashboard
        const fetchedReviews = res?.reviews || res?.data?.reviews || [];
        
        const allReviews: AggregatedReview[] = fetchedReviews.map((r: any) => ({
           ...r,
           courseTitle: r.course?.title || 'Unknown Course',
           courseId: r.course?.id || r.courseId,
        }));

        setReviews(allReviews);

        // Compute aggregate stats
        if (allReviews.length > 0) {
          const totalRating = allReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
          setStats({
            average: totalRating / allReviews.length,
            total: allReviews.length,
          });
        }
      } catch (err) {
        console.error('Reviews fetch failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllReviews();
  }, []);

  const filteredReviews = filterRating === 'all'
    ? reviews
    : reviews.filter(r => r.rating === filterRating);

  // Count pending (no response) - reviews without instructor reply
  const pendingCount = reviews.length; // All reviews are "viewable"

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-10">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mb-3" />
              <div className="h-8 w-16 bg-slate-200 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">Course Reviews</h1>
           <p className="text-slate-500 mt-2">Listen to what your students are saying and respond to feedback.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
           {(['all', 5, 4, 3, 2, 1] as const).map((r) => (
             <button 
               key={r}
               onClick={() => setFilterRating(r as any)}
               className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                 filterRating === r 
                   ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' 
                   : 'text-slate-500 hover:text-slate-900 dark:text-slate-50 hover:bg-slate-50 dark:bg-slate-800/50'
               }`}
             >
               {r === 'all' ? 'All' : `${r}★`}
             </button>
           ))}
        </div>
      </header>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-6">
           <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center text-3xl font-black">
             {stats.average > 0 ? stats.average.toFixed(1) : '—'}
           </div>
           <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Average Rating</p>
              <div className="flex text-amber-500 mt-1">
                 {[1, 2, 3, 4, 5].map(s => (
                   <svg key={s} className={`w-4 h-4 ${s <= Math.round(stats.average) ? 'fill-current' : 'text-slate-200'}`} viewBox="0 0 20 20">
                     <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                   </svg>
                 ))}
              </div>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Reviews</p>
           <p className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-1">{stats.total.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Filtered Results</p>
           <p className="text-3xl font-black text-blue-500 mt-1">{filteredReviews.length}</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length > 0 ? filteredReviews.map((rev) => (
           <div key={rev.id} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-200 transition group relative overflow-hidden">
              <div className="absolute right-0 top-0 p-8 opacity-0 group-hover:opacity-5 transition">
                 <svg className="w-32 h-32 text-slate-900 dark:text-slate-50" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                 </svg>
              </div>

              <div className="flex flex-col md:flex-row gap-6 relative z-10">
                 <div className="w-14 h-14 rounded-2xl overflow-hidden relative border-2 border-slate-100 dark:border-slate-800/50 shadow-inner shrink-0">
                   <Image
                     src={getAvatarUrl(rev.user?.displayName)}
                     alt={rev.user?.displayName || 'Student'}
                     fill
                     className="object-cover"
                   />
                 </div>
                 <div className="flex-1 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                       <div>
                          <h3 className="text-lg font-black text-slate-900 dark:text-slate-50 leading-tight">{rev.user?.displayName || 'Student'}</h3>
                          <div className="flex items-center gap-3 mt-1">
                             <div className="flex text-amber-500 scale-90 -translate-x-1">
                                {[1, 2, 3, 4, 5].map(s => (
                                  <svg key={s} className={`w-4 h-4 ${s <= rev.rating ? 'fill-current' : 'text-slate-200'}`} viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                             </div>
                             {rev.createdAt && (
                               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                 {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                               </span>
                             )}
                          </div>
                       </div>
                       <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg self-start md:self-center">
                          {rev.courseTitle}
                       </div>
                    </div>
                    {rev.comment && (
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic">&quot;{rev.comment}&quot;</p>
                    )}
                 </div>
              </div>
           </div>
        )) : (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
             <svg className="w-16 h-16 mx-auto mb-4 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
             </svg>
             <p className="text-slate-400 font-bold text-lg">
               {reviews.length === 0 ? 'No reviews yet' : 'No reviews found for this rating.'}
             </p>
             {reviews.length === 0 && (
               <p className="text-slate-400 text-sm mt-1">Reviews will appear here as students complete your courses.</p>
             )}
          </div>
        )}
      </div>

    </div>
  );
}
