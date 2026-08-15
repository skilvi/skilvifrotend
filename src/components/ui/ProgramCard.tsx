'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CourseMinimal } from '@/lib/api/discovery';
import { getMediaUrl } from '@/lib/utils';
import { PlayCircle, Eye } from 'lucide-react';

interface ProgramCardProps {
  course: CourseMinimal;
}

// Category-to-accent color map
const CATEGORY_COLORS: Record<string, { top: string; badge: string; badgeText: string; icon: string }> = {
  'Technology':           { top: 'from-blue-600 to-blue-400',    badge: 'bg-blue-50 text-blue-700 border-blue-100',   badgeText: 'IT',         icon: '💻' },
  'Business':             { top: 'from-indigo-600 to-violet-500', badge: 'bg-violet-50 text-violet-700 border-violet-100', badgeText: 'MBA',     icon: '💼' },
  'Finance':              { top: 'from-emerald-600 to-teal-400',  badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', badgeText: 'Finance', icon: '📊' },
  'Marketing':            { top: 'from-rose-500 to-pink-400',     badge: 'bg-rose-50 text-rose-700 border-rose-100',   badgeText: 'Marketing',  icon: '📣' },
  'Design':               { top: 'from-purple-600 to-fuchsia-400',badge: 'bg-purple-50 text-purple-700 border-purple-100', badgeText: 'Design',  icon: '🎨' },
  'Personal Development': { top: 'from-amber-500 to-orange-400',  badge: 'bg-amber-50 text-amber-700 border-amber-100', badgeText: 'Soft Skills',icon: '🎯' },
  'default':              { top: 'from-blue-600 to-blue-400',    badge: 'bg-blue-50 text-blue-700 border-blue-100',   badgeText: 'IT',         icon: '📚' },
};

function deriveSkills(course: CourseMinimal): string[] {
  const m = course.metadata || {};
  if (Array.isArray(m.tags) && m.tags.length > 0) return m.tags.slice(0, 5);
  const words = course.title.split(/\s+/).filter(w => w.length > 3);
  return words.slice(0, 4);
}

export function ProgramCard({ course }: ProgramCardProps) {
  const m = course.metadata || {};
  const category = m.category || 'Technology';
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS['default'];
  const rating = parseFloat(m.reviewStats?.average || '0');
  const isBestseller = rating > 4.5 || m.isBestseller;
  const isFree = course.price === 0;
  const duration = m.duration || m.weeks ? `${m.duration || m.weeks} weeks` : null;
  const prerequisites = m.prerequisites || m.level || null;
  const skills = deriveSkills(course);
  const description = m.shortDescription || m.description || (course as any).description || '';

  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && course.promoVideoUrl) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Autoplay may be blocked by the browser; ignore quietly
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <Link 
      href={`/courses/${course.id}`}
      className="group bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.09)] hover:-translate-y-1 hover:border-slate-300 dark:border-slate-700 transition-all duration-300 flex flex-col cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Top accent stripe */}
      <div className={`h-1.5 bg-gradient-to-r ${colors.top} w-full flex-shrink-0 z-10`} />

      {/* Media Section: Thumbnail / Video on Hover */}
      <div className="relative aspect-[16/9] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-slate-100 dark:border-slate-800/50 flex-shrink-0 group/media block">
        {course.thumbnailUrl ? (
          <Image
            src={getMediaUrl(course.thumbnailUrl)}
            alt={course.title}
            fill
            className={`object-cover transition-transform duration-700 group-hover/media:scale-105 ${isHovered && course.promoVideoUrl ? 'opacity-0' : 'opacity-100'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
            <span className="text-4xl">{colors.icon}</span>
          </div>
        )}

        {course.promoVideoUrl && (
          <video
            ref={videoRef}
            src={course.promoVideoUrl}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            muted
            loop
            playsInline
          />
        )}

      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1 gap-4">

        {/* Icon row + category badge */}
        <div className="flex items-start justify-between gap-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${colors.badge} flex-shrink-0`}>
            <span className="text-[10px]">&lt;/&gt;</span>
            {colors.badgeText}
          </span>
          <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
            {duration && (
              <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800/50">
                <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
                {duration}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="group/title block">
          <h3 className="font-bold text-slate-900 dark:text-slate-50 text-[17px] leading-snug group-hover/title:text-blue-600 transition-colors line-clamp-2">
            {course.title}
          </h3>
        </div>

        {/* Duration + prerequisites + bestseller */}
        <div className="flex flex-wrap gap-2 items-center">
          {prerequisites && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 rounded-full text-[11px] font-medium text-slate-600 dark:text-slate-400 max-w-[160px] truncate">
              <svg className="w-3 h-3 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span className="truncate">{prerequisites}</span>
            </span>
          )}
          {isBestseller && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-full text-[11px] font-semibold text-blue-700">
              <svg className="w-3 h-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              Best Seller
            </span>
          )}
          {isFree && (
            <span className="inline-flex items-center px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[11px] font-semibold text-emerald-700">
              Free
            </span>
          )}
        </div>

        {/* Skill tags */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
            {skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-md text-[10px] font-semibold"
              >
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="px-2 py-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 text-slate-500 rounded-md text-[10px] font-medium">
                +{skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-slate-100 dark:border-slate-800/50 mt-2" />

        {/* Action buttons */}
        <div className="flex gap-2">
          <div className="flex-1 py-2.5 px-4 border border-blue-200 text-blue-600 font-semibold text-sm rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all text-center">
            Know More
          </div>
          <div className="flex-1 py-2.5 px-4 bg-gradient-to-br from-blue-600 to-blue-500 text-white font-semibold text-sm rounded-xl shadow-[0_4px_16px_rgba(37,99,235,0.25)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5">
            Enroll Now
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
