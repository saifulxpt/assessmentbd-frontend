'use client';

import { useEffect, useState, useCallback } from 'react';
import { getExamHistory } from '@/app/actions/results.actions';
import Link from 'next/link';

export default function ExamHistoryPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async (q: string, p: number) => {
    setLoading(true);
    try {
      const result = await getExamHistory(q || undefined, p);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load('', 1); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load(search, 1);
  };

  const handleClear = () => {
    setSearch('');
    setPage(1);
    load('', 1);
  };

  function scoreColor(pct: number) {
    if (pct >= 80) return '#16a34a';
    if (pct >= 50) return '#0b57d0';
    return '#dc2626';
  }

  return (
    <div className="px-0 py-0 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-black text-slate-900">Exam History</h1>
          <p className="text-[12px] text-slate-500 font-medium mt-0.5">আপনার সব পরীক্ষার ফলাফল</p>
        </div>
        {data && (
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
            {data.total} টি পরীক্ষা
          </span>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="পরীক্ষা বা কোর্সের নাম খুঁজুন..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit"
          className="px-4 py-2.5 rounded-xl text-sm font-bold text-white shrink-0"
          style={{ background: '#0b57d0' }}>
          খুঁজুন
        </button>
        {search && (
          <button type="button" onClick={handleClear}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition shrink-0">
            Clear
          </button>
        )}
      </form>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-200 shrink-0"/>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4"/>
                <div className="h-3 bg-slate-200 rounded w-1/2"/>
              </div>
            </div>
          ))}
        </div>
      ) : data?.attempts?.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <p className="text-[14px] font-bold text-slate-700 mb-1">কোনো পরীক্ষার ইতিহাস নেই</p>
          <p className="text-[12px] text-slate-400 font-medium">আপনি এখনো কোনো পরীক্ষা সম্পন্ন করেননি।</p>
          <Link href="/user/my-courses" className="inline-flex items-center gap-1.5 mt-4 text-[12px] font-bold text-blue-600 hover:underline">
            আমার কোর্স দেখুন →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.attempts.map((attempt: any) => {
            const pct = Math.round(Number(attempt.percentage));
            return (
              <div key={attempt.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-start gap-4">
                {/* Score circle */}
                <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 font-black text-white text-[15px] leading-tight"
                     style={{ background: scoreColor(pct) }}>
                  {pct}<span className="text-[9px] font-semibold">%</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-900 truncate">{attempt.exams?.title ?? 'N/A'}</p>
                  <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{attempt.exams?.courses?.title ?? ''}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                    <span className="text-[11px] font-semibold text-slate-600">
                      স্কোর: {Number(attempt.score)} / {attempt.total_marks}
                    </span>
                    {attempt.tab_switches > 0 && (
                      <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                        {attempt.tab_switches} tab switch
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-medium">
                      {attempt.completed_at ? new Date(attempt.completed_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                    </span>
                  </div>
                </div>
                <Link href={`/user/exam-history/${attempt.id}`}
                  className="shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 transition">
                  দেখুন
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => { const p = page - 1; setPage(p); load(search, p); }}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition">
            ← আগের
          </button>
          <span className="text-sm font-medium text-slate-500">{page} / {data.totalPages}</span>
          <button
            onClick={() => { const p = page + 1; setPage(p); load(search, p); }}
            disabled={page === data.totalPages}
            className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition">
            পরের →
          </button>
        </div>
      )}
    </div>
  );
}
