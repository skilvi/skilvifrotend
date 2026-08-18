'use client';

import React, { useState, useEffect } from 'react';
import { paymentApi, couponApi } from '@/lib/api/payment';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Script from 'next/script';

declare global {
  interface Window { Razorpay: any; }
}

interface EnrollButtonProps {
  courseId: string;
  price: number;
  courseTitle?: string;
  partialAmount?: number;
}

export function EnrollButton({ courseId, price, courseTitle, partialAmount = 499 }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  // OPTIMISTIC: Start as false — render the button immediately, check enrollment silently in background.
  // This eliminates the skeleton delay entirely. The button upgrades to "Go to Course" once we confirm.
  const [checkingStatus, setCheckingStatus] = useState(false);
  
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  const [referralDiscountPercent, setReferralDiscountPercent] = useState(0);

  const [referralCode, setReferralCode] = useState('');
  const [referralValid, setReferralValid] = useState<boolean | null>(null);
  const [referralName, setReferralName] = useState('');
  const [showReferral, setShowReferral] = useState(false);

  // Sync with URL params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('ref');
      
      // Attempt to read from the middleware cookie first (most reliable), then fallback to localStorage
      const getCookie = (name: string) => document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))?.pop() || null;
      const cookieCode = getCookie('skilvi_affiliate_ref');
      const storedCode = localStorage.getItem('skilvi_affiliate_ref');
      
      const activeCode = urlCode || cookieCode || storedCode;

      if (activeCode) {
        setReferralCode(activeCode);
        setShowReferral(true);
        // Keep localStorage as a fallback backup mechanism
        if (activeCode) localStorage.setItem('skilvi_affiliate_ref', activeCode);
        
        // Signal validation
        sessionStorage.setItem('pending_validation', 'true');
      }
    }
  }, []);
  const [paymentMode, setPaymentMode] = useState<'FULL' | 'PARTIAL'>('FULL');

  const router = useRouter();
  const searchParams = useSearchParams();
  const isUpgrade = searchParams?.get('upgrade') === 'true';
  const activeOrderType = isUpgrade ? 'UPGRADE' : paymentMode;

  let finalPrice = price;
  if (activeOrderType === 'FULL') {
    const maxDiscount = Math.max(discountPercent, referralDiscountPercent);
    if (maxDiscount > 0) {
      finalPrice = finalPrice * (1 - maxDiscount / 100);
    }
  } else if (activeOrderType === 'PARTIAL') {
    finalPrice = Math.min(price, partialAmount);
  }
  
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await couponApi.validateCoupon(couponCode, courseId);
      setDiscountPercent(res.discountPercent);
      toast.success(`Coupon applied! ${res.discountPercent}% off.`);
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
      setDiscountPercent(0);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleValidateReferral = async () => {
    if (!referralCode.trim()) return;
    try {
      const code = encodeURIComponent(referralCode.trim().toUpperCase());
      // First try the new global referral system
      let res = await fetch(`/api/v1/referrals/validate/${code}`);
      let data = await res.json();
      
      if (data.valid) {
        setReferralValid(true);
        if (data.discountPercent > 0) {
          setReferralDiscountPercent(Number(data.discountPercent));
          setReferralName(`(${data.discountPercent}% Off)`);
        } else {
          setReferralDiscountPercent(0);
          setReferralName('');
        }
        toast.success('Code accepted!');
        return;
      }

      // Fallback to affiliate system
      res = await fetch(`/api/v1/affiliates/validate/${code}`);
      data = await res.json();
      
      if (data.valid) {
        setReferralValid(true);
        if (data.discountRate > 0) {
          setReferralDiscountPercent(Number(data.discountRate));
          setReferralName(`${data.displayName || ''} (${data.discountRate}% Off)`);
        } else {
          setReferralDiscountPercent(0);
          setReferralName(data.displayName || '');
        }
        toast.success('Code accepted!');
      } else {
        setReferralValid(false);
        setReferralDiscountPercent(0);
      }
    } catch {
      setReferralValid(false);
      setReferralDiscountPercent(0);
    }
  };

  // Auto-validate on load if a code was set
  useEffect(() => {
    if (referralCode && referralValid === null && sessionStorage.getItem('pending_validation')) {
      handleValidateReferral();
      sessionStorage.removeItem('pending_validation');
    }
  }, [referralCode, referralValid]);

  useEffect(() => {
    // Only check enrollment if the user is logged in — guests see the button instantly with no API call.
    if (!isHydrated || !isAuthenticated) return;

    // Silent background check — button is already visible as "Enroll Now".
    // If they are enrolled, it will upgrade to "Go to Course" without any loading skeleton.
    const checkStatus = async () => {
      try {
        const { dashboardApi } = await import('@/lib/api/dashboard');
        const enrollments = await dashboardApi.getDashboardEnrollments();
        const enrolled = enrollments.some((e: any) => e.courseId === courseId);
        setIsEnrolled(enrolled);
      } catch (err) {
        // Silently fail — button stays as "Enroll Now" which is safe
        console.error('Failed to check enrollment status', err);
      }
    };

    checkStatus();
  }, [isHydrated, isAuthenticated, courseId]);

  const redirectToCourse = (success = false) => {
    if (success) {
      // Instantly push to the actual learning dashboard instead of reloading the marketing page
      router.push(`/learn/${courseId}?enrolled=1`);
    } else {
      router.push(`/courses/${courseId}`);
      router.refresh();
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
      return;
    }

    const toastId = toast.loading('Initializing checkout...');
    setLoading(true);

    try {
      const orderResponse: any = await paymentApi.createOrder(
         courseId, 
         (discountPercent > 0 && activeOrderType === 'FULL') ? couponCode : undefined, 
         referralValid ? referralCode.toUpperCase().trim() : undefined,
         activeOrderType
      );
      const order = orderResponse?.data || orderResponse;

      if (order.isFree) {
        toast.success(order.message || 'Successfully enrolled in free course!', { id: toastId });
        setIsEnrolled(true);
        redirectToCourse(true);
        return;
      }
      
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY!;

      if (!window.Razorpay) {
        toast.error('Payment gateway SDK missing. Please refresh.', { id: toastId });
        setLoading(false);
        return;
      }

      if (!order.orderId) {
        toast.error('Failed to generate order.', { id: toastId });
        setLoading(false);
        return;
      }

      const options = {
        key: razorpayKey,
        amount: order.amount * 100, 
        currency: order.currency || 'INR',
        name: 'Skilvi',
        description: courseTitle || 'Course Enrollment',
        order_id: order.orderId,
        handler: async (response: any) => {
          const vId = toast.loading('Verifying payment...');
          try {
            await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId,
              couponCode: (discountPercent > 0 && activeOrderType === 'FULL') ? couponCode : undefined,
              referralCode: referralValid ? referralCode.toUpperCase().trim() : undefined,
              pricePaid: (order.amount || 0),
              orderType: activeOrderType
            });
            toast.success('Payment Verified!', { id: vId });
            setIsEnrolled(true);
            redirectToCourse(true);
          } catch (err) {
            // Fallback: If network failed or 403 happened, check if the webhook already enrolled them or if they were already enrolled
            try {
              const { dashboardApi } = await import('@/lib/api/dashboard');
              const enrollments = await dashboardApi.getDashboardEnrollments();
              if (enrollments.some((e: any) => e.courseId === courseId)) {
                toast.success('Payment Verified!', { id: vId });
                setIsEnrolled(true);
                redirectToCourse(true);
                return;
              }
            } catch (fallbackErr) {
              // Ignore fallback error
            }
            toast.error('Failed to verify payment.', { id: vId });
          } finally {
            setLoading(false);
          }
        },
        retry: { enabled: true, max_count: 3 },
        prefill: {
          name: user?.displayName || (user as any)?.firstName || 'Student',
          email: user?.email || 'student@emberquest.com',
          contact: (user as any)?.phone || '+919876543210',
        },
        theme: { color: '#2563eb' }, // EmberQuest Blue
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.dismiss(toastId);
            toast('Checkout cancelled', { icon: 'ℹ️' });
          }
        }
      };

      toast.dismiss(toastId);
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', (err: any) => {
        setLoading(false);
        toast.error(`Payment failed`);
      });

      rzp.open();
    } catch (err: any) {
      toast.dismiss(toastId);
      setLoading(false);
      
      const errMsg = err?.response?.data?.message || err?.message || '';
      if (err?.response?.status === 400 && errMsg.includes('already enrolled')) {
        toast.success('Already enrolled.');
        setIsEnrolled(true);
        redirectToCourse(false);
      } else {
        toast.error('Checkout failed. Try again.');
      }
    }
  };

  // No skeleton gate — button renders immediately. Enrollment state updates silently in background.

  if (isEnrolled) {
    return (
      <button
        onClick={() => router.push(`/learn/${courseId}`)}
        className="w-full py-3.5 rounded-[14px] font-semibold text-white text-base bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
        Go to Course
      </button>
    );
  }

  return (
    <>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      
      {price > 0 && !isEnrolled && !isUpgrade && (
        <div className="mb-4 space-y-3">
          {/* Payment Mode Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner border border-slate-200 dark:border-slate-700">
             <button onClick={() => setPaymentMode('FULL')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${paymentMode === 'FULL' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-slate-50' : 'text-slate-500 hover:text-slate-700'}`}>Full Payment</button>
             <button onClick={() => setPaymentMode('PARTIAL')} title={`Pay ₹${partialAmount} now to lock in your spot. Pay remaining to unlock all content`} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${paymentMode === 'PARTIAL' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-slate-50' : 'text-slate-500 hover:text-slate-700'}`}>Partial (₹{partialAmount})</button>
          </div>

          {/* Coupon Code (Only for Full) */}
          {paymentMode === 'FULL' && (
            <>
              <div className="flex gap-2 mb-1">
                <input
                  type="text"
                  placeholder="Have a coupon?"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={discountPercent > 0 || isApplyingCoupon}
                  className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 disabled:opacity-50"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || discountPercent > 0 || isApplyingCoupon}
                  className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-semibold rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition disabled:opacity-50"
                >
                  {isApplyingCoupon ? '...' : discountPercent > 0 ? 'Applied ✓' : 'Apply'}
                </button>
              </div>
              {couponError && <p className="text-xs text-red-500 font-medium ml-1">{couponError}</p>}
            </>
          )}

          {/* Referral Code (collapsible) */}
          <button
            onClick={() => setShowReferral(r => !r)}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 transition-colors"
          >
            <span>{showReferral ? '▲' : '▼'}</span> Have a partner or referral code?
          </button>
          {showReferral && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="REF-XXXX-XXXX"
                value={referralCode}
                onChange={(e) => { setReferralCode(e.target.value.toUpperCase()); setReferralValid(null); setReferralDiscountPercent(0); }}
                disabled={referralValid === true}
                className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 disabled:opacity-50"
              />
              <button
                onClick={handleValidateReferral}
                disabled={!referralCode.trim() || referralValid === true}
                className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 font-semibold rounded-lg text-sm hover:bg-emerald-100 transition disabled:opacity-50"
              >
                {referralValid === true ? '✓' : 'Check'}
              </button>
            </div>
          )}
          {referralValid === true && <p className="text-xs text-emerald-600 font-medium ml-1">Code applied{referralName ? ` — ${referralName}` : ''}!</p>}
          {referralValid === false && <p className="text-xs text-red-500 font-medium ml-1">Code not found or inactive.</p>}
        </div>
      )}

      {isUpgrade && (
         <div className="mb-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-sm font-medium text-center">
            You are upgrading your partial enrollment to gain full access to all lectures.
         </div>
      )}

      <button
        onClick={handleEnroll}
        disabled={loading}
        className={`w-full py-3.5 rounded-[14px] font-semibold text-white text-base transition-all shadow-sm flex items-center justify-center gap-2 ${
          loading ? 'bg-slate-400 cursor-not-allowed' : 'btn-ember'
        }`}
      >
        {loading ? 'Processing...' : isUpgrade ? 'Pay Remaining Balance' : finalPrice > 0 ? `Enroll Now — ₹${finalPrice.toLocaleString()}` : 'Enroll for Free'}
      </button>

      <div className="flex items-center justify-center gap-2 mt-3 opacity-60">
         <img src="/razorpay.png" alt="Secured by Razorpay" className="h-5 object-contain" />
      </div>
    </>
  );
}
