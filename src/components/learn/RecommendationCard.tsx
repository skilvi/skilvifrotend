import React from 'react';
import Link from 'next/link';
import { CourseMinimal } from '@/lib/api/discovery';
import { Star } from 'lucide-react';

interface RecommendationCardProps {
  course: CourseMinimal;
}

export function RecommendationCard({ course }: RecommendationCardProps) {
  const m = course.metadata || {};
  const rating = parseFloat(m.reviewStats?.average || '0').toFixed(1);

  return (
    <Link 
      href={`/courses/${course.id}`} 
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {/* Native img with lazy loading prevents next/image hostname errors and gives performance boost */}
        <img 
          src={course.thumbnailUrl || '/course-ph.jpg'} 
          alt={course.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <Star className="w-3 h-3 text-amber-500 fill-current" />
          <span className="text-[10px] font-black text-slate-900 dark:text-slate-50">{rating > '0.0' ? rating : 'NEW'}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-widest border border-emerald-100">
            {m.category || 'Tech'}
          </span>
        </div>
        <h3 className="font-bold text-slate-900 dark:text-slate-50 text-sm leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-auto">
          {m.instructorName || 'EmberQuest Instructor'}
        </p>
        <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-100 dark:border-slate-800/50">
          <span className="text-sm font-black text-slate-900 dark:text-slate-50">
            {course.price > 0 ? `₹${course.price.toLocaleString()}` : 'FREE'}
          </span>
          <span className="text-[10px] font-bold text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
