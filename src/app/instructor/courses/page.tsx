'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useInstructorStore } from '@/store/useInstructorStore';
import { CourseStatusBadge } from '@/components/instructor/CourseStatusBadge';
import { Trash2, Archive, ArchiveRestore } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function MyCoursesPage() {
  const { myCourses, isLoading, fetchMyCourses, archiveCourse } = useInstructorStore();

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  const handleArchive = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to archive "${title}"? It will be moved to the Archived page.`)) {
       try {
         await archiveCourse(id);
         toast.success(`"${title}" archived.`);
       } catch (e: any) {
         toast.error(e.message);
       }
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">My Courses</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage your curriculums and track performance.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/instructor/courses/archived"
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-300 font-medium text-sm transition-colors mr-4"
          >
            <Archive size={16} />
            Archived Courses
          </Link>
          <Link 
            href="/instructor/courses/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm"
          >
            + Create Course
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : myCourses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4 text-slate-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">Jump Into Course Creation</h3>
          <p className="text-slate-500 mb-6 max-w-sm">Share your knowledge with millions of students worldwide.</p>
          <Link 
            href="/instructor/courses/new"
            className="bg-slate-900 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-800 transition"
          >
            Create Your First Course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {myCourses.map((course: any) => (
            <div key={course.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative border-b border-slate-100 dark:border-slate-800/50">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <CourseStatusBadge status={course.status} />
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-900 dark:text-slate-50 leading-tight mb-2 line-clamp-2">{course.title}</h3>
                <div className="text-slate-500 text-sm mt-auto">
                  <p className="flex justify-between py-1 border-t border-slate-100 dark:border-slate-800/50 mt-4">
                    <span>Price</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">₹{parseFloat(course.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </p>
                  <p className="flex justify-between py-1 border-t border-slate-100 dark:border-slate-800/50">
                    <span>Lectures</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{course.totalLectures}</span>
                  </p>
                </div>
                <div className="mt-5 pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 gap-2">
                  <Link href={`/instructor/courses/${course.id}/edit`} className="flex-1 text-center py-2 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-medium rounded-lg text-sm hover:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                    Edit Info
                  </Link>
                  <Link href={`/instructor/courses/${course.id}/curriculum`} className="flex-1 text-center py-2 bg-blue-50 text-blue-700 font-medium rounded-lg text-sm hover:bg-blue-100 border border-blue-200">
                    Build
                  </Link>
                  <button 
                    onClick={() => handleArchive(course.id, course.title)}
                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-100"
                    title="Archive Course"
                  >
                    <Archive size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
