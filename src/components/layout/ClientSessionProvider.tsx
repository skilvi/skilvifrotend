'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function ClientSessionProvider({ children }: { children: React.ReactNode }) {
  const { checkSession, isHydrated, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    // Always run session check on hydration.
    // This is required for Google OAuth because the token is in an HttpOnly cookie,
    // so checking localStorage (hasToken) is not sufficient.
    checkSession();
  }, [isHydrated, checkSession]);

  return <>{children}</>;
}
