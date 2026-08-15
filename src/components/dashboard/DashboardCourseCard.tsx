import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Award, CheckCircle, Download, Star } from 'lucide-react';
import { DashboardEnrollment } from '@/lib/api/dashboard';
import { getMediaUrl } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { downloadCertificatePDF } from '@/components/certificate/CertificateTemplate';

interface DashboardCourseCardProps {
  enrollment: DashboardEnrollment;
}

export function DashboardCourseCard({ enrollment }: DashboardCourseCardProps) {
  const { user } = useAuthStore();
  const isComplete = enrollment.progressPercent >= 100;
  const canDownload = isComplete && enrollment.isReviewed && (enrollment.reviewRating || 0) > 3;
  const needsReview = isComplete && !enrollment.isReviewed;

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canDownload || !user) return;
    await downloadCertificatePDF({
      studentName: user.displayName || 'EmberQuest Graduate',
      certId: `CERT-${enrollment.courseId.substring(0, 4)}-${user.id.substring(0, 4)}`.toUpperCase(),
      role: 'Learner',
      courseName: enrollment.title,
      orgName: 'EmberQuest',
      startDate: enrollment.enrolledAt ? new Date(enrollment.enrolledAt) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: enrollment.completedAt ? new Date(enrollment.completedAt) : (enrollment.lastAccessed ? new Date(enrollment.lastAccessed) : new Date()),
    });
  };

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_50px_rgba(0,0,0,0.09)] hover:-translate-y-1 hover:border-[rgba(15,23,42,0.08)] transition-all duration-300 flex flex-col h-full">

      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
        <Image
          src={getMediaUrl(enrollment.thumbnailUrl)}
          alt={enrollment.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {enrollment.isNew && (
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm">
              New
            </span>
          )}
          {isComplete && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm">
              ✓ Complete
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-4">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {enrollment.title}
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-1">
            {enrollment.lastAccessed
              ? `Last accessed ${new Date(enrollment.lastAccessed).toLocaleDateString()}`
              : 'Not started yet'}
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500">Progress</span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-50">{Math.round(enrollment.progressPercent)}%</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isComplete
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : 'bg-gradient-to-r from-blue-600 to-blue-400'
              }`}
              style={{ width: `${Math.round(enrollment.progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Certificate section */}
        {isComplete && (
          <div>
            {needsReview ? (
              <Link
                href={`/learn/${enrollment.courseId}`}
                className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 hover:border-amber-300 transition-all group/cert"
              >
                <div className="w-8 h-8 bg-amber-200 rounded-lg flex items-center justify-center group-hover/cert:bg-amber-500 group-hover/cert:text-white transition-colors flex-shrink-0">
                  <Star className="w-4 h-4 text-amber-700 group-hover/cert:text-white fill-current" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-amber-800 leading-snug">Leave a review to unlock certificate</p>
                </div>
              </Link>
            ) : enrollment.isReviewed ? (
              <div
                onClick={handleDownload}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                  canDownload
                    ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 group/dl'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 opacity-70'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  canDownload ? 'bg-emerald-200 group-hover/dl:bg-emerald-500' : 'bg-slate-200'
                }`}>
                  <Award className={`w-4 h-4 ${canDownload ? 'text-emerald-700 group-hover/dl:text-white' : 'text-slate-400'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-semibold leading-snug ${canDownload ? 'text-emerald-800' : 'text-slate-500'}`}>
                    {canDownload ? 'Certificate ready — click to download' : 'Final verification pending'}
                  </p>
                </div>
                {canDownload && <Download className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
              </div>
            ) : null}
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto">
          <Link href={`/learn/${enrollment.courseId}`} className="block w-full">
            <div className={`w-full py-3 rounded-[14px] font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 ${
              isComplete
                ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                : 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-[0_4px_16px_rgba(37,99,235,0.25)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.35)]'
            }`}>
              {isComplete ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Review Course
                </>
              ) : enrollment.progressPercent > 0 ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Resume Learning
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Course
                </>
              )}
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
