import React from 'react';
import { Scale, FileText, Gavel, ShieldCheck, AlertCircle, Award } from 'lucide-react';

export default function TermsPage() {
  const sections = [
    {
      title: "1. Enrollment & Access",
      icon: <FileText size={20} />,
      content: "Upon enrollment in an EmberQuest course, you are granted a non-exclusive, non-transferable license to access the course materials for your personal educational use. Course access duration is specified at the time of purchase (typically lifetime access unless otherwise stated)."
    },
    {
      title: "2. Intellectual Property",
      icon: <Scale size={20} />,
      content: "All content provided on the EmberQuest platform, including videos, source code, diagrams, and written documentation, is the exclusive property of EmberQuest and its instructors. Unauthorized distribution, reproduction, or commercial use of these materials is strictly prohibited and may result in legal action."
    },
    {
      title: "3. Payments & Refund Policy",
      icon: <Gavel size={20} />,
      content: "All transactions are processed securely via our payment partners. We offer a standard 14-day 'Satisfaction Guarantee' refund policy for most courses, provided that less than 20% of the course content has been consumed. Refund requests must be submitted via the student dashboard."
    },
    {
      title: "4. User Conduct",
      icon: <ShieldCheck size={20} />,
      content: "Students are expected to maintain professional conduct within the EmberQuest community. Harassment, spamming, or attempting to reverse-engineer the platform's infrastructure will lead to immediate account termination without refund."
    },
    {
      title: "5. Limitation of Liability",
      icon: <AlertCircle size={20} />,
      content: "EmberQuest provides educational content 'as-is'. While we strive for absolute technical precision, we are not liable for any direct or indirect damages resulting from the implementation of techniques taught in our curriculums."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      
      {/* --- Header Section --- */}
      <section className="relative pt-32 pb-16 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="inline-flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            Legal Framework v2.1 • Last Updated: April 2024
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            LEGAL <span className="text-blue-500 italic">TERMS</span>
          </h1>
          <p className="text-slate-400 font-medium leading-relaxed">
            By accessing EmberQuest, you agree to bound by these terms. We recommend reading them carefully to understand your rights and responsibilities as a student.
          </p>
        </div>
      </section>

      {/* --- Terms Content --- */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 space-y-12">
          {sections.map((section, index) => (
            <div key={index} className="group p-8 rounded-3xl bg-white dark:bg-slate-900/[0.02] border border-white/5 hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  {section.icon}
                </div>
                <h2 className="text-xl font-black uppercase tracking-wider">{section.title}</h2>
              </div>
              <p className="text-slate-400 leading-relaxed font-medium">
                {section.content}
              </p>
            </div>
          ))}

          <div className="pt-10 p-8 rounded-3xl bg-blue-600/5 border border-blue-500/10">
            <h3 className="text-lg font-black uppercase tracking-wider mb-4 text-blue-400 flex items-center gap-2">
              <Award size={18} /> Compliance & Arbitration
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed italic">
              These terms are governed by the laws of the jurisdiction in which EmberQuest is headquartered. Any disputes arising from these terms will be resolved through mandatory arbitration as specified in our full legal disclosure.
            </p>
          </div>
        </div>
      </section>

      {/* --- Footer CTA --- */}
      <section className="py-20 text-center">
        <p className="text-slate-500 text-sm font-medium mb-6 uppercase tracking-widest">Questions regarding these terms?</p>
        <a href="mailto:legal@EmberQuest-academy.com" className="text-blue-500 font-black hover:text-blue-400 transition-colors uppercase tracking-widest text-sm border-b-2 border-blue-500/20 pb-1">
          Contact Legal Operations
        </a>
      </section>

    </div>
  );
}
