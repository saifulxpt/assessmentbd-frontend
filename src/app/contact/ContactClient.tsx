'use client';

import { useActionState } from 'react';
import { submitContactMessage } from '@/app/actions/contact.actions';

export default function ContactClient({
  siteEmail,
  sitePhone
}: {
  siteEmail: string;
  sitePhone: string;
}) {
  const [state, formAction, isPending] = useActionState(submitContactMessage, null);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Dark gradient header */}
      <div 
        style={{ background: 'linear-gradient(135deg,#0f172a 0%,#0948b3 60%,#0f172a 100%)' }} 
        className="py-10 md:py-14 relative overflow-hidden"
      >
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%)' }}
        />
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <span 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4 border" 
            style={{ background: 'rgba(59,130,246,.15)', color: '#93c5fd', borderColor: 'rgba(59,130,246,.3)' }}
          >
            যোগাযোগ করুন
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
            আমাদের সাথে <span style={{ color: '#60a5fa' }}>কথা বলুন</span>
          </h1>
          <p className="text-base font-medium text-slate-400">
            আপনার যেকোনো প্রশ্ন বা প্রয়োজনে — নিচের ফর্ম টা পূরণ করুন।
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Info Side */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">যোগাযোগের মাধ্যম</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">ইমেইল করুন</h3>
                  <p className="text-slate-500 font-medium mt-1">{siteEmail}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">হটলাইন</h3>
                  <p className="text-slate-500 font-medium mt-1">{sitePhone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-6">মেসেজ দিন</h2>

            {state?.success && (
              <div className="mb-5 flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm font-semibold">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {state.success}
              </div>
            )}
            {state?.error && (
              <div className="mb-5 flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3 text-sm font-semibold">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {state.error}
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  আপনার নাম <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="name" 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                  placeholder="নাম লিখুন"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  ফোন নম্বর <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span>
                </label>
                <input 
                  type="text" 
                  name="phone"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  মেসেজ <span className="text-rose-500">*</span>
                </label>
                <textarea 
                  name="message" 
                  rows={4} 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition resize-none"
                  placeholder="কিভাবে সাহায্য করতে পারি?"
                />
              </div>
              <button 
                type="submit" 
                disabled={isPending}
                className="w-full py-4 rounded-xl text-white font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg transition transform active:scale-95 disabled:opacity-50"
              >
                {isPending ? 'মেসেজ পাঠানো হচ্ছে...' : 'মেসেজ পাঠান →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
