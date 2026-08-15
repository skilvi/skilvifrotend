import Link from 'next/link';

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2000ms' }}></div>

      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-10 text-center border border-slate-100 dark:border-slate-800 relative z-10">
        <div className="w-20 h-20 bg-gradient-to-tr from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-white/50 dark:shadow-none border border-blue-100 dark:border-blue-800/50">
          <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Feature Coming Soon</h1>
        
        <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-medium">
          We're actively working hard to bring this feature to life. Check back soon for exciting updates to your learning experience!
        </p>
        
        <Link 
          href="/dashboard"
          className="inline-flex items-center justify-center w-full px-6 py-3.5 text-sm font-bold text-white bg-[#0F172A] hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl transition-all shadow-lg shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
