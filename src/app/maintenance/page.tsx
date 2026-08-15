'use client';

import React, { Suspense } from 'react';
import { Settings, ShieldOff, Lock, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const MODE_CONFIG: Record<string, { icon: React.ElementType; title: string; color: string; iconBg: string }> = {
  MAINTENANCE: {
    icon: Settings,
    title: 'System Maintenance',
    color: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  READ_ONLY: {
    icon: Lock,
    title: 'Read-Only Mode',
    color: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  EMERGENCY_LOCKDOWN: {
    icon: ShieldOff,
    title: 'Emergency Lockdown',
    color: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
  },
};

function MaintenanceContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'We are currently upgrading our systems. We will be back shortly.';
  const mode = searchParams.get('mode') || 'MAINTENANCE';
  const cfg = MODE_CONFIG[mode] || MODE_CONFIG.MAINTENANCE;
  const Icon = cfg.icon;

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const checkStatus = async () => {
      try {
        // Fetch through the Next.js API proxy with cache busting
        const res = await fetch(`/api/v1/system/status?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.mode === 'NORMAL') {
            window.location.href = '/';
          }
        }
      } catch (err) {
        // Ignore network errors while waiting
      }
    };

    // Poll every 5 seconds
    interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-center">
      <div className="bg-white dark:bg-slate-900 shadow-2xl shadow-blue-900/5 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-10 max-w-lg w-full flex flex-col items-center">
        <div className={`w-24 h-24 ${cfg.iconBg} rounded-full flex items-center justify-center mb-6`}>
          <Icon className={`w-12 h-12 ${cfg.color} ${mode === 'MAINTENANCE' ? 'animate-spin' : ''}`}
            style={mode === 'MAINTENANCE' ? { animationDuration: '4s' } : {}} />
        </div>

        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 mb-4 tracking-tight">{cfg.title}</h1>

        <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-8">
          {message}
        </p>

        {mode !== 'EMERGENCY_LOCKDOWN' && (
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Check Again
          </button>
        )}

        {mode === 'EMERGENCY_LOCKDOWN' && (
          <p className="text-sm text-red-500 font-semibold mt-2">Platform access is restricted by system administrators.</p>
        )}
      </div>
    </div>
  );
}

export default function MaintenancePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Settings className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    }>
      <MaintenanceContent />
    </Suspense>
  );
}
