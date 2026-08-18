'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api/client';
import Link from 'next/link';
import Image from 'next/image';
import { getAvatarUrl } from '@/lib/utils';

export default function ProfilePage() {
  const { user, setAuth, isHydrated, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [formData, setFormData] = useState({ displayName: '', bio: '', certificateName: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [enrollmentCount, setEnrollmentCount] = useState(0);

  useEffect(() => {
    if (isHydrated && !user) router.replace('/login');
  }, [user, isHydrated, router]);

  useEffect(() => {
    if (user) {
      setFormData({ 
        displayName: user.displayName || '', 
        bio: (user as any).bio || '',
        certificateName: (user as any).certificateName || '' 
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res: any = await apiClient.get('/enrollments/me');
        const enrollments = res.data?.enrollments || res.enrollments || [];
        setEnrollmentCount(enrollments.length);
      } catch {}
    };
    if (user && !authLoading) fetchEnrollments();
  }, [user, authLoading]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMsg('');
    try {
      const res: any = await apiClient.patch('/users/me', formData);
      const updatedUser = res.data || res;
      // Update auth store with new display name and certificate name
      setAuth({ ...user!, displayName: formData.displayName, certificateName: formData.certificateName });
      setSaveMsg('Profile updated successfully!');
    } catch (err: any) {
      setSaveMsg('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isHydrated || authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50">
      {/* Hero */}
      <div className="bg-slate-900 pt-20 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600 rounded-full blur-[150px]" />
        </div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full overflow-hidden relative shadow-2xl ring-4 ring-white/10 shrink-0 border-2 border-white/20">
              <Image 
                src={getAvatarUrl(user.displayName, user.avatarUrl)} 
                alt={user.displayName || "User"} 
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">{user.displayName}</h1>
              <p className="text-slate-400 font-medium mt-1">{user.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs font-bold text-blue-400 uppercase tracking-wider">
                  {user.role}
                </span>
                <span className="text-slate-500 text-sm font-medium">{enrollmentCount} courses enrolled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Stats Sidebar */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800/50 p-6">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Enrolled Courses</span>
                  <span className="text-lg font-black text-slate-900 dark:text-slate-50">{enrollmentCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Account Type</span>
                  <span className="text-sm font-black text-blue-600">{(user.role || '').charAt(0).toUpperCase() + (user.role || '').slice(1)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800/50 p-6">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 py-2 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  My Dashboard
                </Link>
                <Link href="/courses" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 py-2 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  Browse Courses
                </Link>
                {user.role === 'instructor' && (
                  <Link href="/instructor" className="flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800 py-2 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    Instructor Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800/50 p-8">
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-50 mb-6">Profile Settings</h2>
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full border-2 border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 text-slate-900 dark:text-slate-50 font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full border-2 border-slate-100 dark:border-slate-800/50 bg-slate-100 dark:bg-slate-800 rounded-xl p-3.5 text-slate-400 font-semibold cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-400 mt-1.5">Email cannot be changed.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Certificate Name</label>
                  <input
                    type="text"
                    value={formData.certificateName}
                    onChange={e => setFormData({ ...formData, certificateName: e.target.value })}
                    className="w-full border-2 border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 text-slate-900 dark:text-slate-50 font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    placeholder="Name as you want it to appear on certificates"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">If left blank, your display name will be used on certificates.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Bio <span className="text-slate-400 font-normal">(optional)</span></label>
                  <textarea
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full border-2 border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 text-slate-900 dark:text-slate-50 font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                    placeholder="Tell us a bit about yourself..."
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {saveMsg && (
                    <p className={`text-sm font-semibold ${saveMsg.includes('success') ? 'text-emerald-600' : 'text-red-500'}`}>
                      {saveMsg}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="ml-auto px-8 py-3.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 active:scale-95"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Security Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800/50 p-8 mt-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-50 mb-6">Security</h2>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">Password</h3>
                  <p className="text-xs text-slate-500 mt-1">Change your account password securely.</p>
                </div>
                <Link 
                  href="/forgot-password" 
                  className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap text-center"
                >
                  Change Password
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
