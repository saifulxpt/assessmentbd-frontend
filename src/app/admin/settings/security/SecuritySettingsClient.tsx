'use client';

import { useActionState, useState, useEffect } from 'react';
import { saveSettings } from '@/app/actions/admin-settings.actions';

export default function SecuritySettingsClient({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [state, formAction, isPending] = useActionState(saveSettings, null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const [singleDevice, setSingleDevice] = useState(initialSettings['single_device_login'] === '1');
  const [autoBlock, setAutoBlock] = useState(initialSettings['auto_block_suspicious'] === '1');

  return (
    <div className="max-w-2xl space-y-4">
      {/* Toast Alert */}
      {showToast && (
        <div className="flash-ok">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Security settings saved successfully.</span>
        </div>
      )}

      {state?.error && (
        <div className="flash-err">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="space-y-6">
        {/* Single Device Login */}
        <div className="sd-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><line x1="12" x2="12.01" y1="18" y2="18"/></svg>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-800 font-sans">Single-Device Login</h3>
              <p className="text-[12px] text-slate-500 font-medium">একটি অ্যাকাউন্ট একসাথে শুধুমাত্র একটি ডিভাইসে চালু থাকবে</p>
            </div>
          </div>

          <label className={`flex items-center justify-between gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
            singleDevice ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 bg-white'
          }`}>
            <div>
              <p className="text-sm font-bold text-slate-800">Enable Single-Device Enforcement</p>
              <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                নতুন ডিভাইসে লগইন করলে পুরনো ডিভাইস স্বয়ংক্রিয়ভাবে লগআউট হয়ে যাবে
              </p>
            </div>
            <div className="relative shrink-0">
              <input type="hidden" name="single_device_login" value="0" />
              <input 
                type="checkbox" 
                name="single_device_login" 
                value="1"
                checked={singleDevice}
                onChange={(e) => setSingleDevice(e.target.checked)}
                className="sr-only" 
              />
              <div className={`w-12 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 ${
                singleDevice ? 'bg-emerald-500' : 'bg-slate-300'
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  singleDevice ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </div>
            </div>
          </label>
        </div>

        {/* Anti-Sharing Detection */}
        <div className="sd-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" x2="12.01" y1="8" y2="8"/><line x1="12" x2="12" y1="12" y2="16"/></svg>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-800 font-sans">Anti-Sharing Detection</h3>
              <p className="text-[12px] text-slate-500 font-medium">একাধিক IP থেকে লগইন শনাক্ত করে সতর্ক করে বা ব্লক করে</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Unique IP Threshold</label>
                <input 
                  type="number" 
                  name="suspicious_ip_threshold"
                  defaultValue={initialSettings['suspicious_ip_threshold'] || '3'}
                  min="2" 
                  max="20" 
                  required 
                  className="sd-input" 
                />
                <p className="text-[11px] text-slate-400 mt-1">কত IP-তে লগইন হলে সন্দেহজনক ধরবে (default: 3)</p>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Time Window (hours)</label>
                <input 
                  type="number" 
                  name="suspicious_window_hours"
                  defaultValue={initialSettings['suspicious_window_hours'] || '24'}
                  min="1" 
                  max="168" 
                  required 
                  className="sd-input" 
                />
                <p className="text-[11px] text-slate-400 mt-1">কত ঘণ্টার মধ্যে হিসেব করবে (default: 24)</p>
              </div>
            </div>

            <label className={`flex items-center justify-between gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              autoBlock ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 bg-white'
            }`}>
              <div>
                <p className="text-sm font-bold text-slate-800">Auto-Block Suspicious Users</p>
                <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                  সন্দেহজনক কার্যক্রম ধরা পড়লে সাথে সাথে account block করবে
                </p>
              </div>
              <div className="relative shrink-0">
                <input type="hidden" name="auto_block_suspicious" value="0" />
                <input 
                  type="checkbox" 
                  name="auto_block_suspicious" 
                  value="1"
                  checked={autoBlock}
                  onChange={(e) => setAutoBlock(e.target.checked)}
                  className="sr-only" 
                />
                <div className={`w-12 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 ${
                  autoBlock ? 'bg-rose-500' : 'bg-slate-300'
                }`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    autoBlock ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            </label>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-[12px] font-bold text-amber-700 mb-1">⚠️ কীভাবে কাজ করে</p>
              <ul className="text-[11px] text-amber-600 space-y-1 font-medium list-disc list-inside">
                <li>প্রতিবার লগইনে device ও IP track হয়</li>
                <li>নির্ধারিত সময়ের মধ্যে threshold-এর বেশি IP থেকে লগইন হলে user "Suspicious" flag পায়</li>
                <li>Auto-block চালু থাকলে account স্বয়ংক্রিয়ভাবে block হয়</li>
                <li>Admin Users → Show page থেকে flag clear করা ও unblock করা যাবে</li>
              </ul>
            </div>
          </div>
        </div>

        <button type="submit" disabled={isPending} className="btn-brand disabled:opacity-50">
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          {isPending ? 'Saving Security Settings...' : 'Save Security Settings'}
        </button>

      </form>
    </div>
  );
}
