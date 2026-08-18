'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';

function ForgotPasswordContent() {
  const [step, setStep] = useState<'email' | 'otp' | 'password' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

  React.useEffect(() => {
    if (step === 'success') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, router]);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setStep('otp');
    } catch (e: any) {
      const errorData = e?.response?.data?.error?.message || e?.response?.data?.message || e?.response?.data?.error;
      const msg = Array.isArray(errorData) ? errorData[0] : typeof errorData === 'string' ? errorData : e?.message || 'Failed to request password reset. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await authApi.verifyResetCode(email, code);
      setStep('password');
    } catch (e: any) {
      const errorData = e?.response?.data?.error?.message || e?.response?.data?.message || e?.response?.data?.error;
      const msg = Array.isArray(errorData) ? errorData[0] : typeof errorData === 'string' ? errorData : e?.message || 'Invalid or expired code.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await authApi.resetPassword(email, code, newPassword);
      setStep('success');
    } catch (e: any) {
      const errorData = e?.response?.data?.error?.message || e?.response?.data?.message || e?.response?.data?.error;
      const msg = Array.isArray(errorData) ? errorData[0] : typeof errorData === 'string' ? errorData : e?.message || 'Failed to reset password. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-900">
      {/* Left: Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white dark:bg-slate-900/5 rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white dark:bg-slate-900/5 rounded-full -translate-x-1/3 translate-y-1/3" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '28px 28px'
          }} />
        </div>
        <div className="relative z-10 text-center text-white space-y-6 px-12">
          <img src="/logo.svg" alt="EmberQuest" className="h-16 w-auto object-contain filter invert brightness-200 mx-auto" />
          <div>
            <h2 className="text-4xl font-bold tracking-tight">EmberQuest</h2>
            <a href="https://www.skilvi.in" target="_blank" rel="noopener noreferrer" className="block text-blue-200 text-sm font-semibold mt-1 uppercase tracking-widest hover:text-white transition-colors">powered by Skilvi</a>
          </div>
          <p className="text-blue-100 text-lg font-medium leading-relaxed max-w-xs mx-auto">
            Securely recover your account and get back to learning.
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile brand */}
          <div className="flex lg:hidden items-center gap-3">
            <img src="/logo.svg" alt="EmberQuest" className="h-10 w-auto object-contain dark:invert dark:brightness-200" />
            <div>
              <p className="font-extrabold text-slate-900 dark:text-slate-50 text-xl tracking-tight">EmberQuest</p>
              <a href="https://www.skilvi.in" target="_blank" rel="noopener noreferrer" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors mt-0.5">powered by skilvi</a>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
              {step === 'email' && 'Reset your password'}
              {step === 'otp' && 'Verify your email'}
              {step === 'password' && 'Choose a new password'}
              {step === 'success' && 'Password reset complete'}
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              {step === 'email' && "Enter your email address and we'll send you a 6-digit code to reset your password."}
              {step === 'otp' && `We've sent a 6-digit verification code to ${email}. (Code expires in 15 minutes)`}
              {step === 'password' && 'Create a new, strong password for your account.'}
              {step === 'success' && 'You can now log in with your new password.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-sm font-medium flex items-start gap-2">
              <span className="flex-shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border rounded-xl text-slate-900 dark:text-slate-50 placeholder:text-slate-400 outline-none transition-all text-sm border-slate-200 dark:border-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-[14px] font-semibold text-white text-sm bg-gradient-to-br from-blue-600 to-blue-500 shadow-[0_8px_30px_rgba(37,99,235,0.25)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {isLoading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">6-Digit Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border rounded-xl text-slate-900 dark:text-slate-50 placeholder:text-slate-400 outline-none transition-all text-sm border-slate-200 dark:border-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 tracking-[0.5em] font-mono text-center"
                  placeholder="000000"
                  autoComplete="one-time-code"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full py-3 rounded-[14px] font-semibold text-white text-sm bg-gradient-to-br from-blue-600 to-blue-500 shadow-[0_8px_30px_rgba(37,99,235,0.25)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
              
              <div className="text-center mt-4">
                 <button type="button" onClick={() => { setStep('email'); setCode(''); }} className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">Use a different email</button>
              </div>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border rounded-xl text-slate-900 dark:text-slate-50 placeholder:text-slate-400 outline-none transition-all text-sm border-slate-200 dark:border-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border rounded-xl text-slate-900 dark:text-slate-50 placeholder:text-slate-400 outline-none transition-all text-sm border-slate-200 dark:border-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-[14px] font-semibold text-white text-sm bg-gradient-to-br from-blue-600 to-blue-500 shadow-[0_8px_30px_rgba(37,99,235,0.25)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="space-y-5">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <a
                href="/login"
                className="block text-center w-full py-3 rounded-[14px] font-semibold text-white text-sm bg-slate-900 hover:bg-slate-800 shadow-sm transition-all"
              >
                Return to login {countdown > 0 && `(${countdown}s)`}
              </a>
            </div>
          )}

          {step !== 'success' && (
            <p className="text-center text-sm text-slate-500">
              Remember your password?{' '}
              <a href="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Log in instead
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
