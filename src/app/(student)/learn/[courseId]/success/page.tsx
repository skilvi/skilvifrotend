'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { learningApi, CourseView } from '@/lib/api/learning';
import { CourseRecommendations } from '@/components/learn/CourseRecommendations';
import { Award, CheckCircle, Download, Share2, Sparkles, Trophy, BookOpen, Clock, Target, FileText, Check, ArrowRight, Briefcase } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import confetti from 'canvas-confetti';
import { CourseReviewCard } from '@/components/learn/CourseReviewCard';

// The certificates are fetched securely through the backend.
import apiClient from '@/lib/api/client';

export default function GraduationSuccessPage({ params }: { params: { courseId: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<CourseView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [certId, setCertId] = useState<string | null>(null);
  const [certRecord, setCertRecord] = useState<any>(null);
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);
  const { user, isLoading: authLoading } = useAuthStore();

  // ── Guard: if courseId is somehow undefined, redirect home ─────────────────
  useEffect(() => {
    if (!params.courseId || params.courseId === 'undefined') {
      router.replace('/dashboard');
    }
  }, [params.courseId, router]);

  useEffect(() => {
    if (!params.courseId || params.courseId === 'undefined' || !user || authLoading) return;

    const loadData = async () => {
      try {
        const res = await learningApi.getCourseView(params.courseId);
        setCourse(res);
        triggerConfetti();
      } catch (err) {
        console.error('Failed to load course for success page', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [params.courseId, user, authLoading]);

  // ── Fetch or create cert record on the verification system ─────────────────
  useEffect(() => {
    if (!course || !user || authLoading || !params.courseId || params.courseId === 'undefined') return;

    const fetchOrCreateCert = async () => {
      const userCourseKey = `${user.id}__${params.courseId}`;

      try {
        // Fetch from backend using the standard api client
        const res: any = await apiClient.get(`/certificates/check?courseId=${params.courseId}`);
        
        if (res?.success && res.exists && res.record) {
          setCertId(res.record.certificateId || res.record.uniqueCertId);
          setCertRecord({ ...res.record, enrolledAt: res.enrolledAt });
          return;
        }

        // If not found in records, generate it using the backend endpoint
        const generateRes: any = await apiClient.post('/certificates/generate', {
          courseId: params.courseId
        });

        if (generateRes?.success && generateRes.data) {
          const newCert = generateRes.data.uniqueCertId ? generateRes.data : generateRes.data.record;
          setCertId(newCert?.uniqueCertId || newCert?.certificateId);
          setCertRecord({ ...newCert, enrolledAt: res?.enrolledAt });
          return;
        }
      } catch (err) {
        console.error('[cert] Failed to fetch/create cert:', err);
      }
    };

    fetchOrCreateCert();
  }, [course, user, params.courseId, authLoading]);

  const triggerConfetti = () => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#22C55E', '#3B82F6', '#10B981']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#22C55E', '#3B82F6', '#10B981']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleDownload = async () => {
    if (!course || !user) return;
    setIsGeneratingCert(true);

    try {
      if (!certId) {
        alert("Certificate generation is still in progress or failed. Please refresh the page or contact support.");
        return;
      }
      const verifyUrl = `https://verify.emberquest.in/verify/${certId}`;

      // Generate QR code as dataURL
      let qrCodeUrl: string | undefined;
      try {
        const QRCode = (await import('qrcode')).default;
        qrCodeUrl = await QRCode.toDataURL(verifyUrl);
      } catch { /* QR optional */ }

      // Dynamically load heavy PDF dependencies only when user requests download
      const [{ pdf }, { CertificateDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/certificate/CertificateTemplate')
      ]);

      const blob = await pdf(
        <CertificateDocument
          studentName={user.displayName || 'EmberQuest Graduate'}
          certId={certId}
          role="Course Graduate"
          courseName={course.title}
          orgName="EmberQuest"
          startDate={certRecord?.enrolledAt ? new Date(certRecord.enrolledAt) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
          endDate={certRecord?.issueDate ? new Date(certRecord.issueDate) : new Date()}
          qrCodeUrl={qrCodeUrl}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificate-${certId}-${(user.displayName || 'Graduate').replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsGeneratingCert(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  const allLectures = course?.sections.flatMap(s => s.lectures) || [];
  const totalDuration = allLectures.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
  const assignmentsCount = allLectures.filter(l => l.contentType === 'assignment').length;

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 overflow-x-hidden pt-12 pb-24 relative font-sans transition-colors duration-300">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-gradient-to-b from-emerald-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-6 space-y-20 relative z-10">

        {/* 1. Hero Celebration Section */}
        <div className="text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500/30 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-emerald-500/10 w-36 h-36 rounded-[2.5rem] flex items-center justify-center transform hover:-translate-y-2 hover:shadow-emerald-500/20 transition-all duration-500 cursor-default animate-in zoom-in duration-500">
                <Trophy className="w-20 h-20 text-emerald-500 drop-shadow-md" strokeWidth={1.5} />
              </div>
              <div className="absolute -top-4 -right-4 bg-emerald-500 p-3 rounded-2xl border-4 border-slate-50 dark:border-slate-950 shadow-lg animate-bounce" style={{ animationDuration: '2.5s' }}>
                <CheckCircle className="w-7 h-7 text-white" strokeWidth={3} />
              </div>
            </div>
          </div>

          <div className="space-y-6 max-w-3xl mx-auto px-2">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 dark:from-emerald-400 dark:via-teal-400 dark:to-blue-500 bg-clip-text text-transparent py-2 tracking-tight drop-shadow-sm break-words">
              Congratulations!
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              You have successfully mastered the concepts in
              <span className="text-slate-900 dark:text-white font-black text-2xl md:text-3xl mt-6 block p-5 md:p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800/60 ring-1 ring-slate-900/5 dark:ring-white/5 break-words">
                 {course?.title || 'this course'}
                 {course?.subtitle && (
                   <span className="block text-lg md:text-xl font-semibold text-slate-500 dark:text-slate-400 mt-2">
                     {course.subtitle}
                   </span>
                 )}
              </span>
            </p>
            {certId && (
              <div className="pt-4 flex justify-center">
                <div className="text-sm font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-900/30 px-5 py-3 rounded-2xl md:rounded-full flex flex-col sm:flex-row items-center gap-2 border border-emerald-200 dark:border-emerald-800/50 backdrop-blur-sm max-w-full">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    <span>Certificate ID:</span>
                  </div>
                  <span className="font-black tracking-wide break-all text-center sm:text-left">{certId}</span>
                </div>
              </div>
            )}
          </div>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleDownload}
              disabled={isGeneratingCert}
              className="w-full sm:w-auto bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-slate-900/10 dark:shadow-white/5 hover:shadow-2xl hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5 shrink-0" />
              <span className="break-words">{isGeneratingCert ? 'Generating...' : 'Download Certificate'}</span>
            </button>
            <button
              onClick={() => {
                const url = `${window.location.origin}/courses/${params.courseId}`;
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
              }}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-blue-600/20 hover:shadow-2xl hover:-translate-y-1"
            >
              <Share2 className="w-5 h-5 shrink-0" />
              <span className="break-words">Share on LinkedIn</span>
            </button>
          </div>
          {certId && (
            <a
              href={`https://verify.emberquest.in/verify/${certId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium underline underline-offset-4 transition-colors block pt-2 break-words"
            >
              View & Verify Certificate Online →
            </a>
          )}
        </div>

        {/* 2. Course Achievement Statistics */}
        <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            Achievement Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 md:p-6 rounded-2xl shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="mx-auto bg-slate-50 dark:bg-slate-800 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
              <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Duration</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white break-words">{formatDuration(totalDuration)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 md:p-6 rounded-2xl shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="mx-auto bg-emerald-50 dark:bg-emerald-900/30 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Lessons</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white break-words">{allLectures.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 md:p-6 rounded-2xl shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="mx-auto bg-blue-50 dark:bg-blue-900/30 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Assignments</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white break-words">{assignmentsCount}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-500/30 dark:border-emerald-500/20 p-4 md:p-6 rounded-2xl shadow-md text-center ring-1 ring-emerald-500/10 dark:ring-emerald-500/5">
              <div className="mx-auto bg-emerald-500 w-10 h-10 rounded-full flex items-center justify-center mb-3 shadow-sm shadow-emerald-500/40">
                <Award className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs md:text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1 break-words">Completion</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400 break-words">100%</p>
            </div>
          </div>
        </div>

        {/* Layout Grid for Timeline & Next Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">

          {/* 3. Learning Journey Timeline */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-6">Your Journey</h2>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm h-full flex flex-col">
              <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Enrolled</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
                    {certRecord?.enrolledAt ? new Date(certRecord.enrolledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Started Learning'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completed</p>
                  <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {certRecord?.issueDate ? new Date(certRecord.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="space-y-6 flex-1">
                {[
                  { title: 'Fundamentals Completed', desc: 'Mastered the core concepts' },
                  { title: 'Practical Exercises Done', desc: 'Applied knowledge in real scenarios' },
                  { title: 'Certification Earned', desc: 'Graduated with 100% completion' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-4 ring-emerald-50 dark:ring-emerald-900/30">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      {i < 2 && <div className="w-0.5 h-full bg-emerald-100 dark:bg-emerald-900/50 my-1"></div>}
                    </div>
                    <div className="pb-4 flex-1">
                      <p className="font-bold text-slate-900 dark:text-white break-words">{item.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 break-words">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Career Opportunities & Tools */}
          <div className="flex flex-col h-full gap-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Take the Next Step</h2>
            
            {/* Course Review Component */}
            <div className="mb-2">
              <CourseReviewCard courseId={params.courseId} />
            </div>

            {/* Main Placement CTA */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-emerald-700 dark:to-teal-900 rounded-2xl p-6 shadow-lg text-white flex flex-col justify-center items-center text-center relative overflow-hidden group flex-1">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-xl font-black mb-2 break-words">Ready for a Career?</h3>
              <p className="text-emerald-50 mb-6 text-sm max-w-sm leading-relaxed break-words">
                Use your newly earned skills to land internships, showcase your portfolio, and get hired through our placement cell.
              </p>
              
              <a 
                href="https://www.emberquest.in/placement" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 text-sm"
              >
                Check Placement Site <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Upcoming Tools */}
            <div className="space-y-3">
              {[
                { link: '/coming-soon', icon: FileText, colorClass: 'bg-blue-50 dark:bg-blue-500/10', iconClass: 'text-blue-600 dark:text-blue-400', title: 'Resume Builder', desc: 'Craft a professional resume', hoverColor: 'group-hover:text-blue-600 dark:group-hover:text-blue-400' },
                { link: '/coming-soon', icon: Sparkles, colorClass: 'bg-purple-50 dark:bg-purple-500/10', iconClass: 'text-purple-600 dark:text-purple-400', title: 'Project Showcase', desc: 'Add your capstone to the gallery', hoverColor: 'group-hover:text-purple-600 dark:group-hover:text-purple-400' },
                { link: '/coming-soon', icon: Target, colorClass: 'bg-emerald-50 dark:bg-emerald-500/10', iconClass: 'text-emerald-600 dark:text-emerald-400', title: 'Portfolio Review', desc: 'Get expert feedback on your profile', hoverColor: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400' },
              ].map((item) => (
                <a href={item.link} key={item.title} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-blue-500/50 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between block">
                  <div className="flex items-center gap-4">
                    <div className={`${item.colorClass} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
                      <item.icon className={`w-5 h-5 ${item.iconClass} group-hover:scale-110 transition-transform`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm break-words">{item.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 break-words">{item.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 text-slate-300 dark:text-slate-600 ${item.hoverColor} transition-colors group-hover:translate-x-1 shrink-0`} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Course Recommendations */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <CourseRecommendations />
        </div>
      </div>
    </div>
  );
}
