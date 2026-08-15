'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { discoveryApi, CourseMinimal } from '@/lib/api/discovery';
import { CourseCard } from '@/components/ui/CourseCard';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<CourseMinimal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse filters from URL
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const level = searchParams.get('level') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';

  // State for filter UI
  const [filters, setFilters] = useState({
    level,
    maxPrice,
    sortBy,
  });

  useEffect(() => {
    // sync state when URL changes
    setFilters({ level, maxPrice, sortBy });
  }, [level, maxPrice, sortBy]);

  useEffect(() => {
    const performSearch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response: any = await discoveryApi.searchCourses({
          query,
          category,
          level: level || undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          sortBy,
        });
        const courses = response?.data?.courses || response?.courses || response?.data || response || [];
        setResults(courses);
      } catch (err: any) {
        console.error("Search failed:", err);
        setError("Failed to retrieve search results. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query, category, level, maxPrice, sortBy]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (filters.level) params.set('level', filters.level);
    else params.delete('level');
    
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    else params.delete('maxPrice');
    
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    else params.delete('sortBy');

    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({ level: '', maxPrice: '', sortBy: 'newest' });
    const params = new URLSearchParams(searchParams.toString());
    params.delete('level');
    params.delete('maxPrice');
    params.delete('sortBy');
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Search Metadata */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            {query ? `Results for "${query}"` : category ? `Category: ${category}` : 'All Courses'}
          </h1>
          <p className="text-slate-500 mt-2">
            Showing {results.length} results matching your search criteria.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg border-b dark:border-slate-800 pb-3">Filters</h3>
            
            {/* Sort By */}
            <div>
              <label className="block text-sm font-semibold mb-2">Sort By</label>
              <select 
                value={filters.sortBy} 
                onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
              >
                <option value="newest">Newest</option>
                <option value="popularity">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-semibold mb-2">Level</label>
              <select 
                value={filters.level} 
                onChange={(e) => setFilters(f => ({ ...f, level: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold mb-2">Max Price (₹)</label>
              <input 
                type="number" 
                placeholder="e.g. 500"
                value={filters.maxPrice} 
                onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button onClick={applyFilters} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition">
                Apply
              </button>
              <button onClick={clearFilters} className="px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 rounded-lg font-semibold transition">
                Clear
              </button>
            </div>
          </div>

          {/* Results Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 rounded-xl h-72 animate-pulse border border-slate-200 dark:border-slate-800">
                    <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-t-xl mb-4" />
                    <div className="px-4 space-y-3">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center">
                <p className="font-semibold">{error}</p>
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed p-20 text-center flex flex-col items-center">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-full mb-6">
                   <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                   </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">No courses found</h3>
                <p className="text-slate-500 mt-2 max-w-sm">
                  We couldn't find any courses matching your search. Try adjusting your filters.
                </p>
                <button 
                  onClick={clearFilters}
                  className="mt-8 bg-slate-900 dark:bg-slate-800 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 transition"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
