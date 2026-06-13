'use client';

import { useActionState, useState, useTransition } from 'react';
import { updateAdminProfile, runDbMigrations } from '@/app/actions/admin-settings-sub.actions';

export default function SettingsProfileClient({ initialMobile }: { initialMobile: string }) {
  const [profileState, profileAction, isPendingProfile] = useActionState(updateAdminProfile, null);
  const [dbStatus, setDbStatus] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [isPendingDb, startDbTransition] = useTransition();

  const handleRunMigrations = () => {
    if (!confirm('Are you sure you want to run Database Updates?')) {
      return;
    }
    setDbStatus({ message: 'Running database updates... Please wait.' });
    startDbTransition(async () => {
      const res = await runDbMigrations();
      if (res.success) {
        setDbStatus({ success: true, message: res.message });
      } else {
        setDbStatus({ error: res.error });
      }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Profile & Security Card */}
      <div className="sd-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 11 2 2 4-4"/>
            </svg>
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-slate-800 font-sans">Profile & Security</h3>
            <p className="text-[12px] text-slate-500 font-medium">Change mobile number and password</p>
          </div>
        </div>

        {profileState?.error && (
          <div className="flash-err mb-4">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{profileState.error}</span>
          </div>
        )}

        {profileState?.success && (
          <div className="flash-ok mb-4">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>{profileState.message}</span>
          </div>
        )}

        <form action={profileAction} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Mobile Number</label>
            <input 
              type="text" 
              name="mobile" 
              autoComplete="off" 
              required 
              defaultValue={initialMobile} 
              className="sd-input" 
              placeholder="01XXXXXXXXX"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Current Password</label>
            <input 
              type="password" 
              name="current_password" 
              autoComplete="new-password" 
              required 
              className="sd-input"
            />
          </div>

          <div className="border-t border-slate-100 my-4 pt-4">
            <p className="text-[12px] font-semibold text-slate-500 mb-3">Fill the fields below to change your password (optional):</p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">New Password</label>
            <input 
              type="password" 
              name="new_password" 
              autoComplete="new-password" 
              className="sd-input"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Confirm Password</label>
            <input 
              type="password" 
              name="new_password_confirmation" 
              autoComplete="new-password" 
              className="sd-input"
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isPendingProfile}
              className="btn-primary w-full justify-center !bg-amber-500 hover:!bg-amber-600 shadow-amber-500/20 disabled:opacity-50"
            >
              {isPendingProfile ? 'Updating Settings...' : 'Update Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* System & Database Tools */}
      <div className="sd-card p-6 h-fit">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>
            </svg>
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-slate-800 font-sans">Database Tools</h3>
            <p className="text-[12px] text-slate-500 font-medium">Sync live database structure</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl mb-6">
          <p className="text-[12px] text-slate-600 font-medium leading-relaxed">
            When you deploy new code updates via GitHub, the database structure sometimes needs to be updated (Migrations). 
            Clicking this button will automatically sync your live database with the latest code structure safely, <strong className="text-indigo-600">without losing any user data</strong>.
          </p>
        </div>

        {dbStatus?.error && (
          <div className="flash-err mb-4 font-mono text-xs whitespace-pre-wrap">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{dbStatus.error}</span>
          </div>
        )}

        {dbStatus?.message && !dbStatus.error && !dbStatus.success && (
          <div className="flash-ok !bg-amber-50 !border-amber-100 !text-amber-700 mb-4">
            <svg className="w-4 h-4 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
            <span>{dbStatus.message}</span>
          </div>
        )}

        {dbStatus?.success && (
          <div className="flash-ok mb-4">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span className="font-mono text-[11px] whitespace-pre-wrap">{dbStatus.message}</span>
          </div>
        )}

        <button 
          type="button" 
          onClick={handleRunMigrations}
          disabled={isPendingDb}
          className="btn-primary w-full justify-center !bg-indigo-600 hover:!bg-indigo-700 shadow-indigo-600/20 shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          <svg className={`w-4 h-4 ${isPendingDb ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
          Run Database Update
        </button>
      </div>

    </div>
  );
}
