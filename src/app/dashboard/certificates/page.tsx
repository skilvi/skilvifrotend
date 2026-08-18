'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

interface CertificateRecord {
  certificateId: string;
  studentId: string;
  programName: string;
  programType: string;
  issueDate: string;
  verificationUrl: string;
}

export default function DashboardCertificates() {
  const { user, isHydrated, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [records, setRecords] = useState<CertificateRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<any>({});

  useEffect(() => {
    if (isHydrated && !user) {
      router.replace('/login');
    }
  }, [user, isHydrated, router]);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!user || authLoading) return;
      try {
        const res: any = await apiClient.get('/certificates/my-records');
        if (res?.success) {
          setRecords(res.records || []);
          setSummary(res.summary || {});
        } else {
          setError(res?.error || 'Unable to load certificate records at the moment. Please try again later.');
        }
      } catch (err) {
        console.error('Failed to fetch certificate records:', err);
        setError('Unable to load certificates at the moment.');
      } finally {
        setIsLoading(false);
      }
    };
    if (user && isHydrated && !authLoading) fetchRecords();
  }, [user, isHydrated, authLoading]);

  if (!isHydrated || isLoading || authLoading || !user) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center gap-4 pb-20">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-400">Loading your records…</p>
      </div>
    );
  }

  // Process records based on the ID prefix requirements
  const processedRecords = records.map(r => {
    const isSkilvi = r.certificateId.toLowerCase().startsWith('skl') || r.studentId.toLowerCase().startsWith('skl');
    return {
      ...r,
      programType: isSkilvi ? 'COURSE' : 'Internship/Workshop',
      isOrange: isSkilvi
    };
  });

  const courses = processedRecords.filter(r => r.isOrange);
  const internshipsWorkshops = processedRecords.filter(r => !r.isOrange);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 pb-24">
      {/* ── Page Header ── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-semibold text-blue-700 mb-3">
                Certificates & Records
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                My Certificates
              </h1>
              <p className="text-slate-500 font-medium mt-1.5 text-sm">
                View and manage your verified achievements across all programs.
              </p>
            </div>

            {/* Stats Summary */}
            <div className="flex gap-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{processedRecords.length}</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Total</p>
              </div>
              <div className="w-px bg-slate-200 self-stretch" />
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">{courses.length}</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Courses</p>
              </div>
              <div className="w-px bg-slate-200 self-stretch" />
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{internshipsWorkshops.length}</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Internships/Workshops</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl text-center max-w-3xl mx-auto font-medium">
            {error}
          </div>
        ) : processedRecords.length > 0 ? (
          <div className="space-y-12">
            <RecordSection title="Courses" records={courses} />
            <RecordSection title="Internships / Workshops" records={internshipsWorkshops} />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-20 text-center flex flex-col items-center gap-8 max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">No certificates found yet.</h3>
              <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                Complete any enrolled course to earn your first certificate. <a href="/programs" className="text-blue-600 hover:underline font-semibold">Browse Courses →</a>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function RecordSection({ title, records }: { title: string, records: any[] }) {
  if (records.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {records.map(record => {
          const isOrange = record.isOrange;
          
          const cardClasses = isOrange
            ? "bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-2xl p-6 shadow-[0_0_15px_rgba(251,146,60,0.3)] hover:shadow-[0_0_25px_rgba(251,146,60,0.5)] transition-shadow relative overflow-hidden group"
            : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group";
            
          const iconClasses = isOrange ? "text-orange-500" : "text-blue-600";
          const badgeClasses = isOrange ? "bg-orange-100 text-orange-700" : "bg-blue-50 text-blue-700";
          const buttonClasses = isOrange ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white";

          return (
            <div key={record.certificateId} className={cardClasses}>
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <svg className={`w-16 h-16 ${iconClasses}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.4-6.3-4.8-6.3 4.8 2.3-7.4-6-4.6h7.6z"/></svg>
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${badgeClasses}`}>
                    {record.programType}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {new Date(record.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 leading-tight mb-2 pr-4">{record.programName}</h3>
                <p className="text-xs font-medium text-slate-500 mb-2 font-mono bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded w-fit border border-slate-100 dark:border-slate-800/50">
                  ID: {record.certificateId}
                </p>
                <p className="text-[11px] font-medium text-slate-400 mb-6">
                  Issued by EmberQuest, verified by Skilvi
                </p>
                
                  <div className="flex flex-col w-full gap-2">
                    <a href={record.verificationUrl} target="_blank" rel="noopener noreferrer" className={`w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${buttonClasses}`}>
                      View Certificate
                    </a>
                    <p className="text-[10px] text-slate-400 text-center font-medium">Share this link with employers to verify your achievement.</p>
                  </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
