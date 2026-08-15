import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Award } from 'lucide-react';
import { learningApi } from '@/lib/api/learning';
import { toast } from 'react-hot-toast';

interface AssignmentPlayerProps {
  courseId: string;
  lectureId: string;
  assignment: any; // { id, instructions, maxScore, passingScore, questions: MCQQuestion[] }
  onComplete: () => void;
}

export const AssignmentPlayer: React.FC<AssignmentPlayerProps> = ({
  courseId,
  lectureId,
  assignment,
  onComplete
}) => {
  const [answers, setAnswers] = useState<Record<string, string[]>>({}); // questionId -> selectedOptionIds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null); // State tracking completion

  if (!assignment || !assignment.questions || assignment.questions.length === 0) {
    return (
      <div className="flex-1 w-full bg-slate-900 flex flex-col items-center justify-center text-slate-400 p-8">
        <svg className="w-16 h-16 mb-4 text-slate-700 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h2 className="text-xl font-bold text-white mb-2">Assignment Unavailable</h2>
        <p>This assignment has not been fully configured by the instructor yet.</p>
      </div>
    );
  }

  const toggleOption = (qId: string, optId: string) => {
    setAnswers(prev => {
      const current = prev[qId] || [];
      if (current.includes(optId)) {
        return { ...prev, [qId]: current.filter(id => id !== optId) };
      } else {
        return { ...prev, [qId]: [...current, optId] };
      }
    });
  };

  const handleSubmit = async () => {
    // Determine if all questions were answered
    const missedQuestions = assignment.questions.filter((q: any) => !answers[q.id] || answers[q.id].length === 0);
    if (missedQuestions.length > 0) {
      if (!confirm(`You missed ${missedQuestions.length} questions. Are you sure you want to submit?`)) return;
    }

    setIsSubmitting(true);
    try {
      const response = await learningApi.submitAssignment(courseId, lectureId, answers);
      setResult(response);
      if (response.passed) {
        toast.success("Assignment passed successfully!", { icon: <Award className="w-5 h-5 text-amber-500" /> });
        // Trigger completion callback which unlock the next lecture!
        setTimeout(() => {
           onComplete();
        }, 1500);
      } else {
        toast.error("You didn't reach the passing score. Retest to proceed.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetest = () => {
    setAnswers({});
    setResult(null);
  };

  if (result) {
    const isPass = result.passed;
    return (
      <div className="flex-1 w-full bg-slate-900 overflow-y-auto p-4 md:p-10 flex flex-col items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 max-w-xl text-center flex flex-col items-center">
           <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 border-4 ${isPass ? 'bg-emerald-900/50 border-emerald-500 text-emerald-400' : 'bg-rose-900/50 border-rose-500 text-rose-400'}`}>
               <span className="text-3xl font-black">{Math.round(result.score || 0)}</span>
           </div>
           
           <h2 className="text-3xl font-bold mb-2 text-white">
             {isPass ? 'Splendid Work!' : 'Not Quite There...'}
           </h2>
           <p className="text-slate-400 mb-8 max-w-sm">
             You scored <strong className="text-white">{result.score || 0}</strong> out of <strong className="text-white">{result.maxScore || 0}</strong> ({Math.round(((result.score || 0) / (result.maxScore || 1)) * 100)}%). 
             <br/>
             Required to pass: <span className="text-white font-bold">{result.passingScore || 0}</span> ({Math.round(((result.passingScore || 0) / (result.maxScore || 1)) * 100)}%).
           </p>

           {isPass ? (
             <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-xl border border-emerald-500/20 w-full mb-6 text-sm font-semibold flex items-center justify-center gap-2">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                 Requirement Satisfied. Unlocking Next Module.
             </div>
           ) : (
             <button 
               onClick={handleRetest}
               className="w-full py-4 rounded-xl font-bold text-white bg-slate-700 hover:bg-slate-600 transition flex items-center justify-center gap-2"
             >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Attempt Retest
             </button>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-slate-900 overflow-y-auto relative">
       <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 pb-24 md:pb-20">
          
          <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-800/50 rounded-2xl p-5 md:p-8">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
               <div className="p-1.5 md:p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
               </div>
               <h2 className="text-xl md:text-2xl font-bold text-white">Interactive Assessment</h2>
            </div>
            {assignment.instructions && (
               <p className="text-sm md:text-base text-slate-300 font-medium whitespace-pre-wrap">{assignment.instructions}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2 md:gap-4 text-xs">
               <span className="bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300 border border-slate-700">Total Marks: <strong className="text-white">{assignment.maxScore}</strong></span>
               <span className="bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300 border border-slate-700">Minimum Score: <strong className="text-white">{assignment.passingScore || 0} ({Math.round(((assignment.passingScore || 0) / (assignment.maxScore || 1)) * 100)}%)</strong></span>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            {assignment.questions.map((q: any, idx: number) => {
              const userAnswers = answers[q.id] || [];
              return (
                <div key={q.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 md:p-6 shadow-sm">
                   <div className="flex gap-3 md:gap-4 items-start mb-4 md:mb-6">
                      <div className="w-7 h-7 md:w-8 md:h-8 shrink-0 bg-blue-900/50 text-blue-400 border border-blue-500/30 rounded-full flex items-center justify-center font-bold text-sm md:text-base">
                        {idx + 1}
                      </div>
                      <div className="flex-1 mt-0.5 md:mt-1">
                         <h3 className="text-base md:text-lg font-medium text-slate-100">{q.text}</h3>
                      </div>
                      <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-900 px-2 py-1 md:px-3 md:py-1.5 rounded-lg border border-slate-700 shrink-0">
                         {q.marks || 0} Pts
                      </div>
                   </div>

                   <div className="space-y-2 md:space-y-3 pl-0 sm:pl-10 md:pl-12">
                      {q.options.map((opt: any) => {
                        const isSelected = userAnswers.includes(opt.id);
                        return (
                          <div 
                            key={opt.id}
                            onClick={() => toggleOption(q.id, opt.id)}
                            className={`flex items-start md:items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border-2 transition cursor-pointer select-none ${isSelected ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-900/50 hover:bg-slate-700/50'}`}
                          >
                             <div className={`w-5 h-5 md:w-6 md:h-6 shrink-0 rounded border flex items-center justify-center transition-colors mt-0.5 md:mt-0 ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500 bg-slate-800'}`}>
                                {isSelected && <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                             </div>
                             <span className={`text-sm md:text-base flex-1 ${isSelected ? 'text-emerald-100 font-medium' : 'text-slate-300'}`}>{opt.text}</span>
                          </div>
                        );
                      })}
                   </div>
                </div>
              );
            })}
          </div>
       </div>
       
       <div className="sticky bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 p-4 md:p-6 z-10 flex justify-end shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full md:w-auto px-10 py-3.5 md:py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50 text-sm md:text-base flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
               <><div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Evaluating...</>
            ) : (
               'Submit Answers'
            )}
          </button>
       </div>
    </div>
  );
};
