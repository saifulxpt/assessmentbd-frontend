'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions/auth.actions';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { useState } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-brand mt-4"
    >
      {pending ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      লগইন করুন
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, null);
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="py-10 px-4" style={{ background: '#f1f5f9', minHeight: '60vh' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .sd-card { background:#fff; border:1px solid #eef2f6; border-radius:16px; box-shadow:0 1px 2px rgba(15,23,42,.03),0 4px 16px -4px rgba(15,23,42,.07); }
        .sd-input { width:100%; padding:10px 14px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; font-weight:500; color:#0f172a; background:#fff; outline:none; transition:border-color .2s,box-shadow .2s; }
        .sd-input:focus { border-color:#0b57d0; box-shadow:0 0 0 3px rgba(11,87,208,.18); }
        .btn-brand { background:#0b57d0; color:#fff; font-weight:700; font-size:14px; padding:11px 20px; border-radius:10px; border:none; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:6px; transition:all .18s; width:100%; box-shadow:0 4px 14px rgba(11,87,208,.28); }
        .btn-brand:hover { background:#0948b3; transform:translateY(-1px); box-shadow:0 6px 20px rgba(11,87,208,.35); }
        .btn-brand:disabled { opacity:.6; cursor:not-allowed; transform:none; }
      `}} />

      <div className="max-w-md mx-auto">
        
        {state?.error && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-4 text-sm font-semibold" style={{ background:'#fff1f2', border:'1px solid #fecdd3', color:'#be123c' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {state.error}
          </div>
        )}

        <div className="sd-card px-6 py-7 sm:px-8 sm:py-8">
          {/* Header */}
          <div className="text-center mb-5">
              <h2 className="text-[22px] font-black text-slate-900 tracking-tight">লগইন করুন</h2>
          </div>

          <form action={formAction} className="space-y-3">
              
              {/* Mobile */}
              <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">মোবাইল নম্বর <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                      <div className="flex items-center px-3 rounded-[10px] border border-slate-200 bg-slate-50 text-[13px] font-bold text-slate-500 shrink-0">🇧🇩 +88</div>
                      <input type="tel" name="mobile" required
                             placeholder="01XXXXXXXXX"
                             className="sd-input" />
                  </div>
              </div>

              {/* Password */}
              <div className="relative">
                  <div className="flex justify-between items-end mb-1.5">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">পাসওয়ার্ড <span className="text-red-500">*</span></label>
                      <Link href="/forgot-password" className="text-[12px] font-bold text-blue-600 hover:underline">ভুলে গেছেন?</Link>
                  </div>
                  <div className="relative">
                      <input type={showPass ? 'text' : 'password'} name="password" required
                             placeholder="আপনার পাসওয়ার্ড দিন"
                             className="sd-input pr-10" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPass ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                          ) : (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          )}
                      </button>
                  </div>
              </div>

              <SubmitButton />
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-[13px] font-semibold text-slate-600">
                  নতুন একাউন্ট করতে চান? 
                  <Link href="/register" className="text-blue-600 font-bold hover:underline ml-1">রেজিস্টার করুন</Link>
              </p>
          </div>
        </div>
      </div>
    </div>
  );
}
