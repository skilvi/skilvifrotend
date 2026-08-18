'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { learningApi, CourseView, Section, Lecture } from '@/lib/api/learning';
import { discoveryApi, CourseMinimal } from '@/lib/api/discovery';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import LearnPageLoading from './loading';
import { paymentApi } from '@/lib/api/payment';

const VideoPlayer = dynamic(() => import('@/components/learn/VideoPlayer').then((mod) => mod.VideoPlayer), {
  loading: () => (
    <div className="w-full aspect-video bg-black rounded-[2.5rem] flex items-center justify-center">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
    </div>
  ),
  ssr: false
});


import { AssignmentPlayer } from '@/components/learn/AssignmentPlayer';
import { SyllabusSidebar } from '@/components/learn/SyllabusSidebar';
import { RecommendationCard } from '@/components/learn/RecommendationCard';
import { QAPanel } from '@/components/learn/QAPanel';
import { AnnouncementsPanel } from '@/components/learn/AnnouncementsPanel';
import { ReviewModal } from '@/components/learn/ReviewModal';
import { UpgradeModal } from '@/components/learn/UpgradeModal';
import { CodeSandbox } from '@/components/learn/CodeSandbox';
import { AnnouncementPopupModal } from '@/components/learn/AnnouncementPopupModal';
import { useAuthStore } from '@/store/authStore';
import { useLearnStore } from '@/store/learnStore';
import { Award, Expand, Shrink, Clock, Play, ThumbsUp, ThumbsDown, Edit3, ArrowRight, X, Info, MessageSquare, Terminal, Bell, GraduationCap } from 'lucide-react';
import { toast } from 'react-hot-toast';

export interface Note {
  id: string;
  time: number;
  text: string;
}

