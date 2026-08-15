import React from 'react';
import { Metadata } from 'next';
import { CourseMinimal } from '@/lib/api/discovery';
import { EmbedProgramCard } from './EmbedProgramCard';

export const metadata: Metadata = {
  title: 'Embed Courses | EmberQuest',
  robots: {
    index: false,
    follow: false,
  },
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

export default async function EmbedCoursesPage({
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

  return (
    <>
      <style>{`
        /* Hide layout wrappers for embedding */
        nav { display: none !important; }
        footer { display: none !important; }
        /* Remove the padding-top that layout.tsx adds to offset the fixed header */
        div.pt-16 { padding-top: 0 !important; }
        /* Set background to transparent or match the typical embed color */
        body { background-color: transparent !important; }
        .min-h-screen { min-height: 100% !important; background: transparent !important; }
      `}</style>

      <div className="bg-transparent p-4">
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <EmbedProgramCard key={course.id} course={course as any} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white/50 rounded-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">No programs found</h3>
            <p className="text-slate-500 font-medium text-sm">
              Try adjusting your query parameters.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
