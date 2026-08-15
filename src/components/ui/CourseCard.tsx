import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CourseMinimal } from '@/lib/api/discovery';
import { getMediaUrl } from '@/lib/utils';

interface CourseCardProps {
  course: CourseMinimal;
}

export function CourseCard({ course }: CourseCardProps) {
  const m = course.metadata || {};
  const rating = parseFloat(m.reviewStats?.average || '0').toFixed(1);
  const totalReviews = m.reviewStats?.total || 0;
  const isBestseller = parseFloat(rating) > 4.6;
  const isFree = course.price === 0;

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group flex flex-col bg-white dark:bg-slate-900 rounded-[20px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.10)] hover:-translate-y-1 hover:border-[rgba(15,23,42,0.08)] transition-all duration-300 cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="w-full relative aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
        <Image
          src={getMediaUrl(course.thumbnailUrl)}
          alt={course.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isBestseller && (
            <span className="bg-amber-400 text-amber-900 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm">
              Bestseller
            </span>
          )}
          {isFree && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm">
              Free
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Category badge */}
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            {m.category || 'Development'}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-[15px] leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
          {course.title}
        </h3>

        {/* Instructor */}
        <p className="text-xs text-slate-500 font-medium">
          {m.instructorName || 'Platform Instructor'}
        </p>

        {/* Footer: Rating + Price */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              {parseFloat(rating) > 0 ? rating : 'New'}
            </span>
            {totalReviews > 0 && (
              <span className="text-xs text-slate-400">({totalReviews})</span>
            )}
          </div>

          <div>
            {isFree ? (
              <span className="text-base font-bold text-emerald-600">Free</span>
            ) : (
              <span className="text-base font-bold text-slate-900 dark:text-slate-50">
                ₹{course.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