export default function CourseLearningExperience({ params }: { params: { courseId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading, isHydrated } = useAuthStore();
  
  // Connect to Zustand Global Store
  const { 
    courseData, activeLectureId, theaterMode, currentTime, activeTab, 
    flatLectures, completionPct,
    setCourseData, setActiveLectureId, setActiveTab, toggleTheaterMode, requestSeek, completeActiveLecture
  } = useLearnStore();

  const [isLoading, setIsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasDismissedReview, setHasDismissedReview] = useState(false);
  const [isReviewed, setIsReviewed] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [recommendations, setRecommendations] = useState<CourseMinimal[]>([]);
  
  // Endless Scroll & Rating State
  const [recPage, setRecPage] = useState(1);
  const [hasMoreRecs, setHasMoreRecs] = useState(true);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [userRating, setUserRating] = useState<'like' | 'dislike' | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const observerTarget = useRef(null);
  // Use refs to avoid stale closure issues inside useCallback without re-creating the fn
  const isLoadingRecsRef = useRef(false);
  const hasMoreRecsRef = useRef(true);
  useEffect(() => {
    // Fetch and populate global store
    const loadState = async () => {
       if (!user) return;
       try {
          const res = await learningApi.getCourseView(params.courseId);
          setCourseData(res);
          setIsReviewed(res.isReviewed);
          
          // Flatten locally to find first unlock
          const lectures = (res.sections || []).flatMap(s => s.lectures || []);
          
          // Resume directly on the first purely unlocked/uncompleted lecture
          const resumeTarget = lectures.find(l => !l.isLocked && !l.progress?.isCompleted) || lectures[0];
          if (resumeTarget) setActiveLectureId(resumeTarget.id);
       } catch (err) {
          console.error("Consumption retrieval fail", err);
       } finally {
          setIsLoading(false);
       }
    };
    // PERFORMANCE FIX: Use isHydrated instead of authLoading.
    // authLoading starts as `true` on every page, causing a wasted double render cycle.
    // isHydrated is false only before localStorage is read (once at startup).
    if (isHydrated && user) {
      loadState();
    } else if (isHydrated && !user) {
      router.replace('/login');
    }
  }, [params.courseId, setCourseData, setActiveLectureId, user, isHydrated, router]);

  // Load recommendations (Infinite Scroll)
  // FIX: Use refs for guard values so fetchRecs doesn't need to be recreated on every state change.
  // Previously isLoadingRecs/hasMoreRecs in deps caused the callback to recreate each render,
  // which triggered the initial-fetch useEffect in a tight loop → thousands of 429 errors.
  const fetchRecs = useCallback(async (pageToFetch: number) => {
    if (isLoadingRecsRef.current || !hasMoreRecsRef.current) return;
    isLoadingRecsRef.current = true;
    setIsLoadingRecs(true);
    try {
      const res: any = await discoveryApi.getFeaturedCourses(pageToFetch, 8);
      const fetchedCourses = res?.courses || res?.data?.courses || res?.data || [];
      const validCourses = fetchedCourses.filter((c: CourseMinimal) => c.id !== params.courseId);
      
      if (validCourses.length === 0) {
        hasMoreRecsRef.current = false;
        setHasMoreRecs(false);
      } else {
        setRecommendations(prev => {
          const newRecs = validCourses.filter((vc: CourseMinimal) => !prev.some(p => p.id === vc.id));
          return [...prev, ...newRecs];
        });
        setRecPage(pageToFetch);
      }
    } catch (err) {
      console.error(err);
    } finally {
      isLoadingRecsRef.current = false;
      setIsLoadingRecs(false);
    }
  }, [params.courseId]);

  useEffect(() => {
    // initial fetch — runs once on mount (fetchRecs is now stable)
    fetchRecs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreRecsRef.current && !isLoadingRecsRef.current) {
          fetchRecs(recPage + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchRecs, recPage]);

  // Load saved notes when lecture changes
  useEffect(() => {
    if (activeLectureId) {
      try {
        const saved = localStorage.getItem(`notes_${params.courseId}_${activeLectureId}`);
        setNotes(saved ? JSON.parse(saved) : []);
      } catch (e) {
        setNotes([]);
      }
    }
  }, [activeLectureId, params.courseId]);

  // Automatically trigger review modal if 100% reached for the first time
  useEffect(() => {
    if (!isLoading && completionPct >= 100) {
       if (!isReviewed && !showReviewModal && !hasDismissedReview) {
          setShowReviewModal(true);
       }
    }
  }, [completionPct, isReviewed, isLoading, showReviewModal, hasDismissedReview]);

  // Render layout immediately, handle loading inline to prevent UI freezing
  const activeLecture = flatLectures.find(l => l.id === activeLectureId) || null;

  const handleUpgrade = () => {
     setShowUpgradeModal(true);
  };

  const processUpgrade = async () => {
    setIsUpgrading(true);
    const toastId = toast.loading('Initializing upgrade...');
    try {
      const orderResponse: any = await paymentApi.createOrder(
         params.courseId, 
         undefined, // No coupon for upgrade
         undefined, // No referral for upgrade
         'UPGRADE'
      );
      const order = orderResponse?.data || orderResponse;
      
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY!;

      if (!(window as any).Razorpay) {
        toast.error('Payment gateway SDK missing. Please refresh.', { id: toastId });
        setIsUpgrading(false);
        return;
      }

      const options = {
        key: razorpayKey,
        amount: order.amount * 100, 
        currency: order.currency || 'INR',
        name: 'Skilvi',
        description: 'Course Access Upgrade',
        order_id: order.orderId,
        handler: async (response: any) => {
          const vId = toast.loading('Verifying payment...');
          try {
            await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: params.courseId,
              pricePaid: (order.amount || 0),
              orderType: 'UPGRADE'
            });
            toast.success('Upgrade Successful! Course Unlocked.', { id: vId });
            setShowUpgradeModal(false);
            // Refresh course data to unlock remaining lectures
            const res = await learningApi.getCourseView(params.courseId);
            setCourseData(res);
          } catch (err) {
            toast.error('Failed to verify payment.', { id: vId });
          } finally {
            setIsUpgrading(false);
          }
        },
        retry: { enabled: true, max_count: 3 },
        prefill: {
          name: user?.displayName || '',
          email: user?.email || '',
        },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: () => {
            setIsUpgrading(false);
            toast.dismiss(toastId);
            toast('Upgrade cancelled', { icon: 'ℹ️' });
          }
        }
      };

      toast.dismiss(toastId);
      const rzp = new (window as any).Razorpay(options);
      
      rzp.on('payment.failed', (err: any) => {
        setIsUpgrading(false);
        toast.error(`Payment failed`);
      });

      rzp.open();
    } catch (err) {
      toast.dismiss(toastId);
      setIsUpgrading(false);
      toast.error('Failed to initialize upgrade. Please try again.');
    }
  };

  if (isLoading) {
    return <LearnPageLoading />;
  }

  return (
    <div className="flex h-[calc(100dvh-64px)] md:h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-50 flex-col md:flex-row font-sans selection:bg-emerald-500/30">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {/* Sticky Progress Bar at the very top with glowing effect */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-[70] bg-slate-50 dark:bg-slate-800/50">
         <div 
           className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] transition-all duration-1000 ease-out" 
           style={{ width: `${completionPct}%` }} 
         />
      </div>

      {/* 1. Left Sidebar */}
      {!theaterMode && (
      <aside className="hidden md:flex w-[240px] bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-800 flex-col h-full shrink-0 z-20 resize-x overflow-hidden" style={{ minWidth: '200px', maxWidth: '400px' }}>
         <div className="px-6 py-5 font-black text-lg border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-900">
            Course Material
            <span className="md:hidden text-xs px-2 py-1 bg-emerald-500/10 rounded-full text-emerald-400">{Math.round(completionPct)}%</span>
         </div>
         {isLoading || !courseData ? (
           <div className="flex-1 p-4 space-y-4">
             {[1, 2, 3, 4, 5].map((i) => (
               <div key={i} className="flex gap-3 items-start animate-pulse">
                 <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 shrink-0" />
                 <div className="space-y-2 flex-1">
                   <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-md" />
                   <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-md" />
                 </div>
               </div>
             ))}
           </div>
         ) : (
           <SyllabusSidebar />
         )}
      </aside>
      )}

      {/* 2. Center Column */}
      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative bg-slate-50 dark:bg-slate-800/50">
         <header className="px-6 py-4 flex items-center gap-4 bg-white dark:bg-slate-900/80 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
            <a href={`/courses/${params.courseId}`} className="text-slate-500 hover:text-slate-900 dark:text-slate-50 transition-colors flex items-center gap-2 text-sm font-semibold group">
               <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg group-hover:bg-slate-200 transition-colors border border-slate-200 dark:border-slate-800 group-hover:border-slate-300 dark:border-slate-700">
                 <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
               </div>
               <span className="hidden sm:inline">Back</span>
            </a>
            <div className="h-6 w-px bg-slate-300 mx-2 hidden md:block"></div>
            <h1 className="font-black text-lg truncate flex-1 text-slate-900 dark:text-slate-50 tracking-tight">
               {isLoading ? (
                 <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
               ) : (
                 activeLecture?.title || 'Course Content'
               )}
            </h1>
            
              <div className="flex items-center gap-3">
              <button 
                onClick={toggleTheaterMode}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all"
                title="Toggle Theater Mode"
              >
                {theaterMode ? <Shrink className="w-3.5 h-3.5 text-emerald-400" /> : <Expand className="w-3.5 h-3.5 text-emerald-400" />}
                {theaterMode ? 'Exit Theater' : 'Theater Mode'}
              </button>

              {completionPct >= 100 && (
                <button 
                  onClick={() => router.push(`/learn/${params.courseId}/success`)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-900 dark:text-slate-50 rounded-xl text-xs font-black transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:-translate-y-0.5"
                >
                  <Award className="w-4 h-4" />
                  Claim Certificate
                </button>
              )}
              
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-inner">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
                 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{Math.round(completionPct)}%</span>
              </div>
            </div>
         </header>

         {/* Explicit Media Interaction Boundary */}
         <div className={`w-full flex flex-col items-center transition-colors duration-500 ${theaterMode ? 'bg-[#050505] justify-center min-h-[calc(100vh-76px)] p-4 lg:p-6' : 'bg-slate-50 dark:bg-slate-800/50 pt-6 pb-4 px-4 lg:px-8 border-b border-slate-200 dark:border-slate-800'}`}>
            <div 
              className={`w-full ${activeLecture?.contentType === 'assignment' ? 'min-h-[80vh] md:min-h-0 md:aspect-video' : 'aspect-video'} rounded-2xl overflow-hidden bg-black relative flex flex-col transition-all duration-500 ${theaterMode ? 'max-h-[85vh] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]' : 'max-h-[85vh] md:max-h-[70vh] border border-slate-300 dark:border-slate-700 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]'}`}
              style={{ maxWidth: theaterMode ? 'min(72rem, calc(85vh * 16 / 9))' : activeLecture?.contentType === 'assignment' ? '100%' : 'calc(70vh * 16 / 9)' }}
            >
            {isLoading || !courseData ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                  <div className="animate-spin h-12 w-12 border-4 border-emerald-500 rounded-full border-t-transparent mb-4" />
                  <p className="text-slate-400 text-sm font-medium">Loading content...</p>
               </div>
            ) : activeLecture ? (
                 activeLecture.isPartialLock ? (
                  <div className="w-full h-full flex-1 flex flex-col items-center justify-center bg-slate-900 px-6 text-center z-20 min-h-[300px]">
                     <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-4 border border-blue-500/50">
                       <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">Partial Access Reached</h2>
                    <p className="text-slate-400 mb-8 max-w-md">You've completed all lectures available in your partial enrollment plan. Upgrade to full access to continue your learning journey.</p>
                    <button 
                       onClick={handleUpgrade}
                       disabled={isUpgrading}
                       className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       {isUpgrading ? 'Processing...' : 'Pay Remaining Balance'}
                    </button>
                 </div>
               ) : activeLecture.contentType === 'assignment' ? (
                 <AssignmentPlayer
                   courseId={params.courseId}
                   lectureId={activeLecture.id}
                   assignment={activeLecture.assignment}
                   onComplete={() => {
                        const nextLectureId = completeActiveLecture();
                        if (nextLectureId) {
                          setTimeout(() => setActiveLectureId(nextLectureId), 500);
                        } else {
                          setTimeout(() => {
                            import('react-hot-toast').then(({ toast }) => {
                              toast.success('Course completed! Well done!', { icon: '🎉' });
                              if (!isReviewed) {
                                setShowReviewModal(true);
                              } else {
                                router.push(`/learn/${params.courseId}/success`);
                              }
                            });
                          }, 500);
                        }
                   }}
                 />
               ) : (
                <VideoPlayer 
                   courseId={params.courseId}
                   lectureId={activeLecture.id} 
                   resumeFrom={activeLecture.progress?.watchTimeSeconds || 0}
                   fallbackUrl={activeLecture.videoUrl}
                   onComplete={() => {
                        const nextLectureId = completeActiveLecture();
                        
                        // Auto-transition logic — reduced from 1500ms (toast shows instantly)
                        if (nextLectureId) {
                          import('react-hot-toast').then(({ toast }) => {
                            toast.success('Lecture completed! Moving to next...', { icon: <GraduationCap className="w-5 h-5 text-blue-500" /> });
                            setTimeout(() => setActiveLectureId(nextLectureId), 600);
                          });
                        } else {
                          import('react-hot-toast').then(({ toast }) => {
                            toast.success('Course completed! Well done!', { icon: '🎉' });
                            if (!isReviewed) {
                              setShowReviewModal(true);
                            } else {
                              setTimeout(() => {
                                router.push(`/learn/${params.courseId}/success`);
                              }, 800);
                            }
                          });
                        }
                    }}
                 />
               )
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
                 <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center">
                   <Award className="w-8 h-8 opacity-50" />
                 </div>
                 <p>Select a lecture to begin learning</p>
               </div>
            )}
           </div>
         </div>

         {/* WHITE CONTENT BELOW */}
         <div className="w-full flex-1 flex flex-col items-center p-4 lg:p-8 bg-slate-50 dark:bg-slate-800/50">
           <div className="w-full" style={{ maxWidth: 'calc(75vh * 16 / 9)' }}>

           {/* Mobile Tab Navigation */}
           <div className="md:hidden w-full overflow-x-auto hide-scrollbar -mt-4 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800 flex gap-2 snap-x">
             {[
               { id: 'syllabus', label: 'Syllabus' },
               { id: 'overview', label: 'Overview' },
               { id: 'notes', label: 'Notes' },
               { id: 'qa', label: 'Q&A' },
               { id: 'ide', label: 'IDE' },
               { id: 'announcements', label: 'Announcements' },
             ].map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`snap-start whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                   activeTab === tab.id
                     ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                     : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                 }`}
               >
                 {tab.label}
               </button>
             ))}
           </div>

           {/* Mobile Syllabus View */}
           {activeTab === 'syllabus' && (
              <div className="w-full mt-4 md:hidden">
                <SyllabusSidebar />
              </div>
           )}

           {/* Video Title and Actions (Below Video) */}
           {activeLecture && activeTab !== 'syllabus' && (
             <div className="w-full mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">{activeLecture.title}</h2>
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setUserRating(prev => prev === 'like' ? null : 'like')}
                      className={`p-2 transition-colors rounded-full ${userRating === 'like' ? 'bg-blue-500/10 text-blue-600' : 'text-slate-500 hover:text-slate-900 dark:text-slate-50 hover:bg-slate-100 dark:bg-slate-800'}`}
                    >
                      <ThumbsUp className={`w-5 h-5 ${userRating === 'like' ? 'fill-current' : ''}`} />
                    </button>
                    <button 
                      onClick={() => setUserRating(prev => prev === 'dislike' ? null : 'dislike')}
                      className={`p-2 transition-colors rounded-full ${userRating === 'dislike' ? 'bg-red-500/10 text-red-600' : 'text-slate-500 hover:text-slate-900 dark:text-slate-50 hover:bg-slate-100 dark:bg-slate-800'}`}
                    >
                      <ThumbsDown className={`w-5 h-5 ${userRating === 'dislike' ? 'fill-current' : ''}`} />
                    </button>
                    <div className="w-px h-6 bg-slate-200 mx-2"></div>
                   <button onClick={() => setActiveTab('notes')} className="flex items-center gap-2 px-3 py-2 text-sm text-emerald-400 font-bold hover:bg-emerald-500/10 rounded-xl transition-colors">
                     <Edit3 className="w-4 h-4" /> Save Note
                   </button>
                   <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-900 hover:bg-slate-200 font-bold rounded-xl transition-colors ml-2" onClick={() => {
                       const idx = flatLectures.findIndex(l => l.id === activeLectureId);
                       if (idx !== -1 && idx + 1 < flatLectures.length) {
                           const next = flatLectures[idx + 1];
                           if (!next.isLocked) setActiveLectureId(next.id);
                           else {
                             import('react-hot-toast').then(({ toast }) => toast.error('Next lecture is locked!'));
                           }
                       }
                   }}>
                     Go to next item <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
             </div>
           )}
           
            {/* Dynamic IDE Takeover - Native Below Video */}
            {activeTab === 'ide' && (
              <div className="w-full mt-10 mb-20 bg-white dark:bg-slate-900 rounded-3xl border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.1)] p-2 relative overflow-hidden">
                <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 mb-2">
                   <h3 className="text-slate-900 dark:text-slate-50 font-black flex items-center gap-2"><Terminal className="w-5 h-5 text-purple-400"/> Full Width Execution Sandbox</h3>
                   <button onClick={() => setActiveTab('overview')} className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-50 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">Close IDE</button>
                </div>
                <CodeSandbox height="700px" />
              </div>
            )}

           {/* Course Overview - Native Below Video */}
           {activeTab === 'overview' && courseData && (
             <div className="w-full mt-10 space-y-8 bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
               <div>
                 <h2 className="text-xl font-black text-slate-900 dark:text-slate-50 mb-2">{(courseData as any).title || 'About this Course'}</h2>
                 {(courseData as any)?.subtitle && (
                   <h3 className="text-md font-semibold text-slate-500 mb-4">{(courseData as any).subtitle}</h3>
                 )}
                 <p className="text-slate-500 leading-relaxed max-w-4xl">{(courseData as any).description || 'No description available for this course.'}</p>
               </div>
               {(courseData as any).instructor?.displayName && (
                 <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900/[0.02] rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md">
                   <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-900 dark:text-slate-50 font-black text-lg shrink-0">
                     {(courseData as any).instructor.displayName.charAt(0)}
                   </div>
                   <div>
                     <p className="text-slate-900 dark:text-slate-50 font-bold">{(courseData as any).instructor.displayName}</p>
                     <p className="text-slate-500 text-sm">Course Instructor</p>
                     {(courseData as any).metadata?.instructorBio && (
                       <p className="text-slate-500 text-xs mt-1">{(courseData as any).metadata.instructorBio}</p>
                     )}
                   </div>
                 </div>
               )}
             </div>
           )}

           {/* Mobile Notes View */}
           {activeTab === 'notes' && (
             <div className="w-full mt-6 md:hidden space-y-6">
               <div className="relative">
                 <textarea
                   value={newNoteText}
                   onChange={e => setNewNoteText(e.target.value)}
                   onKeyDown={e => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (!newNoteText.trim()) return;
                        const newNote = { id: Date.now().toString(), time: currentTime, text: newNoteText.trim() };
                        const updated = [...notes, newNote].sort((a,b) => a.time - b.time);
                        setNotes(updated);
                        setNewNoteText('');
                        localStorage.setItem(`notes_${params.courseId}_${activeLectureId}`, JSON.stringify(updated));
                     }
                   }}
                   className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 pr-24 text-slate-700 dark:text-slate-300 text-sm leading-relaxed resize-none focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]"
                   placeholder="Type a note and press Enter..."
                   rows={3}
                 />
                 <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                       {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
                    </span>
                 </div>
               </div>

               <div className="space-y-3">
                  {notes.map(note => (
                     <div key={note.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-3 group">
                        <div className="flex justify-between items-start">
                           <button 
                             onClick={() => requestSeek(note.time)}
                             className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded text-xs font-bold hover:bg-emerald-500/20 transition-colors"
                           >
                              <Play className="w-3 h-3" />
                              {Math.floor(note.time / 60)}:{(Math.floor(note.time % 60)).toString().padStart(2, '0')}
                           </button>
                           <button
                             onClick={() => {
                                const newNotes = notes.filter(n => n.id !== note.id);
                                setNotes(newNotes);
                                localStorage.setItem(`notes_${params.courseId}_${activeLectureId}`, JSON.stringify(newNotes));
                             }}
                             className="text-slate-500 hover:text-red-400 transition-colors"
                           >
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                           </button>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{note.text}</p>
                     </div>
                  ))}
                  {notes.length === 0 && (
                     <div className="text-center py-10 text-slate-500 text-sm font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                        No notes yet. Add your first note above!
                     </div>
                  )}
               </div>
             </div>
           )}

           {/* Mobile Q&A View */}
           {activeTab === 'qa' && (
             <div className="w-full mt-6 md:hidden">
               <QAPanel 
                 courseId={params.courseId} 
                 activeLectureId={activeLectureId || undefined} 
                 currentUserId={user?.id}
               />
             </div>
           )}

           {/* Mobile Announcements View */}
           {activeTab === 'announcements' && (
             <div className="w-full mt-6 md:hidden bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
               <div className="flex items-center gap-2 mb-6">
                 <Bell className="w-5 h-5 text-yellow-500" />
                 <h2 className="text-xl font-black text-slate-900 dark:text-slate-50">Announcements</h2>
               </div>
               <AnnouncementsPanel courseId={params.courseId} />
             </div>
           )}

           {/* Recommendations / Upsell Section */}
           {recommendations.length > 0 && activeTab === 'overview' && (
             <div className="w-full mt-12 mb-20">
               <div className="flex flex-col md:flex-row md:items-end justify-between items-start mb-8 gap-4">
                 <div className="space-y-1">
                   <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Expand Your Horizon</h2>
                   <p className="text-slate-500 text-sm font-medium">Specially curated courses based on your current learning path.</p>
                 </div>
                 <a href="/courses" className="text-xs font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors mb-1">
                   Browse All Courses →
                 </a>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 {recommendations.map(course => (
                   <RecommendationCard key={course.id} course={course} />
                 ))}
                </div>
                
                {/* Endless Scroll Loading Indicator & Observer Target */}
                <div ref={observerTarget} className="w-full h-20 flex items-center justify-center mt-4">
                  {isLoadingRecs && (
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                      <div className="animate-spin w-4 h-4 border-2 border-slate-300 dark:border-slate-700 border-t-slate-900 rounded-full"></div>
                      Loading more courses...
                    </div>
                  )}
                  {!hasMoreRecs && recommendations.length > 0 && (
                    <div className="text-slate-400 text-sm font-medium mt-4 mb-8">You've reached the end of the recommendations.</div>
                  )}
                </div>
              </div>
            )}
            
            </div>
          </div>
      </main>

      {/* 3. Right Column */}
      <div className={`hidden md:flex bg-slate-50 dark:bg-slate-800/50 z-40 relative shrink-0 ${theaterMode ? 'hidden' : ''} border-l border-slate-200 dark:border-slate-800 h-full`}>
         {/* Expanding Panel */}
         {activeTab !== 'overview' && activeTab !== 'ide' && activeTab !== 'announcements' && (
           <div className="hidden md:flex flex-col h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 resize-x overflow-hidden" style={{ width: '400px', minWidth: '320px', maxWidth: '600px', direction: 'rtl' }}>
             <div style={{ direction: 'ltr', display: 'flex', flexFlow: 'column', height: '100%' }}>
               <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10 shrink-0">
                 <h3 className="font-black text-slate-900 dark:text-slate-50 capitalize text-lg tracking-tight">
                   {activeTab === 'qa' ? 'Q&A' : (activeTab as string) === 'ide' ? 'Sandbox' : 'Notes'}
                 </h3>
                 <button onClick={() => setActiveTab('overview')} className="p-1 hover:bg-slate-200 rounded-lg transition-colors"><X className="w-5 h-5 text-slate-500 hover:text-slate-900 dark:text-slate-50" /></button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
                 {activeTab === 'notes' && (
                 <div className="space-y-6">
                   <div className="relative">
                     <textarea
                       value={newNoteText}
                       onChange={e => setNewNoteText(e.target.value)}
                       onKeyDown={e => {
                         if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (!newNoteText.trim()) return;
                            const newNote = { id: Date.now().toString(), time: currentTime, text: newNoteText.trim() };
                            const updated = [...notes, newNote].sort((a,b) => a.time - b.time);
                            setNotes(updated);
                            setNewNoteText('');
                            localStorage.setItem(`notes_${params.courseId}_${activeLectureId}`, JSON.stringify(updated));
                         }
                       }}
                       className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 pr-24 text-slate-700 dark:text-slate-300 text-sm leading-relaxed resize-none focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                       placeholder="Type a note and press Enter..."
                       rows={3}
                     />
                     <div className="absolute bottom-4 right-4 flex items-center gap-2">
                        <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                           {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
                        </span>
                     </div>
                   </div>

                   <div className="space-y-3">
                      {notes.map(note => (
                         <div key={note.id} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-3 group">
                            <div className="flex justify-between items-start">
                               <button 
                                 onClick={() => requestSeek(note.time)}
                                 className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded text-xs font-bold hover:bg-emerald-500/20 transition-colors"
                               >
                                  <Play className="w-3 h-3" />
                                  {Math.floor(note.time / 60)}:{(Math.floor(note.time % 60)).toString().padStart(2, '0')}
                               </button>
                               <button
                                 onClick={() => {
                                    const newNotes = notes.filter(n => n.id !== note.id);
                                    setNotes(newNotes);
                                    localStorage.setItem(`notes_${params.courseId}_${activeLectureId}`, JSON.stringify(newNotes));
                                 }}
                                 className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                               </button>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{note.text}</p>
                         </div>
                      ))}
                      {notes.length === 0 && (
                         <div className="text-center py-10 text-slate-500 text-sm font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            No notes yet. Add your first note above!
                         </div>
                      )}
                   </div>
                 </div>
               )}

               {activeTab === 'qa' && (
                 <div className="w-full">
                   <QAPanel 
                     courseId={params.courseId} 
                     activeLectureId={activeLectureId || undefined} 
                     currentUserId={user?.id}
                   />
                 </div>
               )}

               </div>
             </div>
           </div>
         )}
         
         {/* Announcements Full-Width Panel */}
         {activeTab === 'announcements' && (
            <div className="flex-1 overflow-y-auto p-8 relative">
               <div className="max-w-4xl mx-auto">
                 <div className="flex justify-between items-center mb-8">
                   <div>
                     <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 flex items-center gap-2"><Bell className="w-6 h-6 text-yellow-500" /> Course Announcements</h2>
                     <p className="text-slate-500 text-sm mt-1">Stay up to date with the latest news from your instructor.</p>
                   </div>
                   <button onClick={() => setActiveTab('overview')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
                     <X className="w-6 h-6 text-slate-500" />
                   </button>
                 </div>
                 <AnnouncementsPanel courseId={params.courseId} />
               </div>
            </div>
         )}
         
         {/* Slim Icon Bar (Hidden on Mobile) */}
         <div className="hidden md:flex w-[60px] flex-col items-center py-6 gap-4 bg-slate-50 dark:bg-slate-800/50 border-l border-slate-200 dark:border-slate-800">
            <button onClick={() => setActiveTab('overview')} className={`p-2 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-slate-200 text-slate-700 dark:text-slate-300' : 'text-slate-400 opacity-60 hover:opacity-100 hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-600 dark:text-slate-400'}`} title="Overview">
              <Info className="w-5 h-5" />
            </button>
            <button onClick={() => setActiveTab(activeTab === 'notes' ? 'overview' : 'notes')} className={`p-2 rounded-xl transition-all ${activeTab === 'notes' ? 'bg-emerald-500/10 text-emerald-600' : 'text-slate-400 opacity-60 hover:opacity-100 hover:bg-emerald-50 hover:text-emerald-500'}`} title="Notes">
              <Edit3 className="w-5 h-5" />
            </button>
            <button onClick={() => setActiveTab(activeTab === 'qa' ? 'overview' : 'qa')} className={`p-2 rounded-xl transition-all ${activeTab === 'qa' ? 'bg-blue-500/10 text-blue-600' : 'text-slate-400 opacity-60 hover:opacity-100 hover:bg-blue-50 hover:text-blue-500'}`} title="Q&A">
              <MessageSquare className="w-5 h-5" />
            </button>
            <button onClick={() => {
              const newTab = activeTab === 'ide' ? 'overview' : 'ide';
              setActiveTab(newTab);
              if (newTab === 'ide') {
                setTimeout(() => {
                  document.getElementById('ide-sandbox')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
              }
            }} className={`p-2 rounded-xl transition-all ${activeTab === 'ide' ? 'bg-purple-500/10 text-purple-600' : 'text-slate-400 opacity-60 hover:opacity-100 hover:bg-purple-50 hover:text-purple-500'}`} title="IDE">
              <Terminal className="w-5 h-5" />
            </button>
            <button onClick={() => setActiveTab(activeTab === 'announcements' ? 'overview' : 'announcements')} className={`p-2 rounded-xl transition-all ${activeTab === 'announcements' ? 'bg-yellow-500/10 text-yellow-600' : 'text-slate-400 opacity-60 hover:opacity-100 hover:bg-yellow-50 hover:text-yellow-500'}`} title="Announcements">
              <Bell className="w-5 h-5" />
            </button>
         </div>
      </div>

      <ReviewModal 
         courseId={params.courseId}
         isOpen={showReviewModal}
         onClose={() => {
            setShowReviewModal(false);
            setHasDismissedReview(true);
         }}
         onSubmit={async (rating, comment) => {
            try {
               await learningApi.submitReview(params.courseId, rating, comment);
               setIsReviewed(true);
               setShowReviewModal(false);
               toast.success("Review submitted! Your certificate is now available.", { icon: '🏅' });
               
               // Redirect to success page with a slight delay for toast visibility
               setTimeout(() => {
                  router.push(`/learn/${params.courseId}/success`);
               }, 800);
            } catch (err) {
               toast.error("Failed to submit review. Please try again.");
               throw err;
            }
         }}
      />
       
       {/* Course Upgrade Modal */}
       <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onConfirm={processUpgrade}
          isProcessing={isUpgrading}
          pricing={(courseData as any)?.pricing}
       />

       {/* Announcement Popup Modal for returning users */}
       <AnnouncementPopupModal courseId={params.courseId} />
    </div>
  );
}
