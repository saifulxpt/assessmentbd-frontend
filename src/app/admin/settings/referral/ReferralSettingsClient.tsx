'use client';

import { useActionState, useState, useEffect } from 'react';
import { saveSettings } from '@/app/actions/admin-settings.actions';

export default function ReferralSettingsClient({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [state, formAction, isPending] = useActionState(saveSettings, null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const [enabled, setEnabled] = useState(initialSettings['referral_enabled'] === '1');
  const [discountType, setDiscountType] = useState(initialSettings['referral_discount_type'] || 'flat');
  const [usableFor, setUsableFor] = useState(initialSettings['referral_reward_usable_for'] || 'course');
  const [rewardAmt, setRewardAmt] = useState(initialSettings['referral_reward_amount'] || '0');
  const [discountVal, setDiscountVal] = useState(initialSettings['referral_discount_value'] || '0');

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Toast Alert */}
      {showToast && (
        <div className="flash-ok">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Referral settings saved successfully.</span>
        </div>
      )}

      {state?.error && (
        <div className="flash-err">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction}>
        {/* Hidden inputs to pass interactive states */}
        <input type="hidden" name="referral_enabled" value={enabled ? '1' : '0'} />
        <input type="hidden" name="referral_discount_type" value={discountType} />
        <input type="hidden" name="referral_reward_usable_for" value={usableFor} />

        {/* ── 1. Premium Hero Banner ── */}
        <div className={`relative overflow-hidden rounded-3xl p-8 sm:p-10 transition-all duration-500 ${
          enabled ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20' : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
        }`}>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
            <div className="flex items-start gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                enabled ? 'bg-white/10 backdrop-blur-md border border-white/20' : 'bg-slate-100'
              }`}>
                <svg className={`w-7 h-7 ${enabled ? 'text-white' : 'text-slate-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
              </div>
              <div>
                <h3 className={`text-2xl font-black tracking-tight ${enabled ? 'text-white' : 'text-slate-800'}`}>Referral Program</h3>
                <p className={`text-sm mt-1.5 max-w-md leading-relaxed transition-colors ${enabled ? 'text-slate-300' : 'text-slate-505'}`}>
                  {enabled ? (
                    <span>The referral engine is live. Users can invite friends, earn wallet credits, and offer discounts to new signups.</span>
                  ) : (
                    <span>The referral system is currently inactive. Turn it on to boost user acquisition.</span>
                  )}
                </p>
              </div>
            </div>

            <div className={`shrink-0 flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-500 ${
              enabled ? 'bg-white/10 border border-white/10' : 'bg-slate-50 border border-slate-100'
            }`}>
              <span className={`text-sm font-bold uppercase tracking-widest ${enabled ? 'text-white' : 'text-slate-405'}`}>
                {enabled ? 'Active' : 'Disabled'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={enabled} 
                  onChange={(e) => setEnabled(e.target.checked)} 
                  className="sr-only" 
                />
                <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <div className={`bg-white rounded-full h-6 w-6 shadow-sm transition-transform duration-300 ease-in-out ${
                    enabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ── 2. Settings Grid ── */}
        {enabled && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
            {/* Referrer Gets */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col relative group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
              
              <div className="p-8 pb-6 flex justify-between items-start">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
                  </div>
                  <h4 className="text-xl font-black text-slate-800">Referrer Reward</h4>
                  <p className="text-sm text-slate-505 mt-1">Wallet credit for the inviter</p>
                </div>
              </div>
              
              <div className="px-8 pb-8 space-y-8 flex-1">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Amount to Credit</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                      <span className="text-emerald-500 font-black text-2xl">৳</span>
                    </div>
                    <input 
                      type="number" 
                      name="referral_reward_amount" 
                      min="0" 
                      step="1"
                      value={rewardAmt} 
                      onChange={(e) => setRewardAmt(e.target.value)}
                      className="w-full pl-14 py-4 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all rounded-2xl text-2xl font-black text-slate-800" 
                      placeholder="0" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Usage Permission</label>
                  <div className="space-y-3">
                    {[
                      { val: 'course', label: 'Buy Course Only', sub: 'For purchases inside app', icon: 'book' },
                      { val: 'both', label: 'Course + Withdraw', sub: 'Most flexible option', icon: 'stack' },
                      { val: 'withdraw', label: 'Withdraw Only', sub: 'Cashout to bank account', icon: 'withdraw' }
                    ].map((opt) => (
                      <label 
                        key={opt.val}
                        onClick={() => setUsableFor(opt.val)}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                          usableFor === opt.val ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          usableFor === opt.val ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {opt.icon === 'book' && <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1.5H20v18H6.5a2.5 2.5 0 0 1-2.5-2.5z"/></svg>}
                          {opt.icon === 'stack' && <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>}
                          {opt.icon === 'withdraw' && <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${usableFor === opt.val ? 'text-emerald-950' : 'text-slate-700'}`}>{opt.label}</p>
                          <p className={`text-xs mt-0.5 ${usableFor === opt.val ? 'text-emerald-600/80' : 'text-slate-400'}`}>{opt.sub}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          usableFor === opt.val ? 'border-emerald-500' : 'border-slate-300'
                        }`}>
                          <div className={`w-2.5 h-2.5 rounded-full bg-emerald-500 transition-transform duration-300 ${
                            usableFor === opt.val ? 'scale-100' : 'scale-0'
                          }`} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* New User Gets */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col relative group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
              
              <div className="p-8 pb-6 flex justify-between items-start">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m12 2 10 10-10 10L2 12Z"/><circle cx="12" cy="12" r="1"/></svg>
                  </div>
                  <h4 className="text-xl font-black text-slate-800">Referee Discount</h4>
                  <p className="text-sm text-slate-505 mt-1">Discount on their first purchase</p>
                </div>
              </div>

              <div className="px-8 pb-8 space-y-8 flex-1">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Discount Type</label>
                  <div className="flex p-1.5 bg-slate-100 rounded-2xl">
                    <button 
                      type="button" 
                      onClick={() => setDiscountType('flat')} 
                      className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                        discountType === 'flat' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Fixed Amount (৳)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setDiscountType('percent')} 
                      className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                        discountType === 'percent' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Percentage (%)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Discount Value</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                      <span className="text-amber-500 font-black text-2xl">{discountType === 'flat' ? '৳' : '%'}</span>
                    </div>
                    <input 
                      type="number" 
                      name="referral_discount_value" 
                      min="0" 
                      step="1"
                      value={discountVal} 
                      onChange={(e) => setDiscountVal(e.target.value)}
                      className="w-full pl-14 py-4 bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all rounded-2xl text-2xl font-black text-slate-800"
                      max={discountType === 'percent' ? 100 : undefined} 
                      placeholder="0" 
                    />
                  </div>
                  <p className="text-[12px] text-slate-400 mt-3 font-medium flex items-center gap-1.5">
                    Applied automatically at checkout. {discountType === 'percent' && <span className="text-amber-600">Max 100%.</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* ── 3. Golden Premium Action Bar ── */}
            <div className="lg:col-span-2 bg-gradient-to-br from-yellow-100 via-amber-200 to-yellow-400 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-amber-500/10 border border-amber-300">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="hidden sm:flex w-14 h-14 rounded-full bg-white/40 border border-white/50 items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-7 h-7 text-amber-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-amber-900/60 uppercase tracking-widest mb-1.5">Live Configuration</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-amber-950 text-sm font-bold">Inviter gets</span>
                    <span className="text-slate-900 font-black text-xl tabular-nums tracking-tight bg-white/40 px-2 py-0.5 rounded-lg">৳{rewardAmt || '0'}</span>
                    <span className="text-amber-700/50 mx-2 text-xl font-light">|</span>
                    <span className="text-amber-950 text-sm font-bold">New user saves</span>
                    <span className="text-slate-900 font-black text-xl tabular-nums tracking-tight bg-white/40 px-2 py-0.5 rounded-lg">{discountType === 'flat' ? '৳' : ''}{discountVal || '0'}{discountType === 'percent' ? '%' : ''}</span>
                  </div>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isPending}
                className="w-full md:w-auto px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white text-base font-bold rounded-2xl shadow-xl shadow-slate-900/30 transition-all hover:-translate-y-1 disabled:opacity-50"
              >
                {isPending ? 'Saving Settings...' : 'Save Settings'}
              </button>
            </div>
          </div>
        )}

        {/* Save button fallback when disabled */}
        {!enabled && (
          <div className="mt-8 animate-fadeIn">
            <button 
              type="submit" 
              disabled={isPending}
              className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isPending ? 'Saving Settings...' : 'Save Settings'}
            </button>
          </div>
        )}

      </form>
    </div>
  );
}
