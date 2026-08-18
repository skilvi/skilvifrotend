'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api/client';
import toast from 'react-hot-toast';
import { Phone, ShieldCheck } from 'lucide-react';

export function PhoneCaptureModal() {
  const { isAuthenticated, user, checkSession, isLoading } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine if modal should be shown
  useEffect(() => {
    // Only show if authenticated, user is loaded, NOT loading, and phone is missing (skip for instructors)
    if (!isLoading && isAuthenticated && user && !user.phone && user.role !== 'instructor') {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isLoading, isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsSubmitting(true);
    try {
      // The requirement specifies +91 with a space
      const formattedPhone = `+91 ${phoneNumber.trim()}`;
      
      const updatedUser: any = await apiClient.patch('/users/me', { phone: formattedPhone });
      
      toast.success('Phone number saved successfully!');
      
      // Update the user state directly to immediately close the modal and avoid checkSession race conditions
      if (updatedUser && updatedUser.phone) {
        const currentToken = localStorage.getItem('access_token') || undefined;
        useAuthStore.getState().setAuth(updatedUser, currentToken);
      } else {
        // Fallback just in case
        await checkSession(true);
      }
    } catch (error) {
      console.error('Failed to save phone number:', error);
      toast.error('Failed to save phone number. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-md">
      {/* Un-dismissible backdrop, clicking outside does nothing */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 m-4 relative overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
        
        {/* Top decorative gradient */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-400" />

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
            <Phone className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Secure Your Account</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            To ensure the best experience and account security, please verify your phone number to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Mobile Number
            </label>
            <div className="relative flex items-center">
              {/* Fixed Prefix */}
              <div className="absolute left-0 inset-y-0 flex items-center pl-4 pointer-events-none border-r border-slate-200 dark:border-slate-700 pr-3 my-2">
                <span className="text-slate-500 dark:text-slate-400 font-semibold tracking-wider">+91 </span>
              </div>
              
              <input
                type="tel"
                id="phone"
                required
                maxLength={10}
                disabled={isSubmitting}
                className="block w-full pl-[5.5rem] pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors disabled:opacity-50 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                placeholder="9876543210"
                value={phoneNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhoneNumber(val);
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Your number is used for account support and payment pre-fill. We won't share it with third parties.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || phoneNumber.length < 10}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
