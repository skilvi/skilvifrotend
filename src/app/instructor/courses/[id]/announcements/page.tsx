'use client';

import React, { useState, useEffect } from 'react';
import { courseApi } from '@/lib/api/course';
import { toast } from 'react-hot-toast';
import { Bell, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ManageAnnouncementsPage({ params }: { params: { id: string } }) {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const loadAnnouncements = async () => {
    try {
      setIsLoading(true);
      const res = await courseApi.getAnnouncements(params.id);
      setAnnouncements(res || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await courseApi.postAnnouncement(params.id, title, content);
      toast.success('Announcement posted successfully!');
      setTitle('');
      setContent('');
      loadAnnouncements();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await courseApi.deleteAnnouncement(id);
      toast.success('Announcement deleted');
      loadAnnouncements();
    } catch (err: any) {
      toast.error('Failed to delete announcement');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-6">
        <Link href={`/instructor/courses/${params.id}/edit`} className="text-sm font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Course Edit
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 flex items-center gap-3">
          <Bell className="w-8 h-8 text-yellow-500" /> Manage Announcements
        </h1>
        <p className="text-slate-500 mt-2">Post updates, news, or welcome messages to all enrolled students.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-8">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Post a New Announcement</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Title</label>
            <input 
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="e.g. Welcome to the course!"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Content</label>
            <textarea 
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Write your message here..."
              disabled={isSubmitting}
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition disabled:opacity-50"
          >
            {isSubmitting ? 'Posting...' : 'Post Announcement'}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Previous Announcements</h3>
        {isLoading ? (
          <div className="text-slate-500">Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center rounded-xl">No announcements posted yet.</div>
        ) : (
          announcements.map(a => (
            <div key={a.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-lg">{a.title}</h4>
                <p className="text-slate-500 text-sm mt-1 whitespace-pre-wrap">{a.content}</p>
              </div>
              <button onClick={() => handleDelete(a.id)} className="text-slate-400 hover:text-red-500 p-2 shrink-0">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
