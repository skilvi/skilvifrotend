import React, { useState } from 'react';
import { useLearnStore } from '@/store/learnStore';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useParams } from 'next/navigation';

export function SyllabusSidebar() {
  const { courseData, activeLectureId, setActiveLectureId, completionPct } = useLearnStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const params = useParams();
  
  if (!courseData) return null;
  const sections = courseData.sections || [];
  const courseId = (params?.courseId as string) || (courseData as any).id || (courseData as any)._id;

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isFullyComplete = Math.round(completionPct) >= 100;
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-800 custom-scrollbar">
      {sections.map((section, idx) => {
         const isExpanded = expandedSections.has(section.id) || section.lectures.some(l => l.id === activeLectureId);
         
         return (
           <div key={section.id} className="border-b border-slate-200 dark:border-slate-800">
             {/* Section Header (Accordion Toggle) */}
             <button 
               onClick={() => toggleSection(section.id)}
               className="w-full px-6 py-4 flex items-center justify-between bg-white dark:bg-slate-900 hover:bg-white dark:bg-slate-900/[0.02] transition-colors"
             >
               <div className="text-left flex-1 pr-4">
                 <div className="text-[10px] font-black tracking-widest text-emerald-500 uppercase mb-1">
                   Module {idx + 1}
                 </div>
                 <div className="text-sm font-bold text-slate-900 dark:text-slate-50">
                   {section.title}
                 </div>
               </div>
               <div className="text-slate-500">
                 {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
               </div>
             </button>
             
             {/* Lectures (Collapsible) */}
             {isExpanded && (
               <ul className="flex flex-col py-2 px-2 gap-1 bg-slate-50 dark:bg-slate-800/50">
                 {section.lectures.map((lecture) => {
                    const isActive = lecture.id === activeLectureId;
                    const isCompleted = lecture.progress?.isCompleted;
                    const isLocked = lecture.isLocked;

                    return (
                       <li key={lecture.id}>
                          <button
                             onClick={() => {
                                if (!isLocked || lecture.isPartialLock) setActiveLectureId(lecture.id);
                                else alert("You must complete earlier modules to unlock this lecture.");
                             }}
                             className={`w-full text-left px-4 py-3 rounded-xl flex items-start gap-3 transition-colors ${
                                isActive 
                                   ? 'bg-slate-200 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)]' 
                                   : isLocked 
                                      ? 'opacity-40 cursor-not-allowed hover:bg-white dark:bg-slate-900/[0.02]' 
                                      : 'hover:bg-white dark:bg-slate-900/[0.05] text-slate-700 dark:text-slate-300'
                             }`}
                             title={isLocked ? "Complete previous lectures to unlock" : ""}
                          >
                              {/* Status Icon */}
                              <div className="mt-0.5 shrink-0">
                                 {isCompleted ? (
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-slate-900 dark:text-slate-50 font-bold text-[10px] shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                                      ✓
                                    </span>
                                 ) : isLocked ? (
                                    <span className="flex items-center justify-center w-5 h-5 opacity-70" title={lecture.isPartialLock ? "Partial payment limit reached" : "Locked"}>
                                      {lecture.isPartialLock ? '💳' : '🔒'}
                                    </span>
                                 ) : lecture.contentType === 'assignment' ? (
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-500 ring-1 ring-indigo-500/50">
                                      📝
                                    </span>
                                 ) : isActive ? (
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-slate-900 dark:text-slate-50 shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                                      <svg className="w-2.5 h-2.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    </span>
                                 ) : (
                                    <span className="flex items-center justify-center w-5 h-5 text-slate-500 border-2 border-slate-300 dark:border-slate-700 rounded-full">
                                    </span>
                                 )}
                              </div>
      
                              {/* Title & Duration */}
                              <div className="flex-1 overflow-hidden">
                                 <div className={`text-sm ${isActive ? 'text-slate-900 dark:text-slate-50 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {lecture.title}
                                 </div>
                                  <div className="text-[11px] text-slate-500 mt-1 font-medium flex items-center gap-1.5">
                                     {lecture.contentType === 'assignment' 
                                        ? 'Practice Assignment' 
                                        : 'Video'}
                                     <span>•</span>
                                     {lecture.durationSeconds > 0
                                           ? `${Math.max(1, Math.floor(lecture.durationSeconds / 60))} min`
                                           : '0 min'}
                                  </div>
                              </div>
                          </button>
                       </li>
                    );
                 })}
               </ul>
             )}
           </div>
         );
      })}

      {isFullyComplete && (
         <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 z-30">
            <a 
              href={`/learn/${courseId}/success`} 
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black rounded-xl flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] group animate-pulse"
            >
               <span>Claim Certificate</span>
               <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
            </a>
         </div>
      )}
    </div>
  );
}
