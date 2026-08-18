"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { legalConsentService } from "@/lib/services/legalConsentService";

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [prefs, setPrefs] = useState({
    functional: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Delay check slightly so it doesn't block main thread render
    const timer = setTimeout(() => {
      const existingConsent = legalConsentService.getCookieConsent();
      if (!existingConsent) {
        setIsVisible(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleAcceptAll = () => {
    legalConsentService.saveCookieConsent({
      analytics: true,
      functional: true,
      marketing: true,
    });
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    legalConsentService.saveCookieConsent({
      analytics: false,
      functional: false,
      marketing: false,
    });
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    legalConsentService.saveCookieConsent({
      analytics: prefs.analytics,
      functional: true, // Essential is always required
      marketing: prefs.marketing,
    });
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-3 right-3 left-3 md:left-auto md:right-5 z-[100] md:w-[420px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl p-4 flex flex-col overflow-y-auto transition-all duration-300 animate-fade-up ${
        showPreferences ? "max-h-[300px]" : "max-h-[140px] md:max-h-none"
      }`}
    >
      {showPreferences ? (
        <>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-900 dark:text-slate-50 font-bold text-sm">
              Cookie Preferences
            </h3>
            <button
              onClick={handleClose}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-50 transition-colors p-1 -mr-1 -mt-1"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4 mb-5 flex-1 pr-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">
                  Essential
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Required for the site to function properly.
                </p>
              </div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Always On
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">
                  Analytics
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Helps us understand how you use the site.
                </p>
              </div>
              <button
                onClick={() =>
                  setPrefs((p) => ({ ...p, analytics: !p.analytics }))
                }
                className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 border ${
                  prefs.analytics
                    ? "bg-blue-600 border-blue-600"
                    : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[1px] transition-all duration-200 shadow-sm`}
                  style={{ left: prefs.analytics ? "calc(100% - 16px)" : "2px" }}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">
                  Marketing
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Used to deliver relevant advertisements.
                </p>
              </div>
              <button
                onClick={() =>
                  setPrefs((p) => ({ ...p, marketing: !p.marketing }))
                }
                className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 border ${
                  prefs.marketing
                    ? "bg-blue-600 border-blue-600"
                    : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[1px] transition-all duration-200 shadow-sm`}
                  style={{ left: prefs.marketing ? "calc(100% - 16px)" : "2px" }}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-auto">
            <button
              onClick={handleSavePreferences}
              className="w-full px-4 py-2 bg-slate-900 dark:bg-slate-50 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-semibold rounded-lg transition-colors"
            >
              Save Preferences
            </button>
            <button
              onClick={() => setShowPreferences(false)}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg transition-colors"
            >
              Back
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-slate-900 dark:text-slate-50 font-bold text-sm">
              Privacy & Cookies
            </h3>
            <button
              onClick={handleClose}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-50 transition-colors p-1 -mr-1 -mt-1"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-3">
            We use cookies and similar technologies to improve your experience,
            maintain security, analyze traffic, and provide our services.{" "}
            <Link
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-900 dark:text-slate-50 underline hover:text-blue-600 transition-colors"
            >
              Privacy Policy
            </Link>
            {" · "}
            <Link
              href="/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-900 dark:text-slate-50 underline hover:text-blue-600 transition-colors"
            >
              Terms of Use
            </Link>
          </p>

          <div className="flex items-center gap-2 mt-auto overflow-x-auto">
            <button
              onClick={handleAcceptAll}
              className="flex-shrink-0 px-4 py-1.5 bg-slate-900 dark:bg-slate-50 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-semibold rounded-lg transition-colors"
            >
              Accept All
            </button>
            <button
              onClick={() => setShowPreferences(true)}
              className="flex-shrink-0 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg transition-colors"
            >
              Manage Preferences
            </button>
            <button
              onClick={handleRejectNonEssential}
              className="flex-shrink-0 px-3 py-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-medium transition-colors"
            >
              Reject Non-Essential
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CookieBanner;
