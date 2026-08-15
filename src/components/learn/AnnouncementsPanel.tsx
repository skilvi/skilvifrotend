'use client';

import React, { useEffect, useState } from 'react';
import { courseApi } from '@/lib/api/course';
import { Bell, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function AnnouncementsPanel({ courseId }: { courseId: string }) {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true);
        const res = await courseApi.getAnnouncements(courseId);
        setAnnouncements(res || []);
      } catch (err: any) {
        console.error("Failed to load announcements:", err);
        setError("Could not load announcements at this time.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnnouncements();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
        {error}
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 flex flex-col items-center justify-center text-center">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-full mb-4">
          <Bell className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">No announcements yet</h3>
        <p className="text-slate-500 mt-1 text-sm max-w-sm">
          Your instructor hasn't posted any announcements for this course yet. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {announcements.map((announcement) => (
        <div key={announcement.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">{announcement.title}</h3>
            <div className="flex items-center text-slate-400 text-sm font-medium">
              <Calendar className="w-4 h-4 mr-1.5" />
              {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
            </div>
          </div>
          <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
            {announcement.content}
          </div>
        </div>
      ))}
    </div>
  );
}
