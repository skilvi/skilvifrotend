import React from 'react';
import { X, Lock, CheckCircle, CreditCard } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
  pricing?: {
    price: number;
    discountedPrice: number | null;
    partialAmount: number | null;
    pricePaid: number;
  };
}

export function UpgradeModal({ isOpen, onClose, onConfirm, isProcessing, pricing }: UpgradeModalProps) {
  if (!isOpen) return null;

  const originalPrice = pricing?.price || 0;
  const discountedPrice = pricing?.discountedPrice || null;
  const displayPrice = discountedPrice || originalPrice;
  const pricePaid = pricing?.pricePaid || 0;
  const remainingBalance = Math.max(0, displayPrice - pricePaid);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        <div className="relative p-6 flex flex-col items-center bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:shadow-md transition-all"
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
             <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 text-center mb-2 tracking-tight">Unlock Full Access</h2>
          <p className="text-slate-500 text-center text-sm font-medium">
             You've reached the end of your partial enrollment. Pay the remaining balance to unlock the rest of the course instantly.
          </p>
        </div>

        <div className="p-6 pt-2">
           <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 space-y-3 mb-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Price Summary</h3>
              
              <div className="flex justify-between items-center text-sm font-medium text-slate-600 dark:text-slate-400">
                 <span>Full Course Value</span>
                 <span>₹{displayPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
                 <span>Already Paid (Partial)</span>
                 <span>- ₹{pricePaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="w-full h-px bg-slate-200 dark:bg-slate-700 my-2"></div>
              
              <div className="flex justify-between items-center text-lg font-black text-slate-900 dark:text-slate-50">
                 <span>Total Due</span>
                 <span>₹{remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
           </div>
           
           <ul className="space-y-3 mb-8">
             <li className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" /> Lifetime access to all modules
             </li>
             <li className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" /> Verified Certificate of Completion
             </li>
           </ul>

           <button 
             onClick={onConfirm}
             disabled={isProcessing}
             className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
           >
             {isProcessing ? (
               <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
             ) : (
               <>
                 <CreditCard className="w-5 h-5" />
                 Pay ₹{remainingBalance.toLocaleString('en-IN')} Now
               </>
             )}
           </button>
        </div>
      </div>
    </div>
  );
}
