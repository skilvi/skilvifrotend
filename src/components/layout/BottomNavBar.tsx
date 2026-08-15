'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { BookOpen, Award, Bell, LifeBuoy } from 'lucide-react';

export function BottomNavBar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isHydrated } = useAuthStore();

  // Only show for authenticated students
  if (!isHydrated || !isAuthenticated || !user) return null;
  if (user.role && user.role !== 'student') return null;

  // Don't show in embed or programs routes
  if (pathname?.startsWith('/embed') || pathname?.startsWith('/programs')) return null;
  
  // Don't show if in the actual video player (learn/courseId) - we want full screen real estate there
  if (pathname?.startsWith('/learn/')) return null;

  const links = [
    { label: 'Learning', href: '/dashboard', icon: BookOpen },
    { label: 'Certificates', href: '/dashboard/certificates', icon: Award },
    { label: 'Alerts', href: '/dashboard/notifications', icon: Bell },
    { label: 'Support', href: '/dashboard/support', icon: LifeBuoy },
  ];

  return (
    <>
      {/* Spacer to prevent content from hiding behind the tab bar on mobile */}
      <div className="md:hidden h-16 pb-[env(safe-area-inset-bottom)] w-full flex-shrink-0" />
      
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16 px-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-500' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors'
                }`}
              >
                <div className={`p-1 rounded-full ${isActive ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'fill-blue-600/10' : ''}`} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
