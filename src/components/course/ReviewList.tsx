'use client';

import React, { useState, useEffect } from 'react';
import { courseApi, Review } from '@/lib/api/course';

export function ReviewList({ courseId, globalRating, totalReviews }: { courseId: string, globalRating: string, totalReviews: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Lazy loading strategy: Only execute fetching when component literally mounts
  // Alternative: IntersectionObserver to load exclusively when scrolling exactly to this DIV block physically.
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await courseApi.getReviews(courseId);
        setReviews(data);
      } catch (e) {
        console.error("Failed to lazy load feedback securely");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, [courseId]);

  if (isLoading) {
    return <div className="p-8 border rounded-xl animate-pulse bg-gray-50 h-32" />;
  }

  return (
    <div className="space-y-6">
      
      {/* High Level Rating Summary Header */}
      <div className="flex items-center gap-6 mb-8 border-b pb-6">
        <div className="text-center shrink-0">
           <div className="text-6xl font-extrabold text-amber-500">{globalRating}</div>
           <div className="text-sm text-gray-500 font-medium mt-1">Course Rating</div>
        </div>
        <div className="flex-1 space-y-2 hidden md:block">
           {/* Conceptually injecting a bar chart visually matching average breakdowns */}
           <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden"><div className="w-[85%] h-full bg-amber-400"></div></div>
           <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden"><div className="w-[10%] h-full bg-amber-400"></div></div>
        </div>
      </div>

      {/* Individual Mappings */}
      {reviews.length === 0 ? (
        <p className="text-gray-500 italic">No reviews published yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map(review => (
            <div key={review.id} className="border-t pt-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  {review.user?.displayName?.charAt(0) || 'S'}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{review.user?.displayName || 'Student'}</h4>
                  <div className="flex gap-1 text-amber-400 text-sm">
                    {/* Maps 5 exact star icons natively based heavily on integer math */}
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
