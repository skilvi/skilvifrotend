import React from 'react';
import { Shield, Target, Cpu, Zap, Globe, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      
      {/* --- Abstract Hero Section --- */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-40 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-blue-600/10 blur-[140px] rounded-full -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[100px] rounded-full translate-x-1/3 translate-y-1/3"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8 animate-fade-in">
            Established 2024 • Global Excellence
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
            THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 italic">ARCHITECTURE</span> <br/>
            OF MASTERY.
          </h1>
          <p className="max-w-3xl mx-auto text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
            EmberQuest was founded on a simple realization: the gap between academic theory and world-class technical execution is widening. We built the bridge.
          </p>
        </div>
      </section>

      {/* --- The Philosophy (Glassmorphism Cards) --- */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/5 border border-white/10 backdrop-blur-xl hover:bg-white dark:bg-slate-900/10 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Target size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-wider mb-4">Precision First</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                We don't teach "coding." We teach engineering. Every curriculum is vetted for technical accuracy and industry relevance.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/5 border border-white/10 backdrop-blur-xl hover:bg-white dark:bg-slate-900/10 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <Cpu size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-wider mb-4">Pure Metadata</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                Our platform leverages advanced AI to map your progress against global engineering benchmarks in real-time.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/5 border border-white/10 backdrop-blur-xl hover:bg-white dark:bg-slate-900/10 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-wider mb-4">Speed of Execution</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                Go from understanding a concept to implementing it in a production environment faster than any traditional boot camp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Our Story (Timeline/Content) --- */}
      <section className="py-24 bg-white dark:bg-slate-900/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-20 items-center">
          <div className="flex-1 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight italic">
              BORN IN THE <span className="text-blue-500">TRENCHES</span>.
            </h2>
            <div className="space-y-6 text-slate-400 font-medium leading-relaxed text-lg">
              <p>
                EmberQuest didn't start in a boardroom. It started in the terminal. Our founders, veterans of high-frequency trading and aerospace software, saw a recurring problem: new hires with degrees but no "battlefield" intuition.
              </p>
              <p>
                We spent two years building a curriculum platform that doesn't just deliver videos, but simulates the pressure and complexity of real-world systems.
              </p>
              <p>
                Today, EmberQuest is the standard for engineers who refuse to be "average." We are the curators of the 1% — the builders who define the next decade of technology.
              </p>
            </div>
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-3xl font-black text-white">50K+</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Students</div>
              </div>
              <div className="w-px h-12 bg-white dark:bg-slate-900/10"></div>
              <div>
                <div className="text-3xl font-black text-white">120+</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Expert Instructors</div>
              </div>
              <div className="w-px h-12 bg-white dark:bg-slate-900/10"></div>
              <div>
                <div className="text-3xl font-black text-white">99%</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Success Rate</div>
              </div>
            </div>
          </div>
          <div className="flex-1 relative">
             {/* Decorative Image Placeholder/Graphic */}
             <div className="aspect-square rounded-3xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="text-xs font-black uppercase tracking-widest text-blue-400 mb-2">EmberQuest Mission Control</div>
                  <div className="text-sm font-medium text-slate-300">Synchronizing global engineering standards across 142 countries.</div>
                </div>
                {/* Visual "Radar" effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-blue-500/20 rounded-full animate-ping"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-blue-400/30 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent rotate-45"></div>
             </div>
          </div>
        </div>
      </section>

      {/* --- Call to Action --- */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black mb-8 px-4">
            READY TO JOIN THE <br/>
            <span className="text-blue-500">NEW VANGUARD?</span>
          </h2>
          <button className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95">
            Begin Your Ascension
          </button>
        </div>
      </section>

    </div>
  );
}
