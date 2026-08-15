import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LearnPageLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-900 overflow-hidden flex-col gap-4 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/3 translate-y-1/3" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }} />
      </div>
      <Loader2 className="h-12 w-12 animate-spin text-emerald-500 z-10" />
      <p className="text-slate-200 text-lg font-medium z-10">Preparing your learning environment...</p>
    </div>
  );
}
