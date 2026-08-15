'use client';

import React, { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterCredentials, authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSystemConfig } from '@/components/providers/SystemConfigProvider';

function RegisterFormContent() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  const { config, isLoading } = useSystemConfig();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterCredentials>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterCredentials) => {
    setServerError(null);
    try {
      const response: any = await authApi.register(data);
      const { accessToken, user } = response;
      if (!accessToken || !user) throw new Error('Unexpected response shape from server.');
      setAuth(user, accessToken);
      setIsRedirecting(true);
      if (user.role === 'instructor') {
        router.push('/instructor/courses');
      } else {
        const safeRedirect = (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')) ? redirectTo : '/dashboard';
        try {
          router.push(safeRedirect);
        } catch {
          router.push('/');
        }
      }
    } catch (e: any) {
      const errorData = e?.response?.data?.error?.message || e?.response?.data?.message;
      const msg = Array.isArray(errorData) ? errorData[0] : errorData || e?.message || 'Registration failed. Please try again.';
      setServerError(msg);
      setIsRedirecting(false);
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
          <img src="/logo.svg" alt={config.platformName} className="h-16 w-auto object-contain filter invert brightness-200 mx-auto" />
          <div>
            <h2 className="text-4xl font-bold tracking-tight">{config.platformName}</h2>
            <a href="https://www.skilvi.in" target="_blank" rel="noopener noreferrer" className="block text-blue-200 text-sm font-semibold mt-1 uppercase tracking-widest hover:text-white transition-colors">powered by Skilvi</a>
          </div>
          <p className="text-blue-100 text-lg font-medium leading-relaxed max-w-xs mx-auto">
            Join thousands of developers building world-class engineering skills.
          </p>
          <div className="flex flex-col gap-3 text-sm text-blue-100">
            {['Expert-taught curriculums', 'Lifetime course access', 'Industry certificates', 'Community of engineers'].map((feature) => (
              <div key={feature} className="flex items-center gap-3 justify-center">
                <div className="w-5 h-5 bg-white dark:bg-slate-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile brand */}
          <div className="flex lg:hidden items-center gap-3">
            <img src="/logo.svg" alt={config.platformName} className="h-10 w-auto object-contain dark:invert dark:brightness-200" />
            <div>
              <p className="font-extrabold text-slate-900 dark:text-slate-50 text-xl tracking-tight">{config.platformName}</p>
              <a href="https://www.skilvi.in" target="_blank" rel="noopener noreferrer" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors mt-0.5">powered by skilvi</a>
            </div>
          </div>

          {!isLoading && !config.enableRegistration ? (
            <div className="text-center space-y-4 py-8">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Registrations Closed</h2>
              <p className="text-slate-500 font-medium pb-6">
                The administrator has currently disabled new account registrations. Please check back later or contact {config.supportEmail}.
              </p>
              <a href="/login" className="inline-block py-3 px-8 rounded-[14px] font-semibold text-white text-sm bg-slate-900 dark:bg-white dark:text-slate-900 transition-all">
                Return to Login
              </a>
            </div>
          ) : (
            <div className="w-full space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Create your account</h1>
                <p className="text-slate-500 text-sm mt-1 font-medium">Start your learning journey today. Free forever.</p>
              </div>

          {/* Error */}
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-sm font-medium flex items-start gap-2">
              <span className="flex-shrink-0">⚠️</span>
              <span>{serverError}</span>
            </div>
          )}

          {/* Google Auth */}
          {!(isRedirecting || isSubmitting) && (
            <>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL!}/auth/google`}
                className="w-full py-3 px-4 rounded-[14px] font-semibold text-slate-700 dark:text-slate-200 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-sm"
              >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-slate-900 text-slate-400 font-medium">or register with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Display Name</label>
              <input
                type="text"
                {...register('displayName')}
                className={`w-full px-4 py-3 bg-white dark:bg-slate-900 border rounded-xl text-slate-900 dark:text-slate-50 placeholder:text-slate-400 outline-none transition-all text-sm ${
                  errors.displayName
                    ? 'border-red-400 focus:ring-2 focus:ring-red-500/20'
                    : 'border-slate-200 dark:border-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15'
                }`}
                placeholder="John Doe"
                autoComplete="name"
              />
              {errors.displayName && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.displayName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
              <input
                type="email"
                {...register('email')}
                className={`w-full px-4 py-3 bg-white dark:bg-slate-900 border rounded-xl text-slate-900 dark:text-slate-50 placeholder:text-slate-400 outline-none transition-all text-sm ${
                  errors.email
                    ? 'border-red-400 focus:ring-2 focus:ring-red-500/20'
                    : 'border-slate-200 dark:border-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15'
                }`}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                {...register('password')}
                className={`w-full px-4 py-3 bg-white dark:bg-slate-900 border rounded-xl text-slate-900 dark:text-slate-50 placeholder:text-slate-400 outline-none transition-all text-sm ${
                  errors.password
                    ? 'border-red-400 focus:ring-2 focus:ring-red-500/20'
                    : 'border-slate-200 dark:border-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15'
                }`}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isRedirecting}
              className="w-full py-3 rounded-[14px] font-semibold text-white text-sm bg-gradient-to-br from-blue-600 to-blue-500 shadow-[0_8px_30px_rgba(37,99,235,0.25)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none relative overflow-hidden"
            >
              {isSubmitting || isRedirecting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {isRedirecting ? 'Preparing your workspace…' : 'Creating account…'}
                </span>
              ) : 'Create Account — Free'}
            </button>

            <p className="text-center text-xs text-slate-400 font-medium">
              By creating an account you agree to our{' '}
              <a href="/terms" className="text-blue-600 hover:underline">Terms</a> and{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
            </p>
          </form>

          <div className="space-y-3 pt-2">
            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <a href="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Sign in
              </a>
            </p>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white dark:bg-slate-900 text-xs text-slate-400 font-medium">or</span>
              </div>
            </div>
            <a
              href="/register/instructor"
              className="block text-center py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-blue-200 hover:text-blue-700 hover:bg-blue-50 transition-all"
            >
              Become an Instructor →
            </a>
          </div>
            </>
          )}
          </div>
          )}
        </div>
      </div>

      {/* Full Page Loader Overlay */}
      {(isRedirecting || isSubmitting) && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm" style={{ pointerEvents: 'auto' }}>
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-700 dark:text-slate-200 font-medium">Loading dashboard... secure login</p>
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <RegisterFormContent />
    </Suspense>
  );
}
