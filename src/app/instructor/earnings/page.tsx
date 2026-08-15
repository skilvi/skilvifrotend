'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { instructorApi } from '@/lib/api/instructor';
import { Users, BookOpen, Lock, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InstructorEarningsPage() {
  const { user } = useAuthStore();
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const res: any = await instructorApi.getEarnings();
      setEarnings(res?.data || res || { totalEnrollments: 0, courseBreakdown: [] });
    } catch (err) {
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Course Performance</h1>
        <p className="text-slate-500 font-medium mt-1.5 text-sm">
          Track your enrollments and student engagement across all your courses.
        </p>
      </div>

      {/* Non-financial stats only */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-500 text-sm">Total Enrollments</h3>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{(earnings?.totalEnrollments || 0).toLocaleString()}</div>
          <p className="text-slate-400 text-xs mt-2">Across all your published courses</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-500 text-sm">Active Courses</h3>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            {(earnings?.courseBreakdown?.length || 0).toLocaleString()}
          </div>
          <p className="text-slate-400 text-xs mt-2">Published and generating enrollments</p>
        </div>
      </div>

      {/* Revenue locked notice */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-700/60 flex items-center justify-center shrink-0">
          <Lock className="w-8 h-8 text-slate-400" />
        </div>
        <div className="text-center md:text-left">
          <h3 className="text-xl font-bold text-white mb-1">Revenue data is processed by our finance team</h3>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
            Your earnings are calculated, verified, and disbursed directly by our admin team every month. 
            You'll receive your payout on the 1st of each month. For any queries about your revenue, 
            please contact us via the support portal.
          </p>
        </div>
        <div className="md:ml-auto shrink-0">
          <a
            href="/instructor/support"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Contact Finance Team
          </a>
        </div>
      </div>

      {/* Course breakdown — enrollment counts only, no revenue */}
      {earnings?.courseBreakdown?.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-900 dark:text-slate-50">Enrollments by Course</h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <TrendingUp className="w-4 h-4" />
              Revenue details visible to admin
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold border-b border-slate-200 dark:border-slate-800">Course</th>
                  <th className="px-6 py-4 font-bold border-b border-slate-200 dark:border-slate-800 text-right">Enrollments</th>
                  <th className="px-6 py-4 font-bold border-b border-slate-200 dark:border-slate-800 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium">
                {earnings.courseBreakdown.map((course: any) => (
                  <tr key={course.courseId} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <span className="text-slate-900 dark:text-slate-100 font-bold line-clamp-1">{course.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">
                      {course.enrollments.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs px-3 py-1 rounded-full font-medium">
                        <Lock className="w-3 h-3" /> Admin only
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">No enrollments yet</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Once students enroll in your published courses, your performance breakdown will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
