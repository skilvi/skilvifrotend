import React, { useState, useEffect } from 'react';
import { qaApi, Question } from '@/lib/api/qa';
import { getAvatarUrl } from '@/lib/utils';
import Image from 'next/image';
import { Send, MessageSquare, User, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface QAPanelProps {
  courseId: string;
  activeLectureId?: string;
  currentUserId?: string;
}

export function QAPanel({ courseId, activeLectureId, currentUserId }: QAPanelProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const fetchQuestions = async () => {
    try {
      const data = await qaApi.getQuestions(courseId);
      setQuestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [courseId]);

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setIsSubmitting(true);
    try {
      await qaApi.askQuestion(courseId, newQuestion, activeLectureId);
      setNewQuestion('');
      toast.success("Question posted!");
      fetchQuestions();
    } catch (err) {
      toast.error("Failed to post question.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (questionId: string) => {
    const text = replyText[questionId];
    if (!text?.trim()) return;
    try {
      await qaApi.replyToQuestion(questionId, text);
      setReplyText(prev => ({ ...prev, [questionId]: '' }));
      setActiveReplyId(null);
      toast.success("Reply posted!");
      fetchQuestions();
    } catch (err) {
      toast.error("Failed to reply.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Ask Question Box */}
      <form onSubmit={handleSubmitQuestion} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
           <MessageSquare className="w-4 h-4 text-blue-500" />
           Ask a Question
        </h3>
        <div className="space-y-4">
          <textarea
            value={newQuestion}
            onChange={e => setNewQuestion(e.target.value)}
            placeholder="What's on your mind? Mentioning the current lecture helps..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 min-h-[100px] resize-none transition-all"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !newQuestion.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
            >
              Post Question <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>

      {/* Questions List */}
      <div className="space-y-6">
        <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] px-1">
          Discussion Board ({questions.length})
        </h3>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-32 bg-slate-900 rounded-2xl animate-pulse border border-slate-800" />)}
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
            <p className="text-slate-500 font-bold">No questions yet. Be the first to start the discussion!</p>
          </div>
        ) : (
          questions.map(q => (
            <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg group">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden relative border border-slate-700 bg-slate-800 shrink-0">
                    <Image 
                      src={getAvatarUrl(q.student?.displayName)} 
                      alt={q.student?.displayName || "Student"} 
                      fill 
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-bold text-sm">{q.student?.displayName}</p>
                      <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(q.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{q.content}</p>
                    
                    {/* Interaction Bar */}
                    <div className="pt-4 flex items-center gap-6">
                      <button 
                        onClick={() => setActiveReplyId(activeReplyId === q.id ? null : q.id)}
                        className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-500 transition-colors flex items-center gap-2"
                      >
                        <MessageSquare className="w-3 h-3" /> {q.answers.length} Replies
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Answers Section */}
                {q.answers.length > 0 && (
                  <div className="mt-6 ml-14 space-y-4 border-l border-slate-800 pl-6">
                    {q.answers.map(ans => (
                      <div key={ans.id} className="flex items-start gap-3 group/ans">
                        <div className="w-7 h-7 rounded-full overflow-hidden relative border border-slate-700 bg-slate-800 shrink-0">
                          <Image 
                            src={getAvatarUrl(ans.user?.displayName)} 
                            alt={ans.user?.displayName || "User"} 
                            fill 
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                             <p className="text-slate-200 font-bold text-[11px]">{ans.user?.displayName}</p>
                             <span className="text-[9px] text-slate-600 dark:text-slate-400 font-medium">{new Date(ans.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-400 text-xs leading-relaxed">{ans.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                {activeReplyId === q.id && (
                  <div className="mt-6 ml-14 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex gap-3">
                      <textarea
                        value={replyText[q.id] || ''}
                        onChange={e => setReplyText({ ...replyText, [q.id]: e.target.value })}
                        placeholder="Write a reply..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-300 text-xs focus:outline-none focus:border-blue-500 min-h-[60px] resize-none"
                      />
                      <button
                        onClick={() => handleReply(q.id)}
                        disabled={!replyText[q.id]?.trim()}
                        className="bg-blue-600 hover:bg-blue-500 text-white w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50 transition-all active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
