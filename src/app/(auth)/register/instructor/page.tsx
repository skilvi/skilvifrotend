'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { instructorRegisterSchema, InstructorRegisterCredentials, authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function InstructorRegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InstructorRegisterCredentials>({
    resolver: zodResolver(instructorRegisterSchema),
  });

  const onSubmit = async (data: InstructorRegisterCredentials) => {
    setServerError(null);
    try {
      // Force instructor role
      const payload = { ...data, role: 'instructor' as const };
      const response: any = await authApi.register(payload);
      const { accessToken, user } = response;

      if (!accessToken || !user) {
        throw new Error('Unexpected response shape from server.');
      }

      setAuth(user, accessToken);
      // Route directly to the instructor portal
      router.push('/instructor/courses');
    } catch (e: any) {
      const errorData = e?.response?.data?.error?.message || e?.response?.data?.message;
      const msg = Array.isArray(errorData) 
        ? errorData[0] 
        : errorData || e?.message || 'Registration failed. Please try again.';
      setServerError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Become an Instructor</h1>
          <p className="text-emerald-300 mt-2 text-sm">Create your instructor account to build and sell courses</p>
        </div>

        <div className="bg-white dark:bg-slate-900/5 backdrop-blur-sm border border-emerald-500/20 p-8 rounded-2xl shadow-2xl">
          {serverError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-lg mb-4 text-sm font-medium">
              ⚠️ {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Instructor Display Name
              </label>
              <input
                type="text"
                {...register('displayName')}
                className={`w-full px-4 py-2.5 bg-white dark:bg-slate-900/10 border rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.displayName
                    ? 'border-red-500 focus:ring-red-500/40'
                    : 'border-emerald-500/30 focus:ring-emerald-500/40 focus:border-emerald-500/50'
                }`}
                placeholder="Dr. John Doe"
                autoComplete="name"
              />
              {errors.displayName && (
                <p className="text-red-400 text-xs mt-1">{errors.displayName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                {...register('email')}
                className={`w-full px-4 py-2.5 bg-white dark:bg-slate-900/10 border rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500/40'
                    : 'border-emerald-500/30 focus:ring-emerald-500/40 focus:border-emerald-500/50'
                }`}
                placeholder="instructor@example.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                {...register('phone')}
                className={`w-full px-4 py-2.5 bg-white dark:bg-slate-900/10 border rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.phone
                    ? 'border-red-500 focus:ring-red-500/40'
                    : 'border-emerald-500/30 focus:ring-emerald-500/40 focus:border-emerald-500/50'
                }`}
                placeholder="+1 234 567 890"
                autoComplete="tel"
              />
              {errors.phone && (
                <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                {...register('password')}
                className={`w-full px-4 py-2.5 bg-white dark:bg-slate-900/10 border rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.password
                    ? 'border-red-500 focus:ring-red-500/40'
                    : 'border-emerald-500/30 focus:ring-emerald-500/40 focus:border-emerald-500/50'
                }`}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 mt-6 ${
                isSubmitting
                  ? 'bg-emerald-600/50 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30'
              }`}
            >
              {isSubmitting ? 'Creating account...' : 'Create Instructor Account'}
            </button>
          </form>

          <p className="mt-8 pt-6 border-t border-emerald-500/20 text-center text-sm text-slate-400">
            Looking to be a student instead?{' '}
            <a href="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Sign up as a student &rarr;
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
