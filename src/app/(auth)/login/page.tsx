'use client';

import React, { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginCredentials, authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginFormContent() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showOverridePopup, setShowOverridePopup] = useState(false);
  const [showTerminatedPopup, setShowTerminatedPopup] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState<LoginCredentials | null>(null);
  const { setAuth, isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  React.useEffect(() => {
    if (searchParams.get('error') === 'ACTIVE_SESSION_EXISTS') {
      setShowOverridePopup(true);
      setPendingLoginData(null); // Indicates Google login
      setTimeout(() => {
        window.location.href = '/api/v1/auth/google?forceLogout=true';
      }, 2000);
    }
    if (searchParams.get('reason') === 'session_terminated') {
      setShowTerminatedPopup(true);
    }
  }, [searchParams]);

  React.useEffect(() => {
    if (isHydrated && isAuthenticated) {
      const user = useAuthStore.getState().user;
      if (user?.role === 'instructor') {
        router.replace('/instructor/courses');
      } else {
        const safeRedirect = (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')) ? redirectTo : '/dashboard';
        try {
          router.replace(safeRedirect);
        } catch {
          router.replace('/');
        }
      }
    } else if (isHydrated && !isAuthenticated) {
      // Automatic SSO Check across domains without a full page redirect bounce
      const ssoChecked = sessionStorage.getItem('sso_checked');
      if (!ssoChecked) {
        sessionStorage.setItem('sso_checked', 'true');
        
        const checkSilentSso = async () => {
          try {
            const res = await fetch('/api/v1/auth/sso-silent', { credentials: 'include' });
            const data = await res.json();
            if (data.success && data.code) {
               // Exchange code for tokens
               const exchangeRes = await authApi.ssoExchange(data.code);
               if (exchangeRes && exchangeRes.accessToken) {
                 useAuthStore.getState().setAuth(exchangeRes.user, exchangeRes.accessToken);
                 // Redirect to dashboard smoothly
                 router.replace('/dashboard');
               }
            }
          } catch (e) {
            console.error('Silent SSO check failed', e);
          }
        };
        
        checkSilentSso();
      }
    }
  }, [isHydrated, isAuthenticated, router, redirectTo]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    setServerError(null);
    try {
      const response: any = await authApi.login(data);
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
      const errorData = e?.response?.data?.error?.message || e?.response?.data?.message || e?.response?.data?.error;
      
      if (errorData === 'ACTIVE_SESSION_EXISTS') {
        setShowOverridePopup(true);
        setIsRedirecting(true);
        setTimeout(() => {
          setShowOverridePopup(false);
          onSubmit({ ...data, forceLogout: true });
        }, 2000);
        return;
      }

      const msg = Array.isArray(errorData)
        ? errorData[0]
        : typeof errorData === 'string'
          ? errorData
          : e?.message || 'Invalid email or password. Please try again.';
      setServerError(msg);
      setIsRedirecting(false);
    }
  };

  const handleOverrideConfirm = async () => {
    setShowOverridePopup(false);
    if (pendingLoginData) {
      // Email Login Override
      await onSubmit({ ...pendingLoginData, forceLogout: true });
    } else {
      // Google Login Override
      setIsRedirecting(true);
      window.location.href = '/api/v1/auth/google?forceLogout=true';
    }
  };

  const handleDemoLogin = () => {
    setValue('email', 'student@example.com');
    setValue('password', 'password');
    setTimeout(() => handleSubmit(onSubmit)(), 50);
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-900">
      {/* Left: Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#395ce5] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/3 translate-y-1/3" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1.5px, transparent 1.5px)',
            backgroundSize: '32px 32px'
          }} />
        </div>
        <div className="relative z-10 text-center space-y-8 px-12">
          <img src="/logo.svg" alt="EmberQuest" className="h-16 w-auto object-contain filter invert brightness-200 mx-auto" />
          <div>
            <h2 className="text-5xl font-black tracking-tight text-[#0f172a]">EmberQuest</h2>
            <a href="https://www.skilvi.in" target="_blank" rel="noopener noreferrer" className="block text-white/90 text-sm font-bold mt-2 uppercase tracking-[0.2em] hover:text-white transition-colors">powered by Skilvi</a>
          </div>
          <p className="text-white text-xl font-medium leading-relaxed max-w-sm mx-auto">
            Join thousands of developers building world-class engineering skills.
          </p>
          <div className="flex flex-col gap-4 text-base text-white mt-8">
            {['Expert-taught curriculums', 'Full course access', 'Industry certificates', 'Community of engineers'].map((feature) => (
              <div key={feature} className="flex items-center gap-4 justify-center">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#395ce5]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>{feature}</span>
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
            <img src="/logo.svg" alt="EmberQuest" className="h-10 w-auto object-contain dark:invert dark:brightness-200" />
            <div>
              <p className="font-extrabold text-slate-900 dark:text-slate-50 text-xl tracking-tight">EmberQuest</p>
              <a href="https://www.skilvi.in" target="_blank" rel="noopener noreferrer" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors mt-0.5">powered by skilvi</a>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Sign in to continue your learning journey.</p>
          </div>

          {process.env.NODE_ENV !== 'production' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
              <p className="text-amber-800 text-sm font-semibold">🎯 Try Demo Mode (Dev Only)</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isSubmitting}
                  className="py-2 px-4 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl text-xs transition-all shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? '...' : '⚡ Student'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setValue('email', 'instructor@example.com');
                    setValue('password', 'password');
                    setTimeout(() => handleSubmit(onSubmit)(), 50);
                  }}
                  disabled={isSubmitting}
                  className="py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl text-xs transition-all shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? '...' : '👨‍🏫 Instructor'}
                </button>
              </div>
              <p className="text-amber-700/60 text-[10px] text-center">
                student@example.com / password · instructor@example.com / password
              </p>
            </div>
          )}

          {/* Error */}
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-sm font-medium flex items-start gap-2">
              <span className="flex-shrink-0">⚠️</span>
              <span>{serverError}</span>
            </div>
          )}

          {!(isRedirecting || isSubmitting) && (
            <>
              <a
                href="/api/v1/auth/google"
                onClick={() => setIsRedirecting(true)}
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
          <p className="text-[11px] text-slate-500 text-center mt-2">
            By continuing, you agree to our <a href="https://www.emberquest.in/terms-of-service" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700 dark:hover:text-slate-300">Terms</a> and <a href="https://www.emberquest.in/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700 dark:hover:text-slate-300">Privacy Policy</a>.
          </p>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-slate-900 text-slate-400 font-medium">or log in with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <a href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">Forgot password?</a>
              </div>
              <input
                type="password"
                {...register('password')}
                className={`w-full px-4 py-3 bg-white dark:bg-slate-900 border rounded-xl text-slate-900 dark:text-slate-50 placeholder:text-slate-400 outline-none transition-all text-sm ${
                  errors.password
                    ? 'border-red-400 focus:ring-2 focus:ring-red-500/20'
                    : 'border-slate-200 dark:border-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15'
                }`}
                placeholder="••••••••"
                autoComplete="current-password"
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
                  {isRedirecting ? 'Preparing your workspace…' : 'Signing in…'}
                </span>
              ) : 'Sign in'}
            </button>
            
            <p className="text-center text-[11px] text-slate-500 mt-4 leading-relaxed">
              By continuing, you agree to our <a href="https://www.emberquest.in/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Terms of Service</a> and acknowledge our <a href="https://www.emberquest.in/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Privacy Policy</a> and <a href="https://www.emberquest.in/acceptable-use-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Acceptable Use Policy</a>. Skilvi may process and manage information necessary to authenticate your account, secure access, and provide and administer our services.
            </p>
          </form>

              <p className="text-center text-sm text-slate-500">
                Don&apos;t have an account?{' '}
                <a href="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Create one free
                </a>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Active Session Override Popup */}
      {showOverridePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">Active Session Detected</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              You may be currently logged in on another device, or have an unexpired session. Logging in here will terminate any previous sessions.
              <br/><br/>
              Automatically logging you out of other devices...
            </p>
            <div className="flex justify-center w-full">
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        </div>
      )}

      {/* Session Terminated Popup */}
      {showTerminatedPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">Session Terminated</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              Your session was safely terminated because you logged into this account from another device. 
              <br/><br/>
              To continue using this device, simply log back in!
            </p>
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => {
                  setShowTerminatedPopup(false);
                  const newParams = new URLSearchParams(searchParams.toString());
                  newParams.delete('reason');
                  router.replace(`/login?${newParams.toString()}`);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-white shadow-sm transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Page Loader Overlay */}
      {(isRedirecting || isSubmitting) && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm" style={{ pointerEvents: 'auto' }}>
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-700 dark:text-slate-200 font-medium">Setting up your workspace…</p>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginFormContent />
    </Suspense>
  );
}
