'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { learningApi, CourseView, Section, Lecture } from '@/lib/api/learning';
import { discoveryApi, CourseMinimal } from '@/lib/api/discovery';
import dynamic from 'next/dynamic';

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
import { ReviewModal } from '@/components/learn/ReviewModal';
import { useAuthStore } from '@/store/authStore';
import { Award } from 'lucide-react';
import { toast } from 'react-hot-toast';

type TabId = 'overview' | 'notes' | 'qa';

import { useParams } from 'next/navigation';

export default function CourseLearningExperience() {
  const params = useParams();
  const courseId = params?.courseId as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [courseData, setCourseData] = useState<CourseView | null>(null);
  const [activeLectureId, setActiveLectureId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasDismissedReview, setHasDismissedReview] = useState(false);
  const [isReviewed, setIsReviewed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [notes, setNotes] = useState('');
  const [recommendations, setRecommendations] = useState<CourseMinimal[]>([]);

  // Flatten lectures for quick lookups and progress metrics
  const flatLectures: Lecture[] = courseData 
     ? courseData.sections.flatMap(s => s.lectures)
     : [];

  const completedCount = flatLectures.filter(l => l.progress?.isCompleted).length;
  const completionPct = flatLectures.length ? (completedCount / flatLectures.length) * 100 : 0;

  useEffect(() => {
    // Optimized fetch retrieving full hierarchical structure
    const loadState = async () => {
       if (!courseId) return;
       try {
          const res = await learningApi.getCourseView(courseId);
          setCourseData(res);
          setIsReviewed(res.isReviewed);
          
          // Flatten locally to find first unlock
          const lectures = res.sections.flatMap(s => s.lectures);
          
          // Resume directly on the first purely unlocked/uncompleted lecture
          const resumeTarget = lectures.find(l => !l.isLocked && !l.progress?.isCompleted) || lectures[0];
          if (resumeTarget) setActiveLectureId(resumeTarget.id);
       } catch (err) {
          console.error("Consumption retrieval fail", err);
       } finally {
          setIsLoading(false);
       }
    };
    loadState();
  }, [courseId]);

  // Load recommendations
  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res: any = await discoveryApi.getFeaturedCourses();
        const courses = res?.courses || res?.data?.courses || res?.data || [];
        // Filter out current course
        setRecommendations(courses.filter((c: CourseMinimal) => c.id !== courseId).slice(0, 4));
      } catch (err) {
        console.error("Recs fetch failed", err);
      }
    };
    fetchRecs();
  }, [courseId]);

  // Load saved notes when lecture changes
  useEffect(() => {
    if (activeLectureId) {
      const saved = localStorage.getItem(`notes_${courseId}_${activeLectureId}`);
      setNotes(saved || '');
    }
  }, [activeLectureId, courseId]);

  // Automatically trigger review modal if 100% reached for the first time
  useEffect(() => {
    if (!isLoading && completionPct >= 100) {
       if (!isReviewed && !showReviewModal && !hasDismissedReview) {
          setShowReviewModal(true);
       }
    }
  }, [completionPct, isReviewed, isLoading, showReviewModal, hasDismissedReview]);

  if (isLoading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent" /></div>;
  }

  const activeLecture = flatLectures.find(l => l.id === activeLectureId) || null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-100 flex-col md:flex-row">
      {/* Sticky Progress Bar at the very top */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[60] bg-slate-800">
         <div 
           className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000" 
           style={{ width: `${completionPct}%` }} 
         />
      </div>

      {/* Dynamic Video & Consumption Execution Screen */}
      <main className="flex-1 flex flex-col overflow-y-auto relative pt-1">
         <header className="p-4 flex items-center gap-4 bg-slate-950/50 backdrop-blur-sm border-b border-white/5 sticky top-0 z-50">
            <a href={`/courses/${courseId}`} className="text-slate-400 hover:text-white transition flex items-center gap-2 text-sm font-medium">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
               Back to details
            </a>
            <div className="h-4 w-px bg-slate-800 mx-2 hidden md:block"></div>
            <h1 className="font-bold text-lg truncate flex-1 text-slate-100">{activeLecture?.title || 'Course Content'}</h1>
            
            <div className="flex items-center gap-4">
              {completionPct >= 100 && (
                <button 
                  onClick={() => router.push(`/learn/${courseId}/success`)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
                >
                  <Award className="w-4 h-4" />
                  Claim Certificate
                </button>
              )}
              
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{Math.round(completionPct)}% Complete</span>
              </div>
            </div>
         </header>

         {/* Explicit Media Interaction Boundary */}
         <div className="w-full flex-1 flex flex-col bg-black items-center">
            {activeLecture ? (
               activeLecture.contentType === 'assignment' ? (
                 <AssignmentPlayer
                   key={activeLecture.id}
                   courseId={courseId}
                   lectureId={activeLecture.id}
                   assignment={activeLecture.assignment}
                   onComplete={() => {
                        setCourseData(prev => {
                          if (!prev) return prev;
                          const newSections = [...prev.sections];
                          let nextLectureId: string | null = null;
                          let foundCurrent = false;
                          let markNextUnlocked = false;

                          for (let i = 0; i < newSections.length; i++) {
                            const newLectures = [...newSections[i].lectures];
                            for (let j = 0; j < newLectures.length; j++) {
                              if (markNextUnlocked) {
                                newLectures[j] = { ...newLectures[j], isLocked: false };
                                markNextUnlocked = false;
                              }
                              if (newLectures[j].id === activeLecture.id) {
                                newLectures[j] = { 
                                  ...newLectures[j], 
                                  progress: { watchTimeSeconds: activeLecture.durationSeconds || 100, isCompleted: true } 
                                };
                                foundCurrent = true;
                                markNextUnlocked = true;
                              } else if (foundCurrent && !nextLectureId) {
                                nextLectureId = newLectures[j].id;
                              }
                            }
                            newSections[i] = { ...newSections[i], lectures: newLectures };
                          }

                          if (nextLectureId) {
                            setTimeout(() => setActiveLectureId(nextLectureId), 500);
                          } else {
                            setTimeout(() => {
                              import('react-hot-toast').then(({ toast }) => {
                                toast.success('Course completed! Well done!', { icon: '🎉' });
                                if (!isReviewed) {
                                  setShowReviewModal(true);
                                } else {
                                  router.push(`/learn/${courseId}/success`);
                                }
                              });
                            }, 500);
                          }

                          return { ...prev, sections: newSections };
                        });
                   }}
                 />
               ) : (
                <VideoPlayer 
                   key={activeLecture.id} // Forces re-mount specifically on node transition
                   courseId={courseId}
                   lectureId={activeLecture.id} 
                   resumeFrom={activeLecture.progress?.watchTimeSeconds || 0}
                   fallbackUrl={activeLecture.videoUrl}
                    onComplete={() => {
                        // Mark complete locally to dynamically unlock the following element with a premium toast!
                        setCourseData(prev => {
                          if (!prev) return prev;
                          const newSections = [...prev.sections];
                          let nextLectureId: string | null = null;
                          let foundCurrent = false;
                          let markNextUnlocked = false;

                          for (let i = 0; i < newSections.length; i++) {
                            const newLectures = [...newSections[i].lectures];
                            for (let j = 0; j < newLectures.length; j++) {
                              if (markNextUnlocked) {
                                newLectures[j] = { ...newLectures[j], isLocked: false };
                                markNextUnlocked = false;
                              }
                              if (newLectures[j].id === activeLecture.id) {
                                newLectures[j] = { 
                                  ...newLectures[j], 
                                  progress: { watchTimeSeconds: activeLecture.durationSeconds, isCompleted: true } 
                                };
                                foundCurrent = true;
                                markNextUnlocked = true;
                              } else if (foundCurrent && !nextLectureId) {
                                nextLectureId = newLectures[j].id;
                              }
                            }
                            newSections[i] = { ...newSections[i], lectures: newLectures };
                          }

                          // Auto-transition logic with a professional delay for UI feedback
                          if (nextLectureId) {
                            import('react-hot-toast').then(({ toast }) => {
                              toast.success('Lecture completed! Moving to next...', { icon: '🎓' });
                              setTimeout(() => setActiveLectureId(nextLectureId), 1500);
                            });
                          } else {
                            import('react-hot-toast').then(({ toast }) => {
                              toast.success('Course completed! Well done!', { icon: '🎉' });
                              if (!isReviewed) {
                                setShowReviewModal(true);
                              } else {
                                setTimeout(() => {
                                  router.push(`/learn/${courseId}/success`);
                                }, 1500);
                              }
                            });
                          }

                          return { ...prev, sections: newSections };
                        });
                    }}
                />
               )
            ) : (
                <div className="flex-1 flex items-center justify-center p-8 bg-slate-800 w-full text-center">
                   <h2 className="text-2xl font-bold">Curriculum Exhausted</h2>
                   <p className="mt-2 text-slate-400">Content will continuously buffer upon initialization.</p>
                </div>
            )}
         </div>

          {/* Tab Bar */}
          <div className="border-t border-slate-800 bg-slate-950">
            <div className="flex border-b border-slate-800 px-4">
              {([
                { id: 'overview' as TabId, label: 'Overview' },
                { id: 'notes' as TabId, label: 'My Notes' },
                { id: 'qa' as TabId, label: 'Q&A' },
              ]).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 max-w-4xl">
              {activeTab === 'overview' && courseData && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-white mb-2">{(courseData as any).title || 'About this Course'}</h2>
                    <p className="text-slate-400 leading-relaxed">{(courseData as any).description || 'No description available for this course.'}</p>
                  </div>
                  {(courseData as any).instructor?.displayName && (
                    <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                      <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shrink-0">
                        {(courseData as any).instructor.displayName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-bold">{(courseData as any).instructor.displayName}</p>
                        <p className="text-slate-400 text-sm">Course Instructor</p>
                        {(courseData as any).metadata?.instructorBio && (
                          <p className="text-slate-400 text-sm mt-1">{(courseData as any).metadata.instructorBio}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {(courseData as any).metadata?.objectives?.length > 0 && (
                    <div>
                      <h3 className="text-base font-black text-white mb-3">What You'll Learn</h3>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(courseData as any).metadata.objectives.map((obj: string, i: number) => (
                          <li key={i} className="flex gap-2 text-slate-400 text-sm">
                            <span className="text-emerald-500 font-black shrink-0 mt-0.5">✓</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-black text-white">Personal Notes</h2>
                    <span className="text-xs text-slate-500">Saved locally in your browser</span>
                  </div>
                  <textarea
                    value={notes}
                    onChange={e => {
                      setNotes(e.target.value);
                      localStorage.setItem(`notes_${courseId}_${activeLectureId}`, e.target.value);
                    }}
                    className="w-full min-h-[200px] bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-300 text-sm leading-relaxed resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-600"
                    placeholder="Take notes for this lecture... your notes are saved locally."
                  />
                </div>
              )}

              {activeTab === 'qa' && (
                <div className="max-w-3xl mx-auto py-8">
                  <QAPanel 
                    courseId={courseId} 
                    activeLectureId={activeLectureId || undefined} 
                    currentUserId={user?.id}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Recommendations / Upsell Section */}
          {recommendations.length > 0 && (
            <div className="mt-12 mb-20 px-6 max-w-4xl">
              <div className="flex flex-col md:flex-row md:items-end justify-between items-start mb-8 gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-white tracking-tight">Expand Your Horizon</h2>
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
            </div>
          )}
      </main>

      {/* Structural Sidebar natively iterating Sections/Lectures */}
      <aside className="w-full md:w-80 lg:w-96 bg-slate-950 border-l border-slate-800 flex flex-col h-full shrink-0 z-20">
         <div className="p-4 font-bold border-b border-slate-800 flex justify-between items-center">
            Course Content
            <span className="md:hidden text-xs px-2 py-1 bg-slate-800 rounded-full text-emerald-400">{Math.round(completionPct)}% done</span>
         </div>
         {courseData && (
             <SyllabusSidebar />
         )}
      </aside>

      <ReviewModal 
         courseId={courseId}
         isOpen={showReviewModal}
         onClose={() => {
            setShowReviewModal(false);
            setHasDismissedReview(true);
         }}
         onSubmit={async (rating, comment) => {
            try {
               await learningApi.submitReview(courseId, rating, comment);
               setIsReviewed(true);
               setShowReviewModal(false);
               toast.success("Review submitted! Your certificate is now available.", { icon: '🏅' });
               
               // Redirect to success page with a slight delay for toast visibility
               setTimeout(() => {
                  router.push(`/learn/${courseId}/success`);
               }, 1500);
            } catch (err) {
               toast.error("Failed to submit review. Please try again.");
               throw err;
            }
         }}
      />
    </div>
  );
}
