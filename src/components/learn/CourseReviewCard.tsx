'use client';

import React, { useState } from 'react';
import { Star, MessageSquare, ExternalLink, ThumbsUp, Send } from 'lucide-react';
import { learningApi } from '@/lib/api/learning';
import { toast } from 'react-hot-toast';

export const CourseReviewCard = ({ courseId }: { courseId: string }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [step, setStep] = useState<'RATING' | 'FEEDBACK' | 'GOOGLE' | 'DONE'>('RATING');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // The actual Google Business Profile Review Link
  const GOOGLE_REVIEW_LINK = 'https://share.google/b0Wupj0BoIUyV3HcL';

  const handleRatingSelect = async (selectedRating: number) => {
    setRating(selectedRating);
    
    // If it's 4 or 5 stars, we submit it immediately behind the scenes, and show Google modal
    if (selectedRating >= 4) {
      try {
        await learningApi.submitReview(courseId, selectedRating, '');
        setStep('GOOGLE');
      } catch (err) {
        console.error(err);
        // Fallback to feedback if error (e.g. they already reviewed)
        setStep('FEEDBACK');
      }
    } else {
      // 3 stars or below, ask for textual feedback to improve
      setStep('FEEDBACK');
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!comment.trim()) {
      toast.error("Please enter some feedback");
      return;
    }
    setIsSubmitting(true);
    try {
      await learningApi.submitReview(courseId, rating, comment);
      setStep('DONE');
      toast.success("Thank you for your feedback!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'DONE') {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-6 text-center animate-in zoom-in duration-500 h-full flex flex-col justify-center">
        <div className="mx-auto bg-emerald-500 w-12 h-12 rounded-full flex items-center justify-center mb-3">
          <ThumbsUp className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-emerald-800 dark:text-emerald-300 font-bold text-lg mb-1">Feedback Received!</h3>
        <p className="text-emerald-600 dark:text-emerald-400 text-sm">Thank you for helping us improve our platform.</p>
      </div>
    );
  }

  if (step === 'GOOGLE') {
    return (
      <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 text-center shadow-lg shadow-amber-500/5 animate-in slide-in-from-bottom-4 duration-500 h-full flex flex-col justify-center">
        <div className="mx-auto bg-amber-100 dark:bg-amber-900/50 w-16 h-16 rounded-full flex items-center justify-center mb-4 border-4 border-amber-50 dark:border-amber-950">
          <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
        </div>
        <h3 className="text-slate-900 dark:text-white font-black text-xl mb-2">Wow, {rating} stars! 🤩</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
          Since you loved the course, could you take 10 seconds to share your experience on Google? It helps us immensely!
        </p>
        <a 
          href={GOOGLE_REVIEW_LINK}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setStep('DONE')} // Mark as done when they click it
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
        >
          <ExternalLink className="w-5 h-5 shrink-0" />
          <span className="break-words">Review us on Google</span>
        </a>
        <button 
          onClick={() => setStep('DONE')}
          className="block w-full mt-4 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          No thanks, maybe later
        </button>
      </div>
    );
  }

  if (step === 'FEEDBACK') {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-in slide-in-from-bottom-4 duration-500 text-left h-full flex flex-col">
        <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">How can we improve?</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
          You rated this course {rating} out of 5. Please let us know how we can make it better for future students.
        </p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us what you didn't like..."
          className="w-full flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none h-24 mb-4"
        ></textarea>
        <div className="flex gap-3">
          <button
            onClick={() => setStep('RATING')}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleFeedbackSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : (
              <>
                <Send className="w-4 h-4 shrink-0" />
                <span className="break-words">Submit Feedback</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm text-center h-full flex flex-col justify-center">
      <div className="mx-auto bg-amber-50 dark:bg-amber-900/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="w-6 h-6 text-amber-500" />
      </div>
      <h3 className="text-slate-900 dark:text-white font-bold text-xl mb-1">Rate this Course</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">How was your learning experience?</p>
      
      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2 flex-wrap">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => handleRatingSelect(star)}
            className="p-1 transition-transform hover:scale-110 focus:outline-none"
          >
            <Star 
              className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors duration-200 ${
                (hoverRating || rating) >= star 
                  ? 'text-amber-400 fill-amber-400 drop-shadow-sm' 
                  : 'text-slate-200 dark:text-slate-800'
              }`} 
            />
          </button>
        ))}
      </div>
    </div>
  );
};
