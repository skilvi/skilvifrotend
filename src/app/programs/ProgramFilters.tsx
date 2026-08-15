'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

const CATEGORIES = ['All', 'Technology', 'Business', 'Finance', 'Personal Development', 'Design', 'Marketing'];

const CATEGORY_LABELS: Record<string, string> = {
  'All': 'All',
  'Technology': 'IT',
  'Business': 'MBA',
  'Finance': 'Finance',
  'Personal Development': 'Soft Skills',
  'Design': 'Design',
  'Marketing': 'Marketing',
};

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Most Popular', value: 'popularity' },
];

interface ProgramFiltersProps {
  initialQuery: string;
  initialCategory: string;
  initialSortBy: string;
}

export function ProgramFilters({ initialQuery, initialCategory, initialSortBy }: ProgramFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(initialQuery);

  useEffect(() => {
    setSearchInput(initialQuery);
  }, [initialQuery]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.push(`/programs?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('q', searchInput);
  };

  return (
    <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800/60 shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search programs, skills..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all shadow-sm"
          />
        </form>

        {/* Category pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map((cat) => {
            const isActive = (cat === 'All' && !initialCategory) || cat === initialCategory;
            const label = CATEGORY_LABELS[cat] || cat;
            return (
              <button
                key={cat}
                onClick={() => updateParam('category', cat === 'All' ? '' : cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-[0_4px_14px_rgba(37,99,235,0.3)]'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-blue-200 hover:text-blue-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Sort */}
        <select
          value={initialSortBy}
          onChange={(e) => updateParam('sortBy', e.target.value)}
          className="py-2.5 pl-3 pr-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300 font-medium outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 cursor-pointer shadow-sm appearance-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
