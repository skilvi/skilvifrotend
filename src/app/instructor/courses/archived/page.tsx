'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useInstructorStore } from '@/store/useInstructorStore';
import { CourseStatusBadge } from '@/components/instructor/CourseStatusBadge';
import { Trash2, ArchiveRestore, ChevronLeft, AlertCircle } from 'lucide-react';

export default function ArchivedCoursesPage() {
  const { archivedCourses, isLoading, fetchArchivedCourses, restoreCourse, permanentDeleteCourse } = useInstructorStore();

  useEffect(() => {
    fetchArchivedCourses();
  }, [fetchArchivedCourses]);

  const handleRestore = async (id: string, title: string) => {
    if (window.confirm(`Restore "${title}" to your active courses?`)) {
      try {
        await restoreCourse(id);
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  const handlePermanentDelete = async (id: string, title: string) => {
    const confirmation = window.prompt(
      `Type "DELETE" to permanently remove "${title}". This action is IRREVERSIBLE.`
    );
    
    if (confirmation === 'DELETE') {
      try {
        await permanentDeleteCourse(id);
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link 
          href="/instructor/courses" 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-50 transition-colors mb-4 group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to My Courses</span>
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Archived Courses</h1>
        <p className="text-slate-500 mt-1">Manage your retired or hidden curriculum. Restore them at any time.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex gap-3 text-amber-800">
        <AlertCircle className="shrink-0" size={20} />
        <p className="text-sm">
          Archived courses are hidden from the platform and students. They can be restored to <strong>Draft</strong> status if you wish to re-publish them.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : archivedCourses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-xl p-20 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4 text-slate-300">
            <Trash2 size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">Archive is Empty</h3>
          <p className="text-slate-500 max-w-sm">You haven't archived any courses yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Course Details</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 text-center">Price</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {archivedCourses.map((course: any) => (
                <tr key={course.id} className="hover:bg-slate-50 dark:bg-slate-800/50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-20 aspect-video rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden relative border border-slate-200 dark:border-slate-800 shrink-0">
                        {course.thumbnailUrl ? (
                          <img src={course.thumbnailUrl} alt="" className="object-cover w-full h-full grayscale opacity-60" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 text-slate-300">
                             <Trash2 size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-50 group-hover:text-blue-600 transition-colors line-clamp-1">{course.title}</h4>
                        <div className="flex items-center gap-3 mt-1.5">
                           <CourseStatusBadge status="archived" />
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Archived At: {new Date(course.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center font-black text-slate-700 dark:text-slate-300">
                    ₹{parseFloat(course.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                         onClick={() => handleRestore(course.id, course.title)}
                         className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:border-slate-700 transition-all"
                       >
                         <ArchiveRestore size={16} />
                         Restore
                       </button>
                       <button 
                         onClick={() => handlePermanentDelete(course.id, course.title)}
                         className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                         title="Permanent Delete"
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
