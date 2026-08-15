'use client';

import React, { useEffect, useState } from 'react';
import { useInstructorStore } from '@/store/useInstructorStore';
import { couponApi } from '@/lib/api/payment';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function CourseCouponsPage({ params }: { params: { id: string } }) {
  const { currentCourse, fetchCourseForEdit } = useInstructorStore();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newCode, setNewCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(10);
  const [maxUses, setMaxUses] = useState(0);
  const [expiresAt, setExpiresAt] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchCourseForEdit(params.id);
    loadCoupons();
  }, [params.id]);

  const loadCoupons = async () => {
    try {
      const data = await couponApi.getCourseCoupons(params.id);
      setCoupons(data);
    } catch (err) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode) return;
    setIsCreating(true);
    try {
      await couponApi.createCoupon(params.id, {
        code: newCode,
        discountPercent,
        maxUses,
        expiresAt: expiresAt ? expiresAt : null
      });
      toast.success('Coupon created successfully!');
      setNewCode('');
      setDiscountPercent(10);
      setMaxUses(0);
      setExpiresAt('');
      loadCoupons();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggle = async (couponId: string) => {
    try {
      await import('@/lib/api/client').then(m => m.default.post(`/coupons/${couponId}/toggle`));
      toast.success('Coupon status updated');
      loadCoupons();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await import('@/lib/api/client').then(m => m.default.post(`/coupons/${couponId}/delete`));
      toast.success('Coupon deleted');
      loadCoupons();
    } catch (err) {
      toast.error('Failed to delete coupon');
    }
  };

  if (!currentCourse) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/instructor/courses/${params.id}/edit`} className="w-8 h-8 flex items-center justify-center bg-white border rounded-full text-slate-500 hover:text-slate-900 transition">
          &larr;
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Coupons</h1>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8">
        <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Create New Coupon</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Coupon Code</label>
            <input type="text" required value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())} className="w-full border rounded-lg p-2 uppercase" placeholder="e.g. SUMMER50" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Discount %</label>
            <input type="number" required min="1" max="100" value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value))} className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Max Uses (0 = unlimited)</label>
            <input type="number" required min="0" value={maxUses} onChange={e => setMaxUses(Number(e.target.value))} className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Expiration Date (optional)</label>
            <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className="w-full border rounded-lg p-2" />
          </div>
          <div className="md:col-span-2 mt-2">
            <button disabled={isCreating} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50">
              {isCreating ? 'Creating...' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Active Coupons</h2>
        {loading ? (
          <p>Loading...</p>
        ) : coupons.length === 0 ? (
          <p className="text-slate-500">No coupons created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">Uses</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {coupons.map(c => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-bold">{c.code}</td>
                    <td className="px-4 py-3 text-emerald-600 font-semibold">{c.discountPercent}% OFF</td>
                    <td className="px-4 py-3">{c.currentUses} / {c.maxUses === 0 ? '∞' : c.maxUses}</td>
                    <td className="px-4 py-3">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleToggle(c.id)} className="text-xs font-bold text-blue-600 hover:text-blue-800 mr-3">
                        {c.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="text-xs font-bold text-red-600 hover:text-red-800">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
