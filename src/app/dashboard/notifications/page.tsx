'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { notificationApi, Notification } from '@/lib/api/notifications';
import { Bell, Check, Clock, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentNotificationsPage() {
  const { user, isHydrated } = useAuthStore();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isHydrated && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
      fetchNotifications();
    }
  }, [user, isHydrated]);

  const fetchNotifications = async () => {
    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to update notifications');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 pb-24">
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="w-24 h-6 bg-slate-200 dark:bg-slate-700 rounded-full mb-4 animate-pulse" />
            <div className="w-48 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          </div>
        </div>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="flex gap-2 items-center">
                    <div className="w-3/4 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="w-16 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  </div>
                  <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="w-1/4 h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationStyles = (n: any) => {
    const isAdmin = n.isBroadcast || n.type?.includes('ADMIN') || ['success', 'warning', 'alert', 'error', 'info'].includes(n.type?.toLowerCase());
    const isCourse = n.metadata?.courseId || n.type?.includes('COURSE');

    if (isAdmin) {
      const typeStr = (n.type || '').toLowerCase();
      if (typeStr.includes('success')) {
        return {
          bg: 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800',
          iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
          label: 'Admin Success',
          labelColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400',
          Icon: CheckCircle2,
          borderLeft: 'bg-emerald-500'
        };
      }
      if (typeStr.includes('warning')) {
        return {
          bg: 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800',
          iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
          label: 'Admin Warning',
          labelColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400',
          Icon: AlertCircle,
          borderLeft: 'bg-amber-500'
        };
      }
      if (typeStr.includes('alert') || typeStr.includes('error')) {
        return {
          bg: 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800',
          iconBg: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
          label: 'Admin Alert',
          labelColor: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400',
          Icon: AlertCircle,
          borderLeft: 'bg-red-500'
        };
      }
      // Default admin (info)
      return {
        bg: 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800',
        iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        label: 'Admin Update',
        labelColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400',
        Icon: Info,
        borderLeft: 'bg-blue-500'
      };
    }

    if (isCourse) {
      return {
        bg: 'bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800',
        iconBg: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        label: n.metadata?.courseName || 'Course Update',
        labelColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400',
        Icon: Bell,
        borderLeft: 'bg-purple-500'
      };
    }

    // Generic fallback
    return {
      bg: 'bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700',
      iconBg: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
      label: 'Notification',
      labelColor: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      Icon: Bell,
      borderLeft: 'bg-slate-400'
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 pb-24">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-semibold text-blue-700 mb-3">
                <Bell className="w-3.5 h-3.5" />
                Notifications
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                Your Updates
              </h1>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark all as read
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {notifications.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">You're all caught up!</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
              You have no new notifications. We'll let you know when there's an update.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => {
              const styles = getNotificationStyles(n);
              const Icon = styles.Icon;

              return (
              <div 
                key={n.id}
                className={`p-6 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 ${
                  n.isRead 
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-75' 
                    : `${styles.bg} shadow-sm relative`
                }`}
              >
                {!n.isRead && (
                  <div className={`absolute top-6 left-0 w-1 h-12 rounded-r-md hidden sm:block ${styles.borderLeft}`} />
                )}
                
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  n.isRead ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : styles.iconBg
                }`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className={`text-base font-semibold truncate ${n.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                      {n.title}
                    </h3>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded shrink-0 ${n.isRead ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' : styles.labelColor}`}>
                      {styles.label}
                    </span>
                    {!n.isRead && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded shrink-0">New</span>
                    )}
                  </div>
                  <p className={`text-sm mb-2 line-clamp-2 ${n.isRead ? 'text-slate-500 dark:text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>
                    {n.message}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {!n.isRead && (
                  <button 
                    onClick={() => handleRead(n.id)}
                    className="sm:w-10 sm:h-10 px-4 sm:px-0 py-2 sm:py-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Check className="w-5 h-5" />
                    <span className="sm:hidden text-sm font-medium">Mark Read</span>
                  </button>
                )}
              </div>
            )})}
          </div>
        )}
      </main>
    </div>
  );
}
