'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { discoveryApi } from '@/lib/api/discovery';
import { ArrowRight } from 'lucide-react';
import { RecommendationCard } from '@/components/learn/RecommendationCard';

export function CourseRecommendations() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await discoveryApi.getFeaturedCourses();
        // The API returns { courses: [...], total: ... }
        const courseList = res.courses || res.data?.courses || (Array.isArray(res) ? res : []);
        setCourses(courseList.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch recommendations', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecs();
  }, []);

  if (isLoading) return null;
  if (courses.length === 0) return null;

  return (
    <div className="mt-12 w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-3 tracking-tight">
             Ready for your next challenge?
          </h3>
          <p className="text-slate-500 mt-1 font-medium">Students who completed this course also enjoyed these:</p>
        </div>
        <Link href="/courses" className="text-blue-600 font-bold flex items-center gap-2 hover:text-blue-700 transition group">
           Explore all {courses.length > 3 ? courses.length : ''}
           <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <RecommendationCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
