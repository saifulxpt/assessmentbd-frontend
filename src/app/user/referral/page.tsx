'use client';

import { useEffect, useState, useRef } from 'react';
import { getReferralData } from '@/app/actions/user-dashboard.actions';

export default function ReferralPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    getReferralData().then(d => { setData(d); setLoading(false); });
  }, []);

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function copyLink(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }

  function shareCode(code: string) {
    const url = `${window.location.origin}/register?ref=${code}`;
    if (navigator.share) {
      navigator.share({
        title: 'AssessmentBD — NSDA Assessment Prep',
        text: `AssessmentBD-তে NSDA পরীক্ষার প্রস্তুতি নিন! আমার ইনভাইটেশন কোড ${code} ব্যবহার করে সাইন আপ করুন।`,
        url,
      });
    } else {
      copyLink(url);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 h-48"/>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 h-64"/>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 h-64"/>
        </div>
      </div>
    );
  }

  const { user, referrals, totalEarned, pendingCount, settings } = data;

  if (!settings.enabled) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 flex items-center justify-center mb-5 border border-slate-100">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Referral Program এখন বন্ধ আছে</h2>
          <p className="text-sm font-medium text-slate-500">খুব শীঘ্রই আবার চালু হবে। দয়া করে পরে আবার চেক করুন।</p>
        </div>
      </div>
    );
  }

  const referralUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://assessmentbd.com'}/register?ref=${user?.referral_code}`;

  return (
    <div className="space-y-6">

      {/* ── Hero & Code Card ── */}
      <div className="bg-white rounded-2xl p-5 md:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 md:gap-8">

          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider mb-4 border border-blue-100">
              🎁 Refer &amp; Earn
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-4">
              বন্ধুদের Invite করুন, আর আয় করুন আনলিমিটেড!
            </h1>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {settings.reward_amount > 0 && (
                <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  <span className="text-[13px] font-bold text-emerald-700">আপনি পাবেন ৳{Math.round(settings.reward_amount).toLocaleString()}</span>
                </div>
              )}
              {settings.discount_value > 0 && (
                <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-xl border border-purple-100">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                  <span className="text-[13px] font-bold text-purple-700">
                    আপনার বন্ধু পাবে {settings.discount_type === 'percent' ? `${Math.round(settings.discount_value)}%` : `৳${Math.round(settings.discount_value).toLocaleString()}`} Discount
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Code Card */}
          <div className="w-full md:w-80 shrink-0">
            <div className="bg-slate-50 rounded-2xl p-4 md:p-5 border border-slate-200/60 shadow-sm text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">আপনার INVITATION CODE</p>

              <div
                onClick={() => copyCode(user?.referral_code)}
                className="bg-white rounded-xl px-4 py-3 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors border border-slate-200 mb-3">
                <span className="text-2xl font-black tracking-[0.2em] text-slate-900">{user?.referral_code}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => copyCode(user?.referral_code)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border font-bold text-sm transition-colors ${copied ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                  {copied ? (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg> Copied</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg> Copy</>
                  )}
                </button>
                <button
                  onClick={() => shareCode(user?.referral_code)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-sm transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                  Share
                </button>
              </div>

              <button
                onClick={() => copyLink(referralUrl)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-blue-600 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                {linkCopied ? 'Link Copied!' : 'Copy Direct Link'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 pt-5 md:pt-6 mt-6">
          <div className="text-center px-2">
            <p className="text-xl md:text-2xl font-bold text-slate-800">{referrals.length}</p>
            <p className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">মোট Invite</p>
          </div>
          <div className="text-center px-2">
            <p className="text-xl md:text-2xl font-bold text-emerald-600">৳{Math.round(totalEarned).toLocaleString()}</p>
            <p className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">মোট আয়</p>
          </div>
          <div className="text-center px-2">
            <p className="text-xl md:text-2xl font-bold text-amber-500">{pendingCount}</p>
            <p className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">Pending আছে</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── How It Works ── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 self-start">
          <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-6">যেভাবে কাজ করে</h3>
          <div className="space-y-6">
            {[
              { num: '১', bg: 'bg-blue-50 text-blue-600', title: 'Code শেয়ার করুন', desc: 'আপনার Invite Link বা Code-টি বন্ধুদের সাথে শেয়ার করুন।' },
              { num: '২', bg: 'bg-purple-50 text-purple-600', title: 'বন্ধু Register করলে',
                desc: settings.discount_value > 0
                  ? `আপনার বন্ধু আপনার Code ব্যবহার করে Sign Up করলে প্রথম Subscription-এ ${settings.discount_type === 'percent' ? `${Math.round(settings.discount_value)}% Discount` : `৳${Math.round(settings.discount_value)} Discount`} পাবে।`
                  : 'আপনার বন্ধু আপনার Referral Code ব্যবহার করে Sign Up করে যেকোনো Course Subscribe করলে।' },
              { num: '৩', bg: 'bg-emerald-50 text-emerald-600',
                title: settings.reward_amount > 0 ? `৳${Math.round(settings.reward_amount).toLocaleString()} Reward আপনার!` : 'Reward আপনার Wallet-এ জমা হবে',
                desc: settings.reward_amount > 0
                  ? `Refer সফল হলেই আপনার Wallet-এ ৳${Math.round(settings.reward_amount).toLocaleString()} জমা হবে।`
                  : 'বন্ধুর প্রথম Subscription Confirm হলেই আপনার Wallet-এ Reward জমা হয়ে যাবে।' },
            ].map(({ num, bg, title, desc }) => (
              <div key={num} className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                  <span className="text-lg font-black">{num}</span>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-[15px] font-bold text-slate-800 mb-1">{title}</p>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Wallet & Referral List ── */}
        <div className="space-y-6">
          {/* Wallet Mini */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-900 text-white shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-0.5 uppercase tracking-wide">Wallet Balance</p>
                <p className="text-2xl font-black text-slate-900 tracking-tight leading-none">৳{Number(user?.wallet_balance ?? 0).toFixed(2)}</p>
              </div>
            </div>
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"/>Active
            </span>
          </div>

          {/* Referred Members */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-[15px] font-bold tracking-tight text-slate-800">যাদের Invite করেছেন</h3>
            </div>
            {referrals.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {referrals.map((ref: any) => (
                  <div key={ref.id} className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 bg-blue-100 text-blue-700">
                      {(ref.users_referrals_referred_idTousers?.name ?? 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{ref.users_referrals_referred_idTousers?.name ?? 'Unknown'}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">
                        {new Date(ref.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {Number(ref.bonus_amount) > 0 && (
                        <p className="text-[14px] font-bold text-emerald-600 leading-none mb-1.5">+৳{Math.round(Number(ref.bonus_amount)).toLocaleString()}</p>
                      )}
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${ref.status === 'credited' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-500 bg-amber-50'}`}>
                        {ref.status === 'credited' ? 'Credited' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 text-slate-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <p className="text-[14px] font-bold text-slate-800">এখনো কাউকে Invite করা হয়নি</p>
                <p className="text-[13px] font-medium mt-1 text-slate-500">বন্ধুদের সাথে Code শেয়ার করে আয় শুরু করুন</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
