'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, ArrowRight } from 'lucide-react';
import { CourseMinimal } from '@/lib/api/discovery';
import { getMediaUrl } from '@/lib/utils';

export function HeroSlideshow({ courses }: { courses?: CourseMinimal[] }) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const slides = courses && courses.length > 0 ? courses.slice(0, 3) : [];

  useEffect(() => {
    if (isHovered || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  if (!slides || slides.length === 0) return null;

  const next = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  const currentCourse = slides[current];
  const rating = parseFloat(currentCourse.metadata?.reviewStats?.average || '0');

  return (
    <div 
      className="relative w-full max-w-xl mx-auto group/hero"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-[3rem] scale-95 transition-opacity duration-1000"></div>

      {/* Main Container */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 sm:p-3 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col group-hover/hero:shadow-[0_30px_80px_rgba(37,99,235,0.08)] transition-all duration-500">
        
        {/* Slides Track */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] overflow-hidden rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50">
          <div className="absolute inset-0 flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${current * 100}%)` }}>
            {slides.map((course) => (
              <div key={course.id} className="min-w-full h-full relative cursor-pointer" onClick={() => window.location.href = `/courses/${course.id}`}>
                {course.thumbnailUrl ? (
                  <Image 
                    src={getMediaUrl(course.thumbnailUrl)} 
                    alt={course.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover/hero:scale-105"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-50/50">
                    <span className="text-4xl opacity-50">📚</span>
                  </div>
                )}
                {/* Subtle gradient overlay for image depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/hero:opacity-100 transition-opacity"></div>
              </div>
            ))}
          </div>

          {/* Featured Badge */}
          <div className="absolute top-4 left-4 bg-white dark:bg-slate-900/95 backdrop-blur-sm border border-slate-100 dark:border-slate-800/50 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 z-10 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Featured Program</span>
          </div>
        </div>

        {/* Content Section below image */}
        <div className="px-4 py-5 sm:px-5 relative z-10 space-y-4">
           <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                 <Link href={`/courses/${currentCourse.id}`} className="group/link block">
                   <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50 leading-tight group-hover/link:text-blue-600 transition-colors line-clamp-2">
                     {currentCourse.title}
                   </h3>
                 </Link>
                 <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{currentCourse.metadata?.category || 'Technology'}</p>
              </div>
              {rating > 0 && (
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 shrink-0">
                   <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                   <span className="text-xs font-bold text-amber-700">{rating.toFixed(1)}</span>
                </div>
              )}
           </div>

           {/* Controls & CTA */}
           <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/50">
              <div className="flex gap-2">
                 <button onClick={prev} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-white dark:bg-slate-900 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                    <ChevronLeft className="w-4 h-4 pr-0.5" />
                 </button>
                 <button onClick={next} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-white dark:bg-slate-900 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                    <ChevronRight className="w-4 h-4 pl-0.5" />
                 </button>
              </div>
              <Link href={`/courses/${currentCourse.id}`} className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group/cta">
                View Details
                <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform" />
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
