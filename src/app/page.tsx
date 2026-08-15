import React from 'react';
import Link from 'next/link';
import { CourseCard } from '@/components/ui/CourseCard';
import { SearchBar } from '@/components/discovery/SearchBar';
import { HeroActions } from '@/components/ui/HeroActions';
import { discoveryApi } from '@/lib/api/discovery';
import { HeroSlideshow } from '@/components/ui/HeroSlideshow';
import { GraduationCap, Infinity, Award } from 'lucide-react';

export const revalidate = 60;

export default async function HomePage() {
  let featuredCourses = [];
  let categories = [];
  const isProd = process.env.NODE_ENV === 'production';
  const prodApiUrl = 'http://courseservermain-env.eba-6svqvpng.ap-south-1.elasticbeanstalk.com/api/v1';
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || (isProd ? prodApiUrl : 'http://localhost:5050/api/v1');

  let stats = {
    expertCourses: '2',
    activeLearners: '12',
    avgRating: '4.8★',
    completionRate: '91%',
  };

  try {
    const [featuredRes, categoriesRes, configRes] = await Promise.all([
      fetch(`${backendUrl}/search/courses?sortBy=rating&limit=8`, { next: { revalidate: 60 } }),
      fetch(`${backendUrl}/courses/categories`, { next: { revalidate: 3600 } }),
      fetch(`${backendUrl}/system/config`, { next: { revalidate: 300 } }),
    ]);
    
    if (featuredRes.ok) {
      const data = await featuredRes.json();
      featuredCourses = data?.courses || data?.data?.courses || data?.data || [];
    }
    if (categoriesRes.ok) {
      const data = await categoriesRes.json();
      categories = data?.data || data || [];
    }
    if (configRes.ok) {
      const data = await configRes.json();
      if (data?.data?.stats) {
        stats = { ...stats, ...data.data.stats };
      }
    }
  } catch (error) {
    console.warn("Failed to fetch initial page data:", error);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-sans">

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-24 pb-36 md:pt-32 md:pb-48 bg-white dark:bg-slate-900">
        {/* Subtle background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-50 to-transparent rounded-full translate-x-1/3 -translate-y-1/4 opacity-70" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-slate-50 to-transparent rounded-full -translate-x-1/3 translate-y-1/4" />
          {/* Grid pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle, rgba(37,99,235,0.04) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Left: Text */}
            <div className="flex-1 text-center lg:text-left space-y-8 max-w-2xl animate-fade-up">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                Discover Premium Technical Curriculums
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-slate-50 leading-[1.08] tracking-tight">
                  Master the Future<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                    of Engineering.
                  </span>
                </h1>
                <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Direct-from-expert curriculums designed to turn developers into high-level architects and technical leaders.
                </p>
              </div>

              <HeroActions />

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-2">
                {[
                  { label: 'Expert-taught', icon: <GraduationCap className="w-4 h-4 text-blue-500" /> },
                  { label: 'Lifetime access', icon: <Infinity className="w-4 h-4 text-blue-500" /> },
                  { label: 'Certificate', icon: <Award className="w-4 h-4 text-blue-500" /> },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Slideshow */}
            <div className="flex-1 w-full max-w-xl animate-fade-up-delay-2">
              <HeroSlideshow courses={featuredCourses} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="py-10 border-y border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Expert Courses', value: stats.expertCourses },
              { label: 'Active Learners', value: stats.activeLearners },
              { label: 'Avg. Rating', value: stats.avgRating },
              { label: 'Completion Rate', value: stats.completionRate },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stat.value}</div>
                <div className="text-sm text-slate-500 font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Search Overlay ── */}
      <div className="max-w-3xl mx-auto px-4 relative z-20 -mt-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.10)] border border-slate-100 dark:border-slate-800/50 p-2 hover:shadow-[0_32px_80px_rgba(37,99,235,0.08)] transition-shadow duration-500">
          <SearchBar />
        </div>
      </div>

      {/* ── Discovery Area ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-16">

        {/* Category Pills */}
        {categories.length > 0 && (
          <div className="mb-16">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5 text-center">Browse by Specialization</p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {categories.map((category: any) => (
                <Link
                  key={category.id}
                  href={`/courses?category=${encodeURIComponent(category.name)}`}
                  className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 hover:shadow-[0_4px_16px_rgba(37,99,235,0.1)] transition-all"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Featured Courses */}
        <section id="featured">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Featured</p>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Trending Collections</h2>
              <p className="text-slate-500 font-medium mt-1 text-sm">Our most impactful, highest-rated expert curriculums.</p>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 group transition-colors"
            >
              Browse Library
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCourses.length > 0 ? (
              featuredCourses.map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-800/50 rounded-[20px] border border-slate-200 dark:border-slate-800">
                <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="font-semibold text-slate-600 dark:text-slate-400">No courses available right now.</p>
                <p className="text-sm text-slate-400 mt-1">Check back soon or try a different filter.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="mt-24">
          <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-blue-600 to-blue-500 shadow-[0_20px_60px_rgba(37,99,235,0.3)] p-12 text-center">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white dark:bg-slate-900/5 rounded-full translate-x-1/3 -translate-y-1/3" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white dark:bg-slate-900/5 rounded-full -translate-x-1/3 translate-y-1/3" />
            </div>
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Ready to level up your career?
              </h2>
              <p className="text-blue-100 text-lg max-w-xl mx-auto font-medium">
                Join thousands of developers mastering system design, cloud, and engineering leadership.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-white dark:bg-slate-900 text-blue-700 font-semibold rounded-[14px] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-base"
                >
                  Start learning free
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-700/40 text-white font-semibold rounded-[14px] hover:bg-blue-700/60 transition-all text-base border border-white/20"
                >
                  Browse courses
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
