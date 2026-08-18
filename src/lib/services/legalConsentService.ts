import { LEGAL_VERSIONS } from "../config/legal";

export interface CookiePreferences {
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

export interface CookieConsentRecord {
  version: string;
  acceptedAt: string;
  preferences: CookiePreferences;
}

export interface PolicyAcceptanceRecord {
  policyVersion: string;
  acceptedAt: string;
}

export const legalConsentService = {
  // ─── COOKIE CONSENT ───────────────────────────────────────────────────────
  getCookieConsent(): CookieConsentRecord | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("cookieConsent");
    return raw ? JSON.parse(raw) : null;
  },

  saveCookieConsent(preferences: CookiePreferences): void {
    if (typeof window === "undefined") return;
    const record: CookieConsentRecord = {
      version: "1.0",
      acceptedAt: new Date().toISOString(),
      preferences,
    };
    localStorage.setItem("cookieConsent", JSON.stringify(record));
    
    // Future implementation: POST /api/legal/consents/cookies
    // this.syncCookieConsent(record);
  },

  // ─── REGISTRATION CONSENT ─────────────────────────────────────────────────
  savePolicyAcceptance(): void {
    if (typeof window === "undefined") return;
    const record: PolicyAcceptanceRecord = {
      policyVersion: LEGAL_VERSIONS.terms, // could encompass all basic policies
      acceptedAt: new Date().toISOString(),
    };
    localStorage.setItem("registrationConsent", JSON.stringify(record));
    
    // Future implementation: POST /api/legal/consents/policies
    // this.syncPolicyAcceptance(record);
  },

  // ─── PURCHASE CONSENT ─────────────────────────────────────────────────────
  savePurchaseConsent(itemId: string): void {
    if (typeof window === "undefined") return;
    const record = {
      itemId,
      policyVersion: LEGAL_VERSIONS.refund,
      acceptedAt: new Date().toISOString(),
    };
    const key = `purchaseConsent_${itemId}`;
    localStorage.setItem(key, JSON.stringify(record));

    // Future implementation: POST /api/legal/consents/purchases
    // this.syncPurchaseConsent(record);
  },

  // ─── INTERNSHIP CONSENT ───────────────────────────────────────────────────
  saveInternshipConsent(internshipId: string): void {
    if (typeof window === "undefined") return;
    const record = {
      internshipId,
      policyVersion: LEGAL_VERSIONS.internship,
      acceptedAt: new Date().toISOString(),
    };
    const key = `internshipConsent_${internshipId}`;
    localStorage.setItem(key, JSON.stringify(record));

    // Future implementation: POST /api/legal/consents/internships
  },

  // ─── INSTRUCTOR CONSENT ───────────────────────────────────────────────────
  saveInstructorConsent(): void {
    if (typeof window === "undefined") return;
    const record = {
      policyVersion: LEGAL_VERSIONS.instructor,
      acceptedAt: new Date().toISOString(),
    };
    localStorage.setItem("instructorConsent", JSON.stringify(record));

    // Future implementation: POST /api/legal/consents/instructors
  },
};
