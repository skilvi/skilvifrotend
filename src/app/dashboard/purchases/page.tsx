'use client';

import React, { useEffect, useState } from 'react';
import { purchasesApi, Purchase } from '@/lib/api/purchases';
import { useAuthStore } from '@/store/authStore';
import { BillingPdfGenerator } from '@/lib/utils/BillingPdfGenerator';
import { BILLING_CONFIG } from '@/lib/config/billingConfig';
import { ArrowDownToLine, Receipt, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function PurchasesPage() {
  const { user } = useAuthStore();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingPdfFor, setGeneratingPdfFor] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPurchases() {
      try {
        const data = await purchasesApi.getMyPurchases();
        setPurchases(data);
      } catch (err) {
        console.error('Failed to load purchases:', err);
        setError("We couldn't load your purchase history.");
      } finally {
        setLoading(false);
      }
    }
    fetchPurchases();
  }, []);

  const handleDownloadBill = async (purchase: Purchase) => {
    if (!user) return;
    setGeneratingPdfFor(purchase.orderId);
    
    try {
      // Provide user's current name and email as bill receiver
      const customerName = user.displayName || 'Learner';
      const customerEmail = user.email || '';
      
      // We simulate a tiny delay to show loading state if it is too fast
      await new Promise(r => setTimeout(r, 400));
      BillingPdfGenerator.generateBill(purchase, customerName, customerEmail);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Unable to generate the bill. Please try again.');
    } finally {
      setGeneratingPdfFor(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${BILLING_CONFIG.currencySymbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse flex flex-col gap-6">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
          <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded-md mb-4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Receipt className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Error Loading Purchases</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Purchase History</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          View your Skilvi orders, payments, and billing details.
        </p>
      </div>

      {purchases.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
          <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No purchases yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Your completed purchases will appear here.</p>
          <Link href="/courses" className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
            Explore Courses
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {purchases.map(purchase => (
            <div key={purchase.orderId} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Left side: Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">
                      {purchase.courseTitle}
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Paid
                    </span>
                  </div>
                  
                  <div className="text-sm text-slate-500 dark:text-slate-400 grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 mt-3">
                    <p><span className="font-medium text-slate-600 dark:text-slate-300">Order ID:</span> {purchase.orderId}</p>
                    <p><span className="font-medium text-slate-600 dark:text-slate-300">Purchased:</span> {new Date(purchase.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <p><span className="font-medium text-slate-600 dark:text-slate-300">Method:</span> {purchase.paymentMethod}</p>
                  </div>
                </div>

                {/* Right side: Actions & Amount */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(purchase.amount)}
                  </div>
                  
                  <div className="flex gap-2">
                    {purchase.amount > 0 && (
                      <button
                        onClick={() => handleDownloadBill(purchase)}
                        disabled={generatingPdfFor === purchase.orderId}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {generatingPdfFor === purchase.orderId ? (
                          <>
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <ArrowDownToLine className="w-4 h-4" />
                            Download Bill
                          </>
                        )}
                      </button>
                    )}
                    <Link
                      href={`/courses/${purchase.courseId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      View Course
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
