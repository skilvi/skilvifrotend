'use client';

import React, { useEffect, useState } from 'react';
import { courseApi } from '@/lib/api/course';
import { Bell, X, Calendar } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export function AnnouncementPopupModal({ courseId }: { courseId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [latestAnnouncement, setLatestAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAnnouncements = async () => {
      try {
        const announcements: Announcement[] = await courseApi.getAnnouncements(courseId);
        if (!isMounted || !announcements || announcements.length === 0) return;

        // Sort to get the most recent announcement
        const sorted = [...announcements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const newest = sorted[0];

        const dismissedId = localStorage.getItem(`dismissed_announcement_${courseId}`);
        
        // Show if we haven't dismissed this specific announcement
        if (dismissedId !== newest.id) {
          setLatestAnnouncement(newest);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Failed to fetch announcements for popup", err);
      }
    };

    fetchAnnouncements();
    return () => { isMounted = false; };
  }, [courseId]);

  if (!isOpen || !latestAnnouncement) return null;

  const handleDismiss = () => {
    localStorage.setItem(`dismissed_announcement_${courseId}`, latestAnnouncement.id);
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-black text-lg leading-tight">Instructor Announcement</h3>
              <p className="text-yellow-100 text-xs font-medium">Important update for this course</p>
            </div>
          </div>
          <button 
            onClick={handleDismiss}
            className="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <h4 className="text-xl font-black text-slate-900 dark:text-slate-50 mb-3">
            {latestAnnouncement.title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(latestAnnouncement.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          
          <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
            {latestAnnouncement.content.split('\n').map((paragraph, idx) => (
              <p key={idx} className="mb-3">{paragraph}</p>
            ))}
          </div>

          <button 
            onClick={handleDismiss}
            className="w-full mt-8 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-50 font-bold rounded-xl transition-colors"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
