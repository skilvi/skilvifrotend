'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function LinkInterceptor({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [pendingTarget, setPendingTarget] = useState<string | null>(null);
  const router = useRouter();

  const handleGlobalClick = useCallback((e: MouseEvent) => {
    // Find closest anchor tag
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');

    if (!anchor) return;

    const href = anchor.getAttribute('href');
    const linkTarget = anchor.getAttribute('target');

    // Ignore links without href or that are just anchor hashes/javascript
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
      return;
    }

    // Determine if the link is external
    let isExternal = false;
    try {
      const url = new URL(href, window.location.origin);
      // If it's a mailto, tel, etc., don't intercept
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return;
      }
      
      const hostname = url.hostname.toLowerCase();

      // Whitelist: internal domains + trusted services that should NEVER show the modal.
      // Google OAuth (accounts.google.com) must pass through silently — interrupting it
      // breaks the auth flow. WhatsApp links are also communication, not navigation away.
      const TRUSTED_DOMAINS = [
        // Internal domains
        window.location.hostname,
        'skilvi.in',
        'localhost',
        // Google auth & services — must never be blocked
        'accounts.google.com',
        'google.com',
        'googleapis.com'
      ];

      const isInternalDomain =
        !anchor.hasAttribute('data-external') &&
        (TRUSTED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d)) ||
        hostname.endsWith('.emberquest.in') ||
        hostname.endsWith('.skilvi.in'));

      isExternal = !isInternalDomain;
    } catch {
      // If URL parsing fails, assume it's a relative/internal link
      isExternal = false;
    }



    // Do not intercept internal links or the Google OAuth initiation link
    if (!isExternal || href.includes('/auth/google')) {
      return;
    }

    // Intercept external links!
    e.preventDefault();
    e.stopPropagation();

    setPendingHref(href);
    setPendingTarget(linkTarget);
    setIsOpen(true);
  }, []);

  useEffect(() => {
    // Use capture phase to intercept before React/Next.js onClick handlers
    document.addEventListener('click', handleGlobalClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  }, [handleGlobalClick]);

  const handleConfirm = () => {
    if (!pendingHref) return;

    setIsOpen(false);

    // If it's an external link or has target="_blank", use standard window functions
    if (pendingTarget === '_blank' || pendingHref.startsWith('http')) {
      window.open(pendingHref, pendingTarget || '_self');
    } else {
      // Internal navigation
      router.push(pendingHref);
    }

    setPendingHref(null);
    setPendingTarget(null);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setPendingHref(null);
    setPendingTarget(null);
  };

  return (
    <>
      {children}

      {/* Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">Leave Page?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Are you sure you want to navigate away from this page?
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                No
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
