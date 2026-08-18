'use client';

import React, { useState, useEffect } from 'react';
import { Gift, Copy, Check, X, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';

export const AffiliateWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [referralData, setReferralData] = useState<{code: string, url: string} | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [inIframe, setInIframe] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInIframe(window.self !== window.top);
    }
  }, []);

  // Auto-fill if user is logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setEmail(user.email || '');
      setDisplayName(user.displayName || (user as any).firstName || '');
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_API_URL || 'https://member.emberquest.in/api/public/auto-enroll';
      const PORTAL_KEY = process.env.NEXT_PUBLIC_PORTAL_API_KEY || 'super_secret_portal_key_12345';
      
      const res = await fetch(PORTAL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-portal-api-key': PORTAL_KEY
        },
        body: JSON.stringify({
          email,
          displayName,
          baseUrl: process.env.NEXT_PUBLIC_APP_URL || (window.location.hostname === 'localhost' ? 'https://skilvi.emberquest.in' : window.location.origin)
        })
      });

      const data = await res.json();

      if (data.success) {
        setReferralData({ code: data.affiliateCode, url: data.referralUrl });
        toast.success('Affiliate link generated!');
      } else {
        setError(data.message || 'Failed to generate link.');
      }
    } catch (err) {
      setError('Network error. Ensure the Affiliate Portal Backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (referralData?.url) {
      navigator.clipboard.writeText(referralData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied to clipboard!');
    }
  };

  if (!isHydrated) return null;
  if (inIframe || !isAuthenticated) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 text-white/70 hover:text-white"
            >
              <X size={18} />
            </button>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Gift size={20} /> Partner Program
            </h3>
            <p className="text-sm text-purple-100">Earn rewards by referring friends!</p>
          </div>

          <div className="p-5 bg-slate-900 text-white">
            {referralData ? (
              <div className="space-y-4">
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Your Code</p>
                  <p className="text-2xl font-black text-purple-400 tracking-wider">{referralData.code}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Your Referral Link</label>
                  <div className="flex gap-2">
                    <input 
                      value={referralData.url} 
                      readOnly 
                      className="flex-1 px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs focus:outline-none"
                    />
                    <button 
                      onClick={copyToClipboard} 
                      className="px-3 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-colors"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-green-400 text-center font-medium mt-2">
                  Link generated! Share it to start earning.
                </p>
                <div className="text-center mt-3 pt-3 border-t border-slate-700/50">
                  <a href="https://member.emberquest.in" target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:text-purple-300 font-medium hover:underline inline-flex items-center gap-1">
                    Go to Partner Dashboard <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2 text-left">
                  <label htmlFor="displayName" className="text-sm font-medium text-slate-300">Your Name</label>
                  <input 
                    id="displayName" 
                    placeholder="John Doe" 
                    required 
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label htmlFor="email" className="text-sm font-medium text-slate-300">Email Address</label>
                  <input 
                    id="email" 
                    type="email" 
                    placeholder="john@example.com" 
                    required 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                
                {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-2 px-4 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium shadow-lg shadow-purple-900/50 flex items-center justify-center transition-all disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                  Get My Affiliate Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-5 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.7)]"
      >
        <Gift size={20} className={isOpen ? "" : "animate-bounce"} />
        {isOpen ? 'Close' : 'Earn Rewards!'}
      </button>
    </div>
  );
};
