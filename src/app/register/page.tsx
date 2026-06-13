'use client';

import { useActionState, useState } from 'react';
import { registerAction } from '@/app/actions/auth.actions';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-brand w-full mt-1 !py-3 !text-[15px] !font-black relative"
      style={{ background: '#0b57d0', boxShadow: '0 4px 14px rgba(11,87,208,.3)' }}
    >
      {!pending ? (
        <span>অ্যাকাউন্ট তৈরি করুন →</span>
      ) : (
        <span className="flex items-center gap-2 justify-center">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3" />
            <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </svg>
          তৈরি হচ্ছে...
        </span>
      )}
    </button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerAction, null);
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [openReferral, setOpenReferral] = useState(false);

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
          <div className="text-center mb-5">
              <h2 className="text-[22px] font-black text-slate-900 tracking-tight">ফ্রি অ্যাকাউন্ট খুলুন</h2>
          </div>

          <form action={formAction} className="space-y-3">
              <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">পূর্ণ নাম <span className="text-red-500">*</span></label>
                  <input type="text" name="name" required
                         placeholder="যেমন: Mohammad Rahul"
                         autoComplete="name"
                         className="sd-input w-full" />
              </div>

              <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">মোবাইল নম্বর <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                      <div className="flex items-center px-3 rounded-[10px] border border-slate-200 bg-slate-50 text-[13px] font-bold text-slate-500 shrink-0">🇧🇩 +88</div>
                      <input type="tel" name="mobile" required
                             placeholder="01XXXXXXXXX"
                             inputMode="numeric" maxLength={11} autoComplete="tel"
                             className="sd-input flex-1" />
                  </div>
              </div>

              {/* Email (optional) */}
              <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Email <span className="text-slate-300 font-medium normal-case">(optional)</span></label>
                  <input type="email" name="email"
                         placeholder="example@gmail.com"
                         autoComplete="email"
                         className="sd-input w-full" />
              </div>

              {/* Password */}
              <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">পাসওয়ার্ড <span className="text-red-500">*</span></label>
                  <div className="relative">
                      <input type={showPass ? 'text' : 'password'} name="password" required
                             placeholder="কমপক্ষে ৬ অক্ষর" autoComplete="new-password"
                             className="sd-input w-full !pr-10" />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                          {showPass ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          )}
                      </button>
                  </div>
              </div>

              {/* Confirm Password */}
              <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">পাসওয়ার্ড নিশ্চিত <span className="text-red-500">*</span></label>
                  <div className="relative">
                      <input type={showPass2 ? 'text' : 'password'} name="password_confirmation" required
                             placeholder="পাসওয়ার্ড আবার দিন" autoComplete="new-password"
                             className="sd-input w-full !pr-10" />
                      <button type="button" onClick={() => setShowPass2(!showPass2)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                          {showPass2 ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          )}
                      </button>
                  </div>
              </div>

              {/* Referral Code */}
              <div>
                  <button type="button" onClick={() => setOpenReferral(!openReferral)}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors">
                      {openReferral ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      )}
                      Referral Code আছে?
                  </button>
                  {openReferral && (
                      <div className="mt-2">
                          <input type="text" name="refer_code"
                                 placeholder="বন্ধুর Code দিন (optional)"
                                 maxLength={10} autoComplete="off"
                                 className="sd-input w-full text-xs uppercase tracking-widest" />
                      </div>
                  )}
              </div>

              <SubmitButton />
          </form>

          <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-100"></div>
              <span className="text-[11px] font-semibold text-slate-300">অথবা</span>
              <div className="flex-1 h-px bg-slate-100"></div>
          </div>

          <p className="text-center text-[13px] font-medium text-slate-500">
              আগে অ্যাকাউন্ট করেছেন?
              <Link href="/login" className="font-black hover:underline ml-1" style={{ color: '#0b57d0' }}>লগইন করুন</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
