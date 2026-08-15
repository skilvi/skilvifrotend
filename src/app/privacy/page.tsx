import React from 'react';
import { Eye, Lock, UserCheck, Database, Globe, Bell, Fingerprint, ShieldAlert } from 'lucide-react';

export default function PrivacyPage() {
  const matrixItems = [
    {
      title: "1. Data Collection",
      subtitle: "What We Track",
      icon: <Database className="text-blue-400" size={32} />,
      points: [
          "Identities: Name, Email, Profile Picture.",
          "Learning: Course progress, Quiz scores, Completion timestamps.",
          "Metadata: Session duration, Browser type, IP addresses (for security)."
      ]
    },
    {
      title: "2. Data Usage",
      subtitle: "Why We Need It",
      icon: <Eye className="text-indigo-400" size={32} />,
      points: [
          "Personalization: Resuming courses where you left off.",
          "Certification: Verifying course completion for diplomas.",
          "Platform Improvements: Analyzing aggregate usage to optimize AI features."
      ]
    },
    {
      title: "3. User Protection",
      icon: <Lock className="text-emerald-400" size={32} />,
      subtitle: "How We Secure It",
      points: [
          "Encryption: All data is encrypted at rest and in transit (TLS 1.3).",
          "Anonymization: Aggregate data is stripped of PII for research.",
          "Access Control: Multi-level permission systems for academy staff."
      ]
    },
    {
      title: "4. Your Rights",
      icon: <UserCheck className="text-purple-400" size={32} />,
      subtitle: "Control Your Identity",
      points: [
          "Right to Access: Export your complete learning history.",
          "Right to Erasure: Request permanent deletion of your account.",
          "Right to Correction: Update your credentials at any time."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      
      {/* --- Matrix Hero --- */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%),_linear-gradient(rgba(15,23,42,1)_0%,_rgba(2,6,23,1)_100%)]"></div>
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
             <Fingerprint size={14} /> Data Integrity Protocol v1.4
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 italic">
            PRIVACY <span className="text-blue-500 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">MATRIX</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-500 font-medium leading-relaxed">
            EmberQuest operates on a policy of radical transparency. We don't hide behind complex legalese — our data practices are presented in a clear, accessible matrix.
          </p>
        </div>
      </section>

      {/* --- The Matrix Grid --- */}
      <section className="py-20 bg-[rgba(2,6,23,1)]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-1 px-4 border border-white/5 bg-white dark:bg-slate-900/5 rounded-3xl overflow-hidden backdrop-blur-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]">
           {matrixItems.map((item, idx) => (
             <div key={idx} className="bg-slate-950 p-12 hover:bg-slate-900/50 transition-all duration-500 flex flex-col gap-8 group">
                <div className="flex justify-between items-start">
                   <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/5 border border-white/10 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all">
                      {item.icon}
                   </div>
                   <div className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                     Section 0{idx + 1}
                   </div>
                </div>
                <div>
                   <div className="text-blue-500 text-xs font-black uppercase tracking-widest mb-2">{item.subtitle}</div>
                   <h2 className="text-2xl font-black uppercase tracking-tight mb-6">{item.title}</h2>
                   <ul className="space-y-4">
                      {item.points.map((point, pIdx) => (
                        <li key={pIdx} className="flex gap-3 text-slate-400 font-medium text-sm leading-relaxed">
                           <span className="text-blue-800 font-black">•</span>
                           {point}
                        </li>
                      ))}
                   </ul>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* --- Cookies & Communication --- */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-12">
           <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/[0.02] border border-white/5 hover:border-blue-500/20 transition-all">
              <Globe className="text-blue-400 mb-6" size={24} />
              <h3 className="text-lg font-black uppercase mb-4 tracking-widest">Cookie Matrix</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                We use strictly necessary cookies for authentication and performance. We do not use third-party tracking cookies for advertising purposes.
              </p>
           </div>

           <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/[0.02] border border-white/5 hover:border-blue-500/20 transition-all">
              <Bell className="text-indigo-400 mb-6" size={24} />
              <h3 className="text-lg font-black uppercase mb-4 tracking-widest">Communications</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Academic notifications and security alerts are essential. Marketing communications are strictly opt-in and can be disabled via your profile.
              </p>
           </div>

           <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/[0.02] border border-white/5 hover:border-blue-500/20 transition-all">
              <ShieldAlert className="text-emerald-400 mb-6" size={24} />
              <h3 className="text-lg font-black uppercase mb-4 tracking-widest">Security Breaches</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                In the highly unlikely event of a data incident, all affected users will be notified via email within 72 hours of discovery.
              </p>
           </div>
        </div>
      </section>

      {/* --- Status & Contact --- */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mb-4">EmberQuest TRUST CENTER</p>
        <div className="text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-8">
          Compliant with Global Privacy Standards (GDPR, CCPA)
        </div>
        <button className="px-8 py-4 border border-white/10 hover:border-blue-500/40 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all hover:bg-blue-500/5">
          Request Personal Data Audit
        </button>
      </section>

    </div>
  );
}
