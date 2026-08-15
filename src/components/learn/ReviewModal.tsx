'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface ReviewModalProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

export function ReviewModal({ courseId, isOpen, onClose, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment);
      onClose();
    } catch (err) {
      console.error("Review submission failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-500">
        <div className="bg-slate-900 px-6 py-8 text-center text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-600/20 rotate-3">
             <Star className="w-8 h-8 text-white fill-current" />
          </div>
          <h2 className="text-2xl font-bold">Course Completed!</h2>
          <p className="text-blue-300/80 text-sm mt-1">Your feedback helps us improve and unlocks your certificate.</p>
        </div>

        <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
          <div className="flex flex-col items-center">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">How was your experience?</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-transform active:scale-90"
                >
                  <Star 
                    className={`w-10 h-10 ${
                      star <= (hover || rating) 
                        ? 'text-amber-400 fill-current' 
                        : 'text-slate-200'
                    } transition-colors duration-200`}
                  />
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
               {rating === 5 && <><Star className="w-4 h-4 text-amber-400 fill-amber-400 inline-block -mt-1 mr-1" /> Exceptional Experience!</>}
               {rating === 4 && <><Star className="w-4 h-4 text-amber-400 fill-amber-400 inline-block -mt-1 mr-1" /> Really Good</>}
               {rating === 3 && <><Star className="w-4 h-4 text-amber-400 fill-amber-400 inline-block -mt-1 mr-1" /> Good, but could be better</>}
               {rating === 2 && <><Star className="w-4 h-4 text-amber-400 fill-amber-400 inline-block -mt-1 mr-1" /> Needs more work</>}
               {rating === 1 && <><Star className="w-4 h-4 text-amber-400 fill-amber-400 inline-block -mt-1 mr-1" /> Did not meet expectations</>}
               {rating === 0 && "Select a rating"}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Share your thoughts (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you enjoy most? How can we improve?"
              className="w-full h-24 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={rating === 0 || isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
              rating === 0 || isSubmitting
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Unlock Certificate'}
          </button>
        </form>
      </div>
    </div>
  );
}
