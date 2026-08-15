'use client';

import React, { useState, useEffect } from 'react';
import discoveryApi, { CourseMinimal } from '@/lib/api/discovery';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CourseMinimal[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debouncing execution hook physically delaying network loops
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 2) {
        setIsSearching(true);
        try {
          const res: any = await discoveryApi.searchCourses({ query });
          const courselist = res?.courses || res?.data?.courses || [];
          setResults(courselist.slice(0, 5)); // show top 5 previews quickly
          setShowDropdown(true);
        } catch (e) {
          console.error("Discovery error", e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 400); // 400ms buffer prevents typing lag sending 20 reqs/sec

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <svg className="absolute left-5 w-5 h-5 text-slate-400 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 2 && setShowDropdown(true)}
          placeholder="What do you want to learn today?"
          className="w-full pl-14 pr-32 py-5 rounded-2xl bg-white dark:bg-slate-900/5 border-0 focus:ring-0 text-slate-900 dark:text-slate-50 text-lg outline-none placeholder:text-slate-400 font-medium"
        />
        <div className="absolute right-2 flex items-center gap-2">
           {isSearching && (
             <div className="rounded-full h-5 w-5 border-b-2 border-blue-600 animate-spin mr-2" />
           )}
           <button 
             onClick={() => query.trim() && (window.location.href = `/courses?q=${encodeURIComponent(query)}`)}
             className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
           >
             Search
           </button>
        </div>
      </div>

      {/* Floating Interactive Results Dropdown (Client Interactive layer) */}
      {showDropdown && results.length > 0 && (
        <div className="absolute top-16 left-0 right-0 bg-white dark:bg-slate-900 shadow-xl rounded-xl border overflow-hidden flex flex-col text-left">
          {results.map((course) => (
             <a key={course.id} href={`/courses/${course.id}`} className="px-5 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-0 transition">
               <div className="h-10 w-10 min-w-10 bg-gray-200 rounded overflow-hidden relative">
                 {/* Pseudo image fallback for quick rendering */}
                 <img src={course.thumbnailUrl || '/mock-thumb.jpg'} alt="" className="object-cover w-full h-full" />
               </div>
               <div className="flex-1 truncate">
                 <h4 className="text-sm font-semibold text-gray-900 truncate">{course.title}</h4>
                 <p className="text-xs text-gray-500 capitalize">{course.metadata?.category || 'General'}</p>
               </div>
             </a>
          ))}
          <a href={`/courses?q=${query}`} className="bg-gray-50 text-center w-full py-3 text-sm font-medium text-blue-600 hover:text-blue-700">
             See all results for "{query}" 
          </a>
        </div>
      )}
    </div>
  );
}
