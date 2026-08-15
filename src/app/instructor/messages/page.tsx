'use client';

import React, { useState, useEffect } from 'react';
import { qaApi, Question } from '@/lib/api/qa';
import { getAvatarUrl } from '@/lib/utils';
import Image from 'next/image';
import { MessageSquare, User, Clock, Send, CheckCircle2, ChevronRight, School } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function InstructorQAPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [filterCourse, setFilterCourse] = useState<string>('all');

  const fetchQuestions = async () => {
    try {
      const data = await qaApi.getInstructorQuestions();
      setQuestions(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load questions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleReply = async (questionId: string) => {
    const text = replyText[questionId];
    if (!text?.trim()) return;
    try {
      await qaApi.replyToQuestion(questionId, text);
      setReplyText(prev => ({ ...prev, [questionId]: '' }));
      setActiveReplyId(null);
      toast.success("Response dispatched.");
      fetchQuestions();
    } catch (err) {
      toast.error("Failed to send reply.");
    }
  };

  const uniqueCourses = Array.from(new Set(questions.map(q => (q as any).course?.id)));
  const filteredQuestions = filterCourse === 'all' 
    ? questions 
    : questions.filter(q => (q as any).course?.id === filterCourse);

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Q&A Management</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Academic Interaction Matrix</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50">
           <School className="w-4 h-4 text-slate-400 ml-2" />
           <select 
             value={filterCourse}
             onChange={e => setFilterCourse(e.target.value)}
             className="bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-0 outline-none pr-8 cursor-pointer"
           >
             <option value="all">All Academic Streams</option>
             {Array.from(new Set(questions.map(q => (q as any).course?.title))).map(title => (
               <option key={title} value={questions.find(q => (q as any).course?.title === title)?.course?.id}>
                  {title}
               </option>
             ))}
           </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6">
           {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-200 rounded-3xl animate-pulse" />)}
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="text-center py-32 bg-slate-100 dark:bg-slate-800/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
          <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-6" />
          <h3 className="text-xl font-black text-slate-400 tracking-tight">System Quiescent</h3>
          <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-black">No student inquiries currently pending.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredQuestions.map(q => (
            <div key={q.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group">
              <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-start gap-8">
                  {/* Student Info */}
                  <div className="flex md:flex-col items-center md:items-center gap-4 md:w-32 shrink-0">
                    <div className="w-16 h-16 rounded-3xl overflow-hidden relative border-2 border-slate-100 dark:border-slate-800/50 shadow-inner group-hover:scale-105 transition-transform duration-500">
                      <Image 
                        src={getAvatarUrl(q.student?.displayName)} 
                        alt={q.student?.displayName || "Student"} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div className="text-center md:text-center">
                       <p className="text-sm font-black text-slate-900 dark:text-slate-50 leading-tight">{q.student?.displayName}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Verified Scholar</p>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                       <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                          {(q as any).course?.title || 'Course'}
                       </span>
                       <span className="text-slate-300">•</span>
                       <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(q.createdAt).toLocaleString()}
                       </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800/50/50 relative">
                       <p className="text-slate-800 dark:text-slate-200 text-base leading-relaxed font-bold tracking-tight">
                          {q.content}
                       </p>
                       <div className="absolute -left-2 top-8 w-4 h-4 bg-slate-50 dark:bg-slate-800/50 border-l border-b border-slate-100 dark:border-slate-800/50/50 rotate-45" />
                    </div>

                    {/* Replies */}
                    {q.answers.length > 0 && (
                      <div className="space-y-4 pt-4">
                         {q.answers.map(ans => (
                           <div key={ans.id} className="flex gap-4 items-start bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                              <div className="w-8 h-8 rounded-full overflow-hidden relative border border-emerald-200 shrink-0">
                                <Image src={getAvatarUrl(ans.user?.displayName)} alt="Me" fill className="object-cover" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                   <span className="text-[11px] font-black text-emerald-800">{ans.user?.displayName}</span>
                                   <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                </div>
                                <p className="text-emerald-900/70 text-xs font-bold leading-relaxed">{ans.content}</p>
                              </div>
                           </div>
                         ))}
                      </div>
                    )}

                    {/* Reply Action */}
                    <div className="pt-4">
                       {activeReplyId === q.id ? (
                         <div className="flex gap-3 animate-in slide-in-from-top-2 duration-300">
                           <textarea
                             value={replyText[q.id] || ''}
                             onChange={e => setReplyText({ ...replyText, [q.id]: e.target.value })}
                             placeholder="Collaborate with your student..."
                             className="flex-1 bg-slate-50 dark:bg-slate-800/50 border-2 border-blue-100 rounded-[2rem] p-4 text-slate-800 dark:text-slate-200 text-sm font-bold focus:outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-900 transition-all min-h-[100px] resize-none"
                             autoFocus
                           />
                           <div className="flex flex-col gap-2 shrink-0">
                              <button
                                onClick={() => handleReply(q.id)}
                                disabled={!replyText[q.id]?.trim()}
                                className="bg-blue-600 hover:bg-blue-500 text-white w-14 h-14 rounded-[1.5rem] flex items-center justify-center disabled:opacity-50 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                              >
                                <Send className="w-6 h-6" />
                              </button>
                              <button 
                                onClick={() => setActiveReplyId(null)}
                                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 dark:text-slate-400 transition-colors"
                              >
                                Cancel
                              </button>
                           </div>
                         </div>
                       ) : (
                         <button 
                           onClick={() => setActiveReplyId(q.id)}
                           className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-950/20 group-hover:translate-x-2"
                         >
                           Transmit Feedback <ChevronRight className="w-3 h-3" />
                         </button>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
