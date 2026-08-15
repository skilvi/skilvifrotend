'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api/client';
import Image from 'next/image';
import { getAvatarUrl } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
  const { user, setAuth, isLoading: authLoading } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    headline: '',
    website: '',
    twitter: '',
    linkedin: '',
    youtube: '',
  });

  // Fetch real user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res: any = await apiClient.get('/users/me');
        const profile = res.data || res;
        if (profile) {
          setFormData({
            displayName: profile.displayName || user?.displayName || '',
            bio: profile.bio || '',
            headline: profile.headline || '',
            website: profile.website || '',
            twitter: profile.twitter || '',
            linkedin: profile.linkedin || '',
            youtube: profile.youtube || '',
          });
        }
      } catch (err) {
        // Fallback to auth store data
        if (user) {
          setFormData(prev => ({
            ...prev,
            displayName: user.displayName || '',
            bio: (user as any).bio || '',
          }));
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user && !authLoading) fetchProfile();
  }, [user, authLoading]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res: any = await apiClient.patch('/users/me', {
        displayName: formData.displayName,
        bio: formData.bio,
      });
      const updatedUser = res.data || res;
      // Update auth store with new display name
      if (user) {
        setAuth({ ...user, displayName: formData.displayName });
      }
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        <header>
          <div className="h-10 w-64 bg-slate-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-96 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </header>
        <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-40 h-40 bg-slate-200 rounded-[2.5rem] animate-pulse" />
            <div className="flex-1 space-y-6 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
              </div>
              <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const avatarUrl = getAvatarUrl(user?.displayName, user?.avatarUrl);

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header>
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Instructor Profile</h1>
        <p className="text-slate-500 mt-2 text-lg">Manage how you appear to students and your professional details.</p>
      </header>

      <form onSubmit={handleSave} className="space-y-12">
        {/* Profile Section */}
        <section className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-slate-50 dark:bg-slate-800/50 rounded-full -translate-y-1/2 translate-x-1/2 -z-0 opacity-50"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
             <div className="relative group">
                <div className="w-40 h-40 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-[2.5rem] flex items-center justify-center text-4xl font-black text-indigo-400 border-4 border-white shadow-xl overflow-hidden relative">
                   <Image 
                     src={avatarUrl}
                     alt={formData.displayName || 'Instructor'}
                     fill
                     className="object-cover"
                   />
                   <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                   </div>
                </div>
                <p className="text-center mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition">Update Photo</p>
             </div>

             <div className="flex-1 space-y-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-50 font-bold focus:bg-white dark:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition shadow-sm"
                        required
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Professional Headline</label>
                      <input
                        type="text"
                        value={formData.headline}
                        onChange={e => setFormData({ ...formData, headline: e.target.value })}
                        placeholder="e.g. Senior Full-stack Engineer & Architect"
                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-50 font-bold focus:bg-white dark:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition shadow-sm"
                      />
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Instructor Biography</label>
                   <textarea
                     rows={4}
                     value={formData.bio}
                     onChange={e => setFormData({ ...formData, bio: e.target.value })}
                     placeholder="Tell students about your expertise and teaching philosophy..."
                     className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-50 font-bold focus:bg-white dark:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition shadow-sm resize-none"
                   />
                </div>
             </div>
          </div>
        </section>

        {/* Links Section */}
        <section className="space-y-6">
           <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight ml-2">Links & Social Presence</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Website', key: 'website' as const, placeholder: 'https://yoursite.com', color: 'slate' },
                { label: 'Twitter (X)', key: 'twitter' as const, placeholder: 'https://twitter.com/you', color: 'indigo' },
                { label: 'LinkedIn', key: 'linkedin' as const, placeholder: 'https://linkedin.com/in/you', color: 'blue' },
                { label: 'YouTube', key: 'youtube' as const, placeholder: 'https://youtube.com/@you', color: 'rose' },
              ].map((link, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
                   <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">{link.label}</label>
                   <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition shadow-inner">
                      <div className="px-4 border-r border-slate-200 dark:border-slate-800">
                         <svg className="w-5 h-5 text-slate-400 opacity-60" fill="currentColor" viewBox="0 0 20 20"><path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" /></svg>
                      </div>
                      <input
                        type="text"
                        value={formData[link.key]}
                        onChange={e => setFormData({ ...formData, [link.key]: e.target.value })}
                        placeholder={link.placeholder}
                        className="flex-1 px-4 py-3 bg-transparent font-bold text-slate-900 dark:text-slate-50 outline-none"
                      />
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* Action Bar */}
        <footer className="pt-10 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
           <p className="text-sm text-slate-400 font-bold max-w-sm">Changes will be reflected across your course landing pages instantly after saving.</p>
           <div className="flex gap-4 w-full md:w-auto">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 md:flex-none px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black rounded-2xl hover:bg-slate-200 transition"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 md:flex-none px-12 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 shadow-xl shadow-blue-600/30 transition hover:-translate-y-1 disabled:translate-y-0 disabled:opacity-50"
              >
                 {isSaving ? 'Synchronizing...' : 'Save Profile'}
              </button>
           </div>
        </footer>
      </form>
    </div>
  );
}
