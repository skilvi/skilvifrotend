'use client';

import React, { useState, useEffect } from 'react';
import { analyticsApi, InstructorDashboardMetrics } from '@/lib/api/analytics';
import { instructorApi } from '@/lib/api/instructor';

export default function PerformancePage() {
  const [dashboard, setDashboard] = useState<InstructorDashboardMetrics | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [coursePerformance, setCoursePerformance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, coursesRes]: any = await Promise.all([
          analyticsApi.getInstructorDashboard(),
          instructorApi.getMyCourses(),
        ]);

        setDashboard(dashboardRes);
        const courseList = coursesRes?.data || coursesRes || [];
        setCourses(courseList);

        // Fetch per-course deep analytics for the chart
        if (courseList.length > 0) {
          const perfPromises = courseList.slice(0, 7).map(async (c: any) => {
            try {
              const perf = await analyticsApi.getCoursePerformance(c.id);
              return { ...perf, title: c.title, averageRating: c.averageRating || 0 };
            } catch {
              return {
                courseId: c.id,
                title: c.title,
                averageRating: c.averageRating || 0,
                kpis: { enrollments: 0, revenue: 0 },
                telemetry: { totalWatchTimeHours: '0', courseCompletions: 0 },
              };
            }
          });
          const perfData = await Promise.all(perfPromises);
          setCoursePerformance(perfData);
        }
      } catch (err) {
        console.error('Performance data fetch failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-10">
        <header>
          <div className="h-8 w-56 bg-slate-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-80 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mb-3" />
              <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
        <div className="h-80 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 animate-pulse" />
      </div>
    );
  }

  const metrics = dashboard?.metrics;
  const totalEnrollments = metrics?.totalEnrollments || 0;
  const avgCompletion = metrics?.averageCompletionRate || 0;

  // Compute total watch time across all courses
  const totalWatchHours = coursePerformance.reduce(
    (acc, p) => acc + parseFloat(p.telemetry?.totalWatchTimeHours || '0'),
    0
  );

  // Engagement chart: enrollments per course
  const chartData = coursePerformance.map(p => ({
    label: p.title?.substring(0, 3) || '?',
    fullTitle: p.title || 'Course',
    value: p.kpis?.enrollments || 0,
  }));
  const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value), 1) : 1;

  // Top performing courses sorted by enrollment
  const topCourses = [...coursePerformance]
    .sort((a, b) => (b.kpis?.enrollments || 0) - (a.kpis?.enrollments || 0))
    .slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">Performance Analytics</h1>
        <p className="text-slate-500 mt-2">Deep dive into your students&apos; engagement and course reach.</p>
      </header>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Students', value: totalEnrollments.toLocaleString(), color: 'blue' },
          { label: 'Avg. Completion', value: `${avgCompletion.toFixed(0)}%`, color: 'emerald' },
          { label: 'Completion Rate', value: `${avgCompletion > 0 ? avgCompletion.toFixed(1) : 0}%`, color: 'indigo' },
          { label: 'Total Watch Time', value: `${totalWatchHours.toFixed(0)}h`, color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Engagement Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Student Enrollment by Course</h2>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Enrollments
              </span>
            </div>
          </div>
          
          {chartData.length > 0 ? (
            <div className="h-64 flex items-end gap-3 justify-between">
              {chartData.map((item, idx) => {
                const height = (item.value / maxValue) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl group-hover:from-blue-500 group-hover:to-blue-300 transition-all duration-300 relative cursor-pointer"
                      style={{ height: `${Math.max(height, 3)}%` }}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.value} students
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 mt-4" title={item.fullTitle}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <p className="font-bold">No enrollment data yet</p>
                <p className="text-sm mt-1">Publish courses to see engagement analytics.</p>
              </div>
            </div>
          )}
        </div>

        {/* Top Courses */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-6">Top Performing Courses</h2>
          {topCourses.length > 0 ? (
            <div className="space-y-6 flex-1">
              {topCourses.map((c, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center font-bold text-slate-400 text-lg">#{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-50 leading-tight truncate">{c.title}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{c.kpis?.enrollments || 0} enrollments</p>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-center">
              <p className="text-sm">No course data available yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Banner */}
      {totalEnrollments > 0 && (
        <div className="bg-indigo-900 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center gap-10 shadow-2xl shadow-indigo-900/20">
          <div className="flex-1">
            <h2 className="text-3xl font-black mb-4">Performance Summary</h2>
            <p className="text-indigo-200 text-lg leading-relaxed">
              You have <span className="text-white font-bold">{totalEnrollments.toLocaleString()}</span> total students across{' '}
              <span className="text-white font-bold">{courses.length}</span> courses with an average completion rate of{' '}
              <span className="text-emerald-400 font-bold">{avgCompletion.toFixed(1)}%</span>.
            </p>
          </div>
          <div className="w-full md:w-64 aspect-square bg-white dark:bg-slate-900/5 border border-white/10 rounded-3xl flex items-center justify-center relative group">
             <div className="w-32 h-32 rounded-full border-8 border-indigo-400 border-t-emerald-400 group-hover:border-indigo-300 group-hover:border-t-emerald-300 transition-colors flex items-center justify-center">
               <span className="font-black text-4xl">{avgCompletion.toFixed(0)}%</span>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
