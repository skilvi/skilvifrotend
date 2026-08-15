import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { EmbedProgramCard } from '@/app/embed/courses/EmbedProgramCard';
import { CourseMinimal } from '@/lib/api/discovery';
import { ProgramFilters } from './ProgramFilters';

export const metadata: Metadata = {
  title: 'Explore Programs | EmberQuest',
  description: 'Browse our premium technical courses. From software development to data science, real industry outcomes.',
  openGraph: {
    title: 'Explore Programs | EmberQuest',
    description: 'Browse our premium technical courses. From software development to data science, real industry outcomes.',
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  'All': 'All',
  'Technology': 'IT',
  'Business': 'MBA',
  'Finance': 'Finance',
  'Personal Development': 'Soft Skills',
  'Design': 'Design',
  'Marketing': 'Marketing',
};

import { getServerBackendUrl } from '@/lib/api/server-url';

async function fetchCourses(query: string, category: string): Promise<CourseMinimal[]> {
  const backendUrl = getServerBackendUrl();
  const url = new URL(`${backendUrl}/search/courses`);
  url.searchParams.set('limit', '40');
  if (query) url.searchParams.set('q', query);
  if (category) url.searchParams.set('category', category);

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.courses || data.data?.courses || data.data || [];
  } catch (e) {
    console.error('Failed to fetch courses server-side:', e);
    return [];
  }
}

export const dynamic = 'force-dynamic';

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  const category = typeof searchParams.category === 'string' ? searchParams.category : '';
  const sortBy = typeof searchParams.sortBy === 'string' ? searchParams.sortBy : 'newest';

  const rawCourses = await fetchCourses(query, category);
  const courses = [...rawCourses].sort((a: any, b: any) => {
    if (sortBy === 'rating') return (b.metadata?.reviewStats?.average || 0) - (a.metadata?.reviewStats?.average || 0);
    if (sortBy === 'popularity') return (b.metadata?.reviewStats?.total || 0) - (a.metadata?.reviewStats?.total || 0);
    return 0;
  });

  const activeCount = courses.length;

  return (
    <>
      <style>{`
        /* Remove the padding-top that layout.tsx adds to offset the fixed header */
        div.pt-16 { padding-top: 0 !important; }
      `}</style>
      <div className="min-h-screen bg-white dark:bg-slate-950">
        {/* ── HERO SECTION ── */}
        <section className="bg-white dark:bg-slate-950 pt-16 pb-10">
          <div className="max-w-5xl mx-auto px-6 text-center">
            {/* Pill label */}
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-8 shadow-sm">
              All Programs
            </div>

            {/* Hero heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-slate-50 leading-[1.1] tracking-tight mb-5">
              Find Your Perfect{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                Career Program
              </span>
            </h1>

            <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed mb-10">
              From software development to data science — every program is built around{' '}
              <strong className="text-slate-700 dark:text-slate-200 font-bold">real industry outcomes</strong>, not just certificates.
              Land the job you deserve.
            </p>

            {/* Stats row */}
            <div className="flex items-center justify-center gap-8 md:gap-14 mb-10">
              {[
                { icon: '🧭', value: `${activeCount}+`, label: 'Programs' },
                { icon: '🕐', value: '6–12 wks', label: 'Duration' },
                { icon: '📈', value: '10K+', label: 'Students Trained' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 flex items-center justify-center text-lg flex-shrink-0">
                    {stat.icon}
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400 leading-none">{stat.value}</p>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-none mt-0.5">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SEARCH + FILTERS STICKY BAR ── */}
        <ProgramFilters initialQuery={query} initialCategory={category} initialSortBy={sortBy} />

        {/* ── RESULTS ── */}
        <main className="max-w-7xl mx-auto px-6 py-10">
          {/* Count row */}
          <p className="text-sm text-slate-500 font-medium mb-6">
            Showing <span className="font-bold text-slate-800 dark:text-slate-200">{courses.length}</span>{' '}
            {courses.length === 1 ? 'program' : 'programs'}
            {category ? ` in ${CATEGORY_LABELS[category] || category}` : ''}
            {query ? ` for "${query}"` : ''}
          </p>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <EmbedProgramCard key={course.id} course={course as any} />
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-6 shadow-sm text-3xl">
                🔍
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">No programs found</h3>
              <p className="text-slate-500 font-medium max-w-sm mb-8">
                Try different keywords or browse all categories.
              </p>
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-br from-blue-600 to-blue-500 text-white font-semibold text-sm rounded-[14px] shadow-[0_8px_30px_rgba(37,99,235,0.25)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all"
              >
                View all programs
              </Link>
            </div>
          )}

          {/* ── COUNSELLING CTA BANNER ── */}
          {courses.length > 0 && (
            <div className="mt-16 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 rounded-[24px] p-10 md:p-14 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
                  backgroundSize: '28px 28px'
                }} />
                <div className="absolute top-0 right-0 w-72 h-72 bg-white dark:bg-slate-900/5 rounded-full translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-white dark:bg-slate-900/5 rounded-full -translate-x-1/4 translate-y-1/4" />
              </div>
              <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 border border-white/20 rounded-full text-xs font-semibold uppercase tracking-widest text-white mb-2">
                  🎯 Free Career Counselling
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                  Not sure which program is right for you?
                </h2>
                <p className="text-blue-100 text-lg font-medium leading-relaxed">
                  Talk to our career advisors and get a personalised roadmap — completely free.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <a
                    href="https://www.emberquest.in/contact"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-blue-700 font-bold text-sm rounded-[14px] hover:bg-blue-50 hover:shadow-lg transition-all"
                  >
                    Book Free Counselling →
                  </a>
                  <a
                    href="https://wa.me/918867648778"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 border border-white/30 text-white font-semibold text-sm rounded-[14px] hover:bg-white/20 transition-all"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
