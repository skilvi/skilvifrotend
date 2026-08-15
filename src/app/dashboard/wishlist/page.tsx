'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getMediaUrl } from '@/lib/utils';
import apiClient from '@/lib/api/client';
import { Heart, Trash2, ExternalLink, BookOpen, Clock, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { user, isHydrated } = useAuthStore();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isHydrated && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
      fetchWishlist();
    }
  }, [user, isHydrated]);

  const fetchWishlist = async () => {
    try {
      const res: any = await apiClient.get('/wishlist');
      setWishlist(res?.data || res || []);
    } catch (err: any) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (courseId: string) => {
    try {
      await apiClient.delete(`/wishlist/${courseId}`);
      setWishlist(prev => prev.filter(item => item.course.id !== courseId));
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error('Failed to remove from wishlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center pb-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 pb-24">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="inline-flex items-center px-3 py-1 bg-rose-50 border border-rose-100 rounded-full text-xs font-semibold text-rose-700 mb-3">
            Wishlist
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            Saved Courses
          </h1>
          <p className="text-slate-500 font-medium mt-1.5 text-sm">
            Courses you've saved for later. Keep track of what you want to learn next.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {wishlist.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="bg-rose-50 dark:bg-rose-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">Your wishlist is empty</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
              Browse our catalog and tap the heart icon on any course to save it here for later.
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors text-sm"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map(item => (
              <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={getMediaUrl(item.course.thumbnailUrl)}
                    alt={item.course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 z-10 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeFromWishlist(item.course.id);
                      }}
                      className="w-8 h-8 bg-white/90 hover:bg-rose-50 rounded-full flex items-center justify-center shadow-sm transition-colors text-slate-400 hover:text-rose-500 backdrop-blur-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.course.level?.replace('_', ' ')}</span>
                    <span className="text-xs font-medium text-slate-400">
                      Saved {new Date(item.addedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <Link href={`/courses/${item.course.id}`} className="group-hover:text-blue-600 transition-colors">
                    <h3 className="font-bold text-slate-900 dark:text-slate-50 line-clamp-2 leading-tight mb-3">
                      {item.course.title}
                    </h3>
                  </Link>

                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-lg text-slate-900 dark:text-slate-50">
                        {item.course.price > 0 ? `₹${item.course.price.toLocaleString()}` : 'FREE'}
                      </div>
                      <Link 
                        href={`/courses/${item.course.id}`}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        Details <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
