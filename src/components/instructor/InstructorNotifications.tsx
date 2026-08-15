'use client';

import React, { useState, useEffect } from 'react';
import { notificationApi, Notification } from '@/lib/api/notifications';
import { Bell, Check, Clock, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InstructorNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return null;

  return (
    <div className="relative group">
      <button className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 rounded-xl hover:bg-slate-50 dark:bg-slate-800/50 transition relative">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN (Simplified for now - can be expanded) */}
      <div className="absolute right-0 mt-3 w-[400px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-4 transform origin-top-right">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/50">
           <h3 className="font-black text-slate-800 dark:text-slate-200 tracking-tight">Platform Notifications</h3>
           {unreadCount > 0 && (
             <button onClick={markAllRead} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">Mark all Read</button>
           )}
        </div>

        <div className="max-h-[400px] overflow-y-auto mt-2">
          {notifications.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <Info className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-bold">No active alerts</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-4 rounded-2xl transition cursor-pointer hover:bg-slate-50 dark:bg-slate-800/50 flex gap-4 ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                  onClick={() => !n.isRead && handleRead(n.id)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === 'ADMIN_REVIEW' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                    {n.type === 'ADMIN_REVIEW' ? <Clock className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200 leading-tight mb-1">{n.title}</p>
                    <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wide">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 self-start" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
