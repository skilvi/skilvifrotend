import React, { useState, useEffect } from 'react';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface MCQQuestion {
  id: string;
  text: string;
  options: QuestionOption[];
  correctOptionIds: string[];
  marks: number;
}

interface MCQBuilderPopupProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuestions?: MCQQuestion[];
  initialPassingScore?: number;
  onSave: (questions: MCQQuestion[], passingScore: number) => void;
}

export const MCQBuilderPopup: React.FC<MCQBuilderPopupProps> = ({
  isOpen,
  onClose,
  initialQuestions = [],
  initialPassingScore = 50,
  onSave,
}) => {
  const [questions, setQuestions] = useState<MCQQuestion[]>(
    initialQuestions.length ? initialQuestions : [createEmptyQuestion()]
  );
  
  const totalMaxMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  
  const [passingScore, setPassingScore] = useState<number>(initialPassingScore);

  useEffect(() => {
    if (passingScore > totalMaxMarks && totalMaxMarks > 0) {
      setPassingScore(Math.max(1, Math.floor(totalMaxMarks / 2)));
    }
  }, [totalMaxMarks, passingScore]);

  function createEmptyQuestion(): MCQQuestion {
    const qId = Math.random().toString(36).substring(2, 9);
    return {
      id: qId,
      text: '',
      options: [
         { id: `${qId}-o1`, text: 'Option A' },
         { id: `${qId}-o2`, text: 'Option B' }
      ],
      correctOptionIds: [],
      marks: 10,
    };
  }

  const addQuestion = () => {
    setQuestions([...questions, createEmptyQuestion()]);
  };

  const updateQuestion = (qId: string, updates: Partial<MCQQuestion>) => {
    const newQuestions = questions.map((q) => (q.id === qId ? { ...q, ...updates } : q));
    setQuestions(newQuestions);
  };

  const removeQuestion = (qId: string) => {
    const newQuestions = questions.filter((q) => q.id !== qId);
    setQuestions(newQuestions);
  };

  const addOption = (qId: string) => {
    const q = questions.find((q) => q.id === qId);
    if (!q) return;
    const newOptions = [...q.options, { id: `${qId}-o${q.options.length + 1}`, text: `Option ${q.options.length + 1}` }];
    updateQuestion(qId, { options: newOptions });
  };

  const removeOption = (qId: string, optId: string) => {
    const q = questions.find((q) => q.id === qId);
    if (!q) return;
    const newOptions = q.options.filter((o) => o.id !== optId);
    const newCorrectOptionIds = q.correctOptionIds.filter((id) => id !== optId);
    updateQuestion(qId, { options: newOptions, correctOptionIds: newCorrectOptionIds });
  };

  const updateOptionText = (qId: string, optId: string, text: string) => {
    const q = questions.find((q) => q.id === qId);
    if (!q) return;
    const newOptions = q.options.map((o) => (o.id === optId ? { ...o, text } : o));
    updateQuestion(qId, { options: newOptions });
  };

  const toggleCorrectOption = (qId: string, optId: string) => {
    const q = questions.find((q) => q.id === qId);
    if (!q) return;
    let newCorrectOptionIds = [...q.correctOptionIds];
    if (newCorrectOptionIds.includes(optId)) {
      newCorrectOptionIds = newCorrectOptionIds.filter((id) => id !== optId);
    } else {
      newCorrectOptionIds.push(optId);
    }
    updateQuestion(qId, { correctOptionIds: newCorrectOptionIds });
  };

  const handleSave = () => {
    // Basic validation
    for (const q of questions) {
      if (!q.text.trim()) return alert('All questions must have text.');
      if (q.options.length < 2) return alert('Each question must have at least 2 options.');
      if (q.correctOptionIds.length === 0) return alert('Each question must have at least 1 correct option.');
    }
    if (passingScore > totalMaxMarks) return alert('Passing score cannot exceed total marks.');
    if (passingScore <= 0) return alert('Passing score must be greater than 0.');
    onSave(questions, passingScore);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col p-0 m-0">
      <div className="bg-slate-50 dark:bg-slate-900 w-full h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 shadow-sm">
          <div>
             <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Assignment Builder</h2>
             <p className="text-sm text-slate-500 mt-1">Design multiple choice questions and passing requirements.</p>
          </div>
          <div className="flex items-center gap-8">
             <div className="flex items-center gap-3">
               <span className="text-sm font-semibold text-slate-500">Passing Score:</span>
               <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  <input 
                    type="number" 
                    className="w-16 text-center border-none focus:ring-0 p-2 font-bold text-blue-600 bg-transparent" 
                    value={passingScore} 
                    onChange={(e) => {
                      let val = parseInt(e.target.value) || 0;
                      if (val > totalMaxMarks) val = totalMaxMarks;
                      setPassingScore(val);
                    }} 
                    min={1}
                    max={totalMaxMarks}
                  />
                  <div className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold border-l border-slate-300 dark:border-slate-600">
                    / {totalMaxMarks}
                  </div>
               </div>
             </div>
             <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:text-slate-300 transition-colors">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
        </div>

        {/* Builder Canvas */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-100 dark:bg-slate-900/50">
          <div className="max-w-4xl mx-auto space-y-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-lg p-5">
              <div className="flex justify-between items-start gap-4 mb-4">
                 <div className="flex-1">
                   <div className="flex items-center gap-2 mb-2">
                     <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                       {idx + 1}
                     </span>
                     <h3 className="font-semibold text-slate-800 dark:text-slate-200">Question Text</h3>
                   </div>
                   <textarea
                     className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-3 min-h-[80px]"
                     placeholder="What is..."
                     value={q.text}
                     onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                   />
                 </div>
                 <div className="flex flex-col gap-2 items-end">
                   <div className="flex items-center gap-2">
                     <label className="text-xs font-semibold text-slate-500 uppercase">Marks</label>
                     <input 
                       type="number" 
                       className="w-16 border border-slate-300 dark:border-slate-700 rounded p-1 text-center font-semibold"
                       value={q.marks}
                       onChange={(e) => updateQuestion(q.id, { marks: parseInt(e.target.value) || 0 })}
                     />
                   </div>
                   <button 
                     onClick={() => removeQuestion(q.id)}
                     className="text-xs text-red-500 hover:text-red-700 font-semibold"
                   >
                     Remove Question
                   </button>
                 </div>
              </div>

              <div className="pl-8 space-y-3">
                 <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Options (Tick checkbox if correct)</h4>
                 {q.options.map((opt, oIdx) => (
                   <div key={opt.id} className={`flex items-center gap-3 p-2 rounded-lg border ${q.correctOptionIds.includes(opt.id) ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/50'}`}>
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-emerald-600 rounded cursor-pointer"
                        checked={q.correctOptionIds.includes(opt.id)}
                        onChange={() => toggleCorrectOption(q.id, opt.id)}
                      />
                      <span className="text-sm font-bold text-slate-400 w-4">{String.fromCharCode(65 + oIdx)}</span>
                      <input 
                        type="text"
                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-1.5 text-sm"
                        value={opt.text}
                        onChange={(e) => updateOptionText(q.id, opt.id, e.target.value)}
                      />
                      <button onClick={() => removeOption(q.id, opt.id)} className="text-slate-300 hover:text-red-500 p-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                   </div>
                 ))}
                 
                 <button 
                   onClick={() => addOption(q.id)}
                   className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2"
                 >
                   + Add Option
                 </button>
              </div>
            </div>
          ))}

          <button 
            onClick={addQuestion}
            className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 font-bold rounded-lg hover:bg-slate-50 dark:bg-slate-800/50 hover:border-blue-400 hover:text-blue-600 transition"
          >
             + Add Another Question
          </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
           <div className="text-sm text-slate-500 font-medium">
             Total Marks: <span className="font-bold text-slate-800 dark:text-slate-200">{questions.reduce((sum, q) => sum + (q.marks || 0), 0)}</span> | 
             Passing Require: <span className="font-bold text-slate-800 dark:text-slate-200">{passingScore}</span>
           </div>
           <div className="flex items-center gap-3">
             <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 rounded-lg transition">Cancel</button>
             <button onClick={handleSave} className="px-6 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm">
               Save Assignment
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
