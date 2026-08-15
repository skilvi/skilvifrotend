import { courseApi } from '@/lib/api/course';
import { CourseDetailClient } from '@/components/course/CourseDetailClient';
import { ReviewList } from '@/components/course/ReviewList';
import { notFound } from 'next/navigation';
import { Suspense, cache } from 'react';
import CourseDetailLoading from './loading';
import type { Metadata } from 'next';

// Use native fetch to leverage Next.js Data Cache (ISR). Axios bypasses Next.js cache.
const getCachedCourseDetails = cache(async (id: string) => {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL!;
  const url = `${backendUrl}/courses/${id}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch course: ${res.statusText}`);
  }
  const response = await res.json();
  return response.data || response;
});

// Revalidate for ISR — keeps course landing pages fast while data stays fresh
export const revalidate = 3600;

interface PageProps {
  params: { id: string };
}

/**
 * Dynamic SEO metadata — generates unique title/description per course
 * This is critical for search engine indexing of individual course pages.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const course = await getCachedCourseDetails(params.id);

    if (!course) {
      return { title: 'Course Not Found | EmberQuest' };
    }

    const title = `${course.title} | EmberQuest`;
    const description =
      (course.subtitle ? `${course.subtitle}. ` : '') + 
      (course.description?.substring(0, 160) ||
      `Learn ${course.title} with expert-led curriculum on EmberQuest. ${course.level ? `Level: ${course.level}.` : ''} ${course.category ? `Category: ${course.category}.` : ''}`);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        images: course.thumbnailUrl ? [{ url: course.thumbnailUrl, width: 1200, height: 630 }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: course.thumbnailUrl ? [course.thumbnailUrl] : [],
      },
      other: {
        'course:price': course.price?.toString() || '0',
        'course:category': course.category || '',
        'course:rating': course.averageRating?.toString() || '',
      },
    };
  } catch {
    return {
      title: 'Course Details | EmberQuest',
      description: 'Explore expert-taught courses on EmberQuest.',
    };
  }
}

async function CourseContent({ id }: { id: string }) {
  let course: any;
  let sections: any[] = [];

  try {
    course = await getCachedCourseDetails(id);
  } catch (err) {
    console.error('Course fetch failed', err);
  }

  if (!course) notFound();
  sections = course.sections || [];

  // Generate Schema.org JSON-LD for Rich Snippets
  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.subtitle ? `${course.subtitle}. ${course.description || ''}` : (course.description || `Learn ${course.title} with expert-led curriculum.`),
    "provider": {
      "@type": "Organization",
      "name": "EmberQuest",
      "sameAs": "https://emberquest.in"
    }
  };

  // Attach AggregateRating if course has reviews
  const reviewCount = course.metadata?.reviewStats?.total || course.reviewCount || 0;
  const avgRating = course.metadata?.reviewStats?.average || course.averageRating || 0;

  if (reviewCount > 0) {
    structuredData.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": Number(avgRating).toFixed(1),
      "reviewCount": reviewCount,
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <CourseDetailClient course={course} sections={sections} />
    </>
  );
}

export default function CourseDetailPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* 
        This Suspense boundary combined with removing top-level await 
        enables Streaming SSR. Client-side navigations will now instantly 
        transition and show the loader without blocking on the API.
      */}
      <Suspense fallback={<CourseDetailLoading />}>
        <CourseContent id={params.id} />
      </Suspense>
    </div>
  );
}
