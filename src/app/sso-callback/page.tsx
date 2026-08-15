'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';

export default function SSOCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);
  // BUG FIX: Prevent double-firing of SSO exchange due to React Strict Mode or rapid double-renders
  const exchangeAttempted = React.useRef(false);

  useEffect(() => {
    const handleSSO = async () => {
      if (exchangeAttempted.current) return;
      exchangeAttempted.current = true;

      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        if (errorParam === 'not_logged_in') {
          // Normal case: user is just not logged into the hub. Redirect to login.
          router.replace('/login');
        } else {
          setError(`SSO Error: ${errorParam}`);
          toast.error('Single Sign-On failed. Please log in normally.');
          router.replace('/login');
        }
        return;
      }

      if (!code) {
        router.replace('/login');
        return;
      }

      try {
        const response = await authApi.ssoExchange(code);
        // response contains { accessToken, user }
        setAuth(response.user, response.accessToken);
        toast.success('Successfully logged in via SSO!');
        
        // Redirect to dashboard or originally requested page
        router.replace('/dashboard');
      } catch (err) {
        console.error('SSO Exchange failed:', err);
        setError('Failed to exchange SSO token. Please log in again.');
        toast.error('SSO failed. Please log in manually.');
        router.replace('/login');
      }
    };

    handleSSO();
  }, [router, searchParams, setAuth]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
        {error ? error : 'Completing Sign In...'}
      </h2>
      <p className="text-slate-500 mt-2">Please wait a moment.</p>
    </div>
  );
}
