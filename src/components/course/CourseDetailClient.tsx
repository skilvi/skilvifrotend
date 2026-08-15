'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { EnrollButton } from './EnrollButton';
import { learningApi, Section } from '@/lib/api/learning';
import { courseApi } from '@/lib/api/course';
import { ReviewModal } from '@/components/learn/ReviewModal';
import { useSystemConfig } from '@/components/providers/SystemConfigProvider';
import {
  PlayCircle, Lock, CheckCircle2, ChevronDown,
  BookOpen, Download, FileText, Clock, Trophy, Star, User, MessageSquare, ArrowRight, Filter, X, Heart
} from 'lucide-react';
import { getAvatarUrl, getMediaUrl } from '@/lib/utils';

interface CourseDetailClientProps {
  course: any;
  sections: Section[];
}

function formatDuration(seconds: number) {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
}

function StarRating({ rating, size = "sm" }: { rating: number, size?: "sm" | "md" | "lg" }) {
  const iconSize = size === "lg" ? "w-6 h-6" : size === "md" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          className={`${iconSize} ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'}`} 
        />
      ))}
    </div>
  );
}

export function CourseDetailClient({ course, sections: initialSections }: CourseDetailClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { config } = useSystemConfig();
  const enableCourseReviews = config?.enableCourseReviews ?? true;
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [showSoftWall, setShowSoftWall] = useState(false);
  const [syncedSections, setSyncedSections] = useState<Section[]>(initialSections);
  const [reviews, setReviews] = useState<any[]>([]);
  const [liveStats, setLiveStats] = useState<any>(course.metadata?.reviewStats || { total: 0, average: 0, distribution: { 5:0, 4:0, 3:0, 2:0, 1:0 } });
  const [userReview, setUserReview] = useState<any>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ [initialSections[0]?.id]: true });
  const [showManualReviewModal, setShowManualReviewModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [previewLectureId, setPreviewLectureId] = useState<string | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  const justEnrolled = searchParams.get('enrolled') === '1';

  // 1. Unified Enrollment and Progress Synchronization
  useEffect(() => {
    const syncState = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        
        const reviewData = await courseApi.getReviews(course.id);
        setReviews(reviewData.reviews || []);
        if (reviewData.stats) setLiveStats(reviewData.stats);
        setHasMoreReviews((reviewData.reviews || []).length < reviewData.total);

        if (token) {
          setIsLoggedIn(true);
          const { dashboardApi } = await import('@/lib/api/dashboard');
          const enrollments = await dashboardApi.getDashboardEnrollments();
          const enrollment = enrollments.find((e: any) => e.courseId === course.id);
          
          if (enrollment) {
            setIsEnrolled(true);
            const fullCourseView = await learningApi.getCourseView(course.id);
            if (fullCourseView.sections) {
              setSyncedSections(fullCourseView.sections);
            }
            if (fullCourseView.isReviewed) {
              const myReview = (reviewData.reviews || []).find((r: any) => r.isCurrentUser);
              setUserReview(myReview || { rating: fullCourseView.reviewRating });
            }
          }
        } else {
          setIsLoggedIn(false);
          const timer = setTimeout(() => {
            setShowSoftWall(true);
          }, 10000); 
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error('State synchronization failed', err);
      } finally {
        setIsChecking(false);
      }
    };
    syncState();

    // Check wishlist status
    const checkWishlist = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) return;
      try {
        const res: any = await import('@/lib/api/client').then(m => m.default.get(`/wishlist/check/${course.id}`));
        setInWishlist(res?.inWishlist || res?.data?.inWishlist || false);
      } catch { /* ignore */ }
    };
    checkWishlist();
  }, [course.id]);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const loadMoreReviews = async () => {
     if (isLoadingMore || !hasMoreReviews) return;
     setIsLoadingMore(true);
     try {
        const nextBatch = await courseApi.getReviews(course.id); 
        setHasMoreReviews(false); 
     } finally {
        setIsLoadingMore(false);
     }
  };

  const toggleWishlist = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) { window.location.href = '/login'; return; }
    setWishlistLoading(true);
    try {
      const apiClient = (await import('@/lib/api/client')).default;
      if (inWishlist) {
        await apiClient.delete(`/wishlist/${course.id}`);
        setInWishlist(false);
      } else {
        await apiClient.post(`/wishlist/${course.id}`, {});
        setInWishlist(true);
      }
    } catch (err: any) {
      if (err?.response?.status === 409) setInWishlist(true); // Already in wishlist
    } finally {
      setWishlistLoading(false);
    }
  };

  const totalSectionsCount = syncedSections.length;
  const completedSectionsCount = syncedSections.filter(s => 
    s.lectures.length > 0 && s.lectures.every(l => l.progress?.isCompleted)
  ).length;

  const totalLecturesCount = syncedSections.reduce((acc, s) => acc + s.lectures.length, 0);
  const completedLecturesCount = syncedSections.reduce((acc, s) => 
    acc + s.lectures.filter(l => l.progress?.isCompleted).length, 0
  );

  const sectionCompletionPct = totalSectionsCount > 0 ? Math.round((completedSectionsCount / totalSectionsCount) * 100) : 0;
  
  const displayRating = parseFloat(liveStats.average || '0').toFixed(1);
  const actualTotalRatings = liveStats.total || 0;
  const displayTotalRatings = course.metadata?.displayReviews || actualTotalRatings;

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Success Banner */}
      {justEnrolled && (
        <div className="bg-emerald-600 text-white px-6 py-5 flex items-center justify-between shadow-2xl relative z-50 animate-fade-up">
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-slate-900/20 p-2 rounded-full backdrop-blur-sm">
               <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
               <p className="font-bold text-lg leading-tight tracking-tight">Access Granted</p>
               <p className="text-emerald-50 text-sm font-medium leading-tight opacity-90">All {totalSectionsCount} sections are now fully unlocked for you.</p>
            </div>
          </div>
          <Link
            href={`/learn/${course.id}`}
            className="group bg-white dark:bg-slate-900 text-emerald-700 font-bold px-6 py-3 rounded-xl text-sm hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-sm"
          >
            Launch Course <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
               <span className="badge-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                 {course.metadata?.category || 'Expert Curriculum'}
               </span>
               {course.level && (
                 <>
                   <span className="w-1 h-1 bg-slate-300 rounded-full" />
                   <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{course.level.replace('_', ' ')}</span>
                 </>
               )}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-tight break-words">
              {course.title}
            </h1>

            {course.subtitle && (
              <h2 className="text-xl md:text-2xl text-slate-500 font-medium tracking-tight mt-1 mb-4">
                {course.subtitle}
              </h2>
            )}

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed font-medium break-words">
              {course.description || 'EmberQuest provides state-of-the-art technical mastery for mission-critical engineering roles.'}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-50 leading-none">{displayRating}</span>
                <div className="flex flex-col gap-0.5">
                   <StarRating rating={parseFloat(displayRating)} />
                   <span className="text-xs text-slate-500 font-medium">({displayTotalRatings} Reviews)</span>
                </div>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                <BookOpen className="w-5 h-5 text-blue-600" />
                {totalSectionsCount} Modules
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div className="flex flex-col">
                 <span className="text-xs text-slate-500 font-semibold uppercase">Instructor</span>
                 <span className="text-slate-900 dark:text-slate-50 font-medium">{course.instructor?.displayName || 'EmberQuest Expert'}</span>
              </div>
            </div>

            {/* Progress Bar (Enrolled Users) */}
            {isEnrolled && !justEnrolled && (
              <div className="bg-[#f8fafc] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 max-w-lg mt-8">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-col">
                     <span className="text-slate-900 dark:text-slate-50 font-bold text-lg">{sectionCompletionPct}% Mastery Achieved</span>
                     <span className="text-slate-500 text-sm">{completedSectionsCount} / {totalSectionsCount} Modules Cleared</span>
                  </div>
                  <Trophy className="w-8 h-8 text-blue-600" />
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${sectionCompletionPct}%` }}
                  />
                </div>
                <div className="mt-5 flex items-center justify-between">
                   <p className="text-sm text-slate-500 font-medium">{completedLecturesCount} Total Steps Finalized</p>
                   <Link href={`/learn/${course.id}`} className="btn-ember px-5 py-2 text-sm rounded-xl flex items-center gap-2">
                      Resume <PlayCircle className="w-4 h-4" />
                   </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right: Premium Purchase Card */}
          <div className="md:w-[400px] shrink-0">
            <div className="bg-white dark:bg-slate-900 rounded-[20px] shadow-lg p-6 text-slate-900 dark:text-slate-50 md:sticky md:top-24 border border-slate-200 dark:border-slate-800">
              <div 
                className="aspect-[16/10] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden mb-6 relative group border border-slate-200 dark:border-slate-800 cursor-pointer"
                onClick={() => course.promoVideoUrl && setShowPromoModal(true)}
              >
                <Image
                  src={getMediaUrl(course.thumbnailUrl)}
                  alt={course.title}
                  fill
                  priority
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                
                {/* Premium Play Overlay */}
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-all duration-300 flex items-center justify-center">
                   <div className="bg-white dark:bg-slate-900 rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                      <PlayCircle className="w-8 h-8 text-blue-600" />
                   </div>
                </div>

                <div className="absolute top-3 right-3 bg-white dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm">
                   {totalLecturesCount} Lectures
                </div>
              </div>

              {!isEnrolled && (
                <div className="text-4xl font-extrabold mb-6 text-slate-900 dark:text-slate-50 flex items-baseline gap-2">
                  {course.price > 0 ? (
                    <>
                       <span className="text-lg font-semibold text-slate-400 line-through">₹{(course.price * 1.5).toLocaleString()}</span>
                       ₹{course.price.toLocaleString()}
                    </>
                  ) : 'FREE'}
                </div>
              )}

              <EnrollButton courseId={course.id} price={course.price} courseTitle={course.title} partialAmount={course.partialAmount} />

              {/* Wishlist Heart Button */}
              {!isEnrolled && (
                <button
                  id="wishlist-toggle-btn"
                  onClick={toggleWishlist}
                  disabled={wishlistLoading}
                  className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border font-semibold text-sm transition-all ${
                    inWishlist
                      ? 'border-rose-300 text-rose-600 bg-rose-50 hover:bg-rose-100'
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 transition-all ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
                  {inWishlist ? 'Saved to Wishlist' : 'Save for Later'}
                </button>
              )}

              {course.metadata?.displayPurchases > 0 && !isEnrolled && (
                <div className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-slate-500">
                   <User className="w-4 h-4" />
                   Trusted by {course.metadata.displayPurchases.toLocaleString()} students
                </div>
              )}

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/50 space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Program Includes</p>
                {[
                  { icon: PlayCircle, label: `${totalLecturesCount} Deep-Dive Lectures` },
                  { icon: FileText, label: 'Industry-Standard Projects' },
                  { icon: Trophy, label: 'Certificate of Completion' },
                  { icon: Download, label: 'Lifetime Access' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Experience Body */}
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-16 font-sans">
        
        <div className="grid md:grid-cols-3 gap-12">
          {/* Left Column (Content) */}
          <div className="md:col-span-2 space-y-16">
            
            {/* Strategic Goals */}
            {(course.metadata?.objectives || []).length > 0 && (
              <section className="bg-white dark:bg-slate-900 rounded-[20px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-50 tracking-tight">What you'll learn</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(course.metadata?.objectives || []).map((obj: string, i: number) => (
                    <div key={i} className="flex gap-3 items-start">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{obj}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Curriculum Engine */}
            <section className="bg-white dark:bg-slate-900 rounded-[20px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight mb-2">Course Content</h2>
                  <p className="text-sm text-slate-500">{totalSectionsCount} Sections • {totalLecturesCount} Lectures</p>
                </div>
                <button
                   onClick={() => setOpenSections(syncedSections.reduce((acc, s) => ({ ...acc, [s.id]: true }), {}))}
                   className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
                >
                  Expand All
                </button>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200">
                {syncedSections.map((section, sIdx) => {
                  const isSectionComplete = section.lectures.length > 0 && section.lectures.every(l => l.progress?.isCompleted);
                  
                  return (
                    <div key={section.id}>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className={`w-full flex items-center justify-between px-6 py-5 ${openSections[section.id] ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-900'} hover:bg-slate-50 dark:bg-slate-800/50 transition text-left`}
                      >
                        <div className="flex items-center gap-4">
                          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openSections[section.id] ? 'rotate-180' : ''} shrink-0`} />
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 flex-wrap break-words">
                               {section.title}
                               {isSectionComplete && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-slate-500 shrink-0">{section.lectures.length} lectures</span>
                      </button>

                      {openSections[section.id] && (
                        <div className="divide-y divide-slate-100 bg-white dark:bg-slate-900">
                          {section.lectures.map((lecture, lIdx) => {
                            const canAccess = isEnrolled || lecture.isPreview;
                            const isLectureDone = lecture.progress?.isCompleted;
                            
                            return (
                              <div
                                key={lecture.id}
                                className={`flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 sm:pl-14 pl-6 gap-3 sm:gap-0 ${canAccess ? 'hover:bg-slate-50 dark:bg-slate-800/50 cursor-pointer' : 'opacity-60 cursor-not-allowed'} transition group`}
                                onClick={async () => {
                                  if (!canAccess) return;
                                  if (isEnrolled) {
                                    router.push(`/learn/${course.id}?lecture=${lecture.id}`);
                                  } else if (lecture.isPreview) {
                                    try {
                                      const res: any = await import('@/lib/api/client').then(m => m.default.get(`/video/${lecture.id}/preview`));
                                      const url = res?.url || res?.data?.url;
                                      if (url) {
                                        setPreviewVideoUrl(url);
                                        setPreviewLectureId(lecture.id);
                                      }
                                    } catch (e: any) {
                                      import('react-hot-toast').then(({ toast }) => toast.error(e.response?.data?.message || 'Preview not available'));
                                    }
                                  }
                                }}
                              >
                                <div className="flex items-start sm:items-center gap-3 w-full">
                                  {isLectureDone ? (
                                     <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
                                  ) : isEnrolled ? (
                                     <PlayCircle className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity absolute shrink-0 mt-0.5 sm:mt-0" />
                                  ) : (
                                    <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 sm:mt-0" />
                                  )}
                                  <p className={`text-sm break-words flex-1 pr-4 ${isLectureDone ? 'text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300 group-hover:text-blue-700'}`}>
                                    {lecture.title}
                                  </p>
                                </div>
                                <div className="flex items-center gap-4 pl-7 sm:pl-0">
                                  {lecture.isPreview && !isEnrolled && (
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Preview</span>
                                  )}
                                  {lecture.durationSeconds > 0 && (
                                    <span className="text-sm text-slate-500 font-medium">
                                      {formatDuration(lecture.durationSeconds)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Column (Requirements/Audience) */}
          <div className="space-y-8">
            {((course.metadata?.requirements || []).length > 0) && (
              <section className="bg-white dark:bg-slate-900 rounded-[20px] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-50 tracking-tight">Requirements</h2>
                <ul className="space-y-3">
                  {(course.metadata.requirements as string[]).map((req, i) => (
                    <li key={i} className="flex gap-3 items-start text-sm text-slate-700 dark:text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mt-2" />
                      <span className="leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {((course.metadata?.targetAudience || []).length > 0) && (
              <section className="bg-white dark:bg-slate-900 rounded-[20px] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-50 tracking-tight">Who this course is for</h2>
                <ul className="space-y-3">
                  {(course.metadata.targetAudience as string[]).map((aud, i) => (
                    <li key={i} className="flex gap-3 items-start text-sm text-slate-700 dark:text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mt-2" />
                      <span className="leading-relaxed">{aud}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            
            {/* Instructor Bio */}
            {(course.metadata?.instructorBio || course.instructor?.displayName) && (
              <section className="bg-white dark:bg-slate-900 rounded-[20px] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-slate-50 tracking-tight">Instructor</h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold shrink-0">
                    {(course.instructor?.displayName || 'E').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">{course.instructor?.displayName || 'EmberQuest Instructor'}</h3>
                    <p className="text-slate-500 text-sm">Course Lead</p>
                  </div>
                </div>
                {course.metadata?.instructorBio ? (
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{course.metadata.instructorBio}</p>
                ) : (
                  <p className="text-slate-500 text-sm italic">The instructor hasn't added a bio yet.</p>
                )}
              </section>
            )}
          </div>
        </div>

        {/* Holistic Peer Feedback Engine (Reviews) */}
        <section className="bg-white dark:bg-slate-900 rounded-[20px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm max-w-4xl">
          <div className="flex flex-col md:flex-row gap-12 items-start">
             <div className="w-full md:w-64 shrink-0">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6">Student Feedback</h2>
                <div className="text-center group mb-6">
                   <span className="text-6xl font-extrabold text-slate-900 dark:text-slate-50 leading-none">{displayRating}</span>
                   <div className="mt-3 flex justify-center">
                      <StarRating rating={parseFloat(displayRating)} size="md" />
                   </div>
                   <p className="mt-2 text-sm font-medium text-slate-500">Course Rating</p>
                </div>

                <div className="space-y-2 mb-8">
                   {[5, 4, 3, 2, 1].map(stars => {
                      const count = liveStats.distribution?.[stars] || 0;
                      const pct = actualTotalRatings > 0 ? (count / actualTotalRatings) * 100 : 0;
                      return (
                        <div key={stars} className="flex items-center gap-3">
                           <div className="flex items-center gap-1 w-8">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{stars}</span>
                           </div>
                           <div className="h-2 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-slate-400 rounded-full" style={{ width: `${pct}%` }} />
                           </div>
                           <span className="text-xs font-medium w-8 text-slate-500 text-right">{Math.round(pct)}%</span>
                        </div>
                      );
                   })}
                </div>

                {isEnrolled && !userReview && enableCourseReviews && (
                   <div className="space-y-3">
                      <button 
                        disabled={sectionCompletionPct < 100}
                        onClick={() => setShowManualReviewModal(true)}
                        className={`w-full rounded-xl py-3 text-sm font-bold transition-all ${
                           sectionCompletionPct < 100 
                           ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                           : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-50 hover:border-slate-300 dark:border-slate-700 shadow-sm hover:shadow'
                        }`}
                      >
                         Leave a Review
                      </button>
                      {sectionCompletionPct < 100 && (
                         <p className="text-xs text-slate-500 text-center">
                            Complete the course to leave a review.
                         </p>
                      )}
                   </div>
                )}
             </div>

             <div className="flex-1 space-y-6 w-full">
                <h3 className="font-bold text-slate-900 dark:text-slate-50">{reviews.length} Reviews</h3>
                <div className="space-y-6">
                   {reviews.length > 0 ? reviews.map((review: any) => (
                      <article key={review.id} className="border-b border-slate-100 dark:border-slate-800/50 pb-6 last:border-0 last:pb-0 relative">
                         {review.isCurrentUser && (
                            <span className="absolute top-0 right-0 badge-primary px-2 py-0.5 text-[10px]">Your Review</span>
                         )}
                         <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative border border-slate-200 dark:border-slate-800">
                               <Image 
                                  src={getAvatarUrl(review.user?.displayName, review.user?.avatarUrl)} 
                                  alt={review.user?.displayName || 'User'} 
                                  fill 
                                  className="object-cover" 
                               />
                            </div>
                            <div className="flex flex-col">
                               <span className="text-sm font-bold text-slate-900 dark:text-slate-50">{review.user?.displayName || 'Student'}</span>
                               <div className="flex items-center gap-2 mt-0.5">
                                 <StarRating rating={review.rating} />
                                 <span className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                               </div>
                            </div>
                         </div>
                         <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                            {review.comment}
                         </p>
                      </article>
                   )) : (
                      <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                         <p className="text-slate-500 font-medium">No reviews yet.</p>
                      </div>
                   )}
                </div>

                {hasMoreReviews && (
                   <button 
                      onClick={loadMoreReviews}
                      disabled={isLoadingMore}
                      className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800/50 transition-all"
                   >
                      {isLoadingMore ? "Loading..." : "Load More Reviews"}
                   </button>
                )}
             </div>
          </div>
        </section>

        {/* Soft Wall for Guests */}
        {showSoftWall && !isLoggedIn && (
           <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-fade-up">
              <div className="bg-slate-900/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-slate-800">
                 <div className="flex flex-col">
                    <h4 className="font-bold text-white text-lg">Join EmberQuest</h4>
                    <p className="text-slate-400 text-sm">Login to start learning today.</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <button onClick={() => setShowSoftWall(false)} className="text-slate-400 hover:text-white text-sm">Close</button>
                    <Link 
                      href={`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`}
                      className="btn-ember px-6 py-2 rounded-xl text-sm"
                    >
                      Login
                    </Link>
                 </div>
              </div>
           </div>
        )}
      </div>

      <ReviewModal 
        courseId={course.id}
        isOpen={showManualReviewModal}
        onClose={() => setShowManualReviewModal(false)}
        onSubmit={async (rating, comment) => {
           try {
              await learningApi.submitReview(course.id, rating, comment);
              setShowManualReviewModal(false);
              const reviewData = await courseApi.getReviews(course.id);
              setReviews(reviewData.reviews || []);
              if (reviewData.stats) setLiveStats(reviewData.stats);
              setUserReview({ rating, comment, isCurrentUser: true });
              import('react-hot-toast').then(({ toast }) => toast.success("Review submitted successfully."));
           } catch (err) {
              console.error(err);
           }
        }}
      />

      {/* Promo Video Modal */}
      {showPromoModal && course.promoVideoUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-fade-up">
          <div className="absolute inset-0" onClick={() => setShowPromoModal(false)}></div>
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl z-10 mx-4 border border-white/10">
            <button 
              onClick={() => setShowPromoModal(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white dark:bg-slate-900/10 hover:bg-white dark:bg-slate-900/20 text-white rounded-full flex items-center justify-center transition-all z-20"
            >
              <X className="w-5 h-5" />
            </button>
            <video 
              src={course.promoVideoUrl} 
              className="w-full h-full" 
              autoPlay 
              controls 
              playsInline
            />
          </div>
        </div>
      )}

      {/* Free Preview Video Modal */}
      {previewLectureId && previewVideoUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-fade-up">
          <div className="absolute inset-0" onClick={() => {
            setPreviewLectureId(null);
            setPreviewVideoUrl(null);
          }}></div>
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl z-10 mx-4 border border-white/10">
            <button 
              onClick={() => {
                setPreviewLectureId(null);
                setPreviewVideoUrl(null);
              }}
              className="absolute top-4 right-4 w-10 h-10 bg-white dark:bg-slate-900/10 hover:bg-white dark:bg-slate-900/20 text-white rounded-full flex items-center justify-center transition-all z-20"
            >
              <X className="w-5 h-5" />
            </button>
            <video 
              src={previewVideoUrl} 
              className="w-full h-full" 
              autoPlay 
              controls 
              playsInline
            />
          </div>
        </div>
      )}
    </div>
  );
}
