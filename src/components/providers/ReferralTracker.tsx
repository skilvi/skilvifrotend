'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function TrackerInner() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const refCode = searchParams?.get('ref');
    if (refCode) {
      localStorage.setItem('skilvi_affiliate_ref', refCode);
    }
  }, [searchParams]);

  return null;
}

export function ReferralTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerInner />
    </Suspense>
  );
}
