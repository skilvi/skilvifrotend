'use client';

import React from 'react';
import { Inbox } from '@novu/nextjs';

interface NotificationInboxProps {
  subscriberId: string;
}

export function NotificationInbox({ subscriberId }: NotificationInboxProps) {
  const appId = process.env.NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER;

  if (!appId) {
    // Fail silently if no app ID is configured
    return null;
  }

  return (
    <div className="flex items-center">
      <Inbox 
        applicationIdentifier={appId} 
        subscriberId={subscriberId}
        appearance={{
          elements: {
            bellIcon: 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors',
            popoverContent: 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.12)] rounded-2xl',
            notificationItem: 'hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors',
            notificationItemUnread: 'bg-blue-50/50 dark:bg-blue-900/10',
            notificationDot: 'bg-blue-600',
            buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors',
          } as any
        }}
      />
    </div>
  );
}
