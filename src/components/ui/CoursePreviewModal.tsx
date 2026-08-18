'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, Play, Clock, Star, ArrowRight } from 'lucide-react';
import { CourseMinimal } from '@/lib/api/discovery';

interface CoursePreviewModalProps {
  course: CourseMinimal;
  isOpen: boolean;
  onClose: () => void;
}

export function CoursePreviewModal({ course, isOpen, onClose }: CoursePreviewModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
       <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>
       <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <button 
             onClick={onClose}
             className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 backdrop-blur-md p-2 rounded-full text-white transition-colors"
          >
             <X className="w-5 h-5" />
          </button>

          {/* Media Header */}
          <div className="relative aspect-video w-full bg-slate-900 shrink-0">
             {(course as any).promoVideoUrl ? (
                <video 
                  src={(course as any).promoVideoUrl} 
                  controls 
                  autoPlay 
                  className="w-full h-full object-cover"
                />
             ) : (
                <div className="w-full h-full relative group flex items-center justify-center">
                   <img src={course.thumbnailUrl || '/placeholder-course.jpg'} alt={course.title} className="w-full h-full object-cover opacity-80" />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                   <div className="absolute w-16 h-16 bg-blue-600/90 rounded-full flex items-center justify-center text-white backdrop-blur-sm shadow-xl group-hover:scale-110 transition-transform cursor-pointer">
                      <Play className="w-6 h-6 ml-1" />
                   </div>
                </div>
             )}
          </div>

          {/* Content Body */}
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 overflow-y-auto custom-scrollbar">
             <div className="flex-1 space-y-6">
                <div>
                   <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-50 leading-tight mb-2">{course.title}</h2>
                   <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{(course as any).description || 'Dive deep into this comprehensive course and master the skills you need.'}</p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                   <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      {course.metadata?.averageRating || 4.8} / 5.0
                   </div>
                   <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                      <Clock className="w-4 h-4 text-blue-500" />
                      {course.metadata?.durationHours || '40'} Hours
                   </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50">
                   <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-3">Key Highlights</h3>
                   <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span> Hands-on project building</li>
                      <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span> Industry recognized certificate</li>
                      <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span> Interactive coding sandboxes</li>
                   </ul>
                </div>
             </div>
             
             <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                   <div className="text-3xl font-black text-slate-900 dark:text-slate-50 mb-1">
                      {(course as any).pricing?.isFree ? 'Free' : `₹${(course as any).pricing?.price}`}
                   </div>
                   {!(course as any).pricing?.isFree && (course as any).pricing?.originalPrice && (
                      <div className="text-sm text-slate-400 line-through mb-4">₹{(course as any).pricing.originalPrice}</div>
                   )}
                   <Link href={`/courses/${course.id}`} onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30">
                      Enroll Now
                      <ArrowRight className="w-4 h-4" />
                   </Link>
                </div>
                <Link href={`/courses/${course.id}`} onClick={onClose} className="w-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-bold py-3 px-4 rounded-xl flex items-center justify-center transition-all">
                   View Full Syllabus
                </Link>
             </div>
          </div>
       </div>
    </div>
  );
}
