'use client';

import { useActionState, useState, useEffect } from 'react';
import { saveSettings } from '@/app/actions/admin-settings.actions';
import { checkSmsBalanceAction, testAiConnectionAction } from '@/app/actions/admin-settings-sub.actions';

export default function ApiSettingsClient({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [state, formAction, isPending] = useActionState(saveSettings, null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  // BulkSMS balance check state
  const [smsStatus, setSmsStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [smsLabel, setSmsLabel] = useState<string>('Check Balance');

  const checkSmsBalance = async () => {
    setSmsStatus('loading');
    setSmsLabel('Checking…');
    const res = await checkSmsBalanceAction();
    if (res.success) {
      setSmsStatus('loaded');
      setSmsLabel(`৳ ${res.balance}`);
    } else {
      setSmsStatus('error');
      setSmsLabel(res.error || 'Failed');
    }
  };

  // AI keys testing state
  const [openaiKey, setOpenaiKey] = useState(initialSettings['openai_api_key'] || '');
  const [geminiKey, setGeminiKey] = useState(initialSettings['gemini_api_key'] || '');
  const [openaiTestResult, setOpenaiTestResult] = useState<{ show: boolean; msg: string; error: boolean }>({ show: false, msg: '', error: false });
  const [geminiTestResult, setGeminiTestResult] = useState<{ show: boolean; msg: string; error: boolean }>({ show: false, msg: '', error: false });

  const testAiKey = async (provider: 'openai' | 'gemini') => {
    const key = provider === 'openai' ? openaiKey : geminiKey;
    const setter = provider === 'openai' ? setOpenaiTestResult : setGeminiTestResult;

    setter({ show: true, msg: 'Testing connection...', error: false });

    if (!key.trim()) {
      setter({ show: true, msg: 'Please enter an API key first.', error: true });
      return;
    }

    const res = await testAiConnectionAction(provider, key);
    if (res.success) {
      setter({ show: true, msg: res.message || 'Connected successfully!', error: false });
    } else {
      setter({ show: true, msg: res.error || 'Connection failed.', error: true });
    }

    setTimeout(() => {
      setter(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Password fields visibility states
  const [showSmsKey, setShowSmsKey] = useState(false);
  const [showResendKey, setShowResendKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showTawkProperty, setShowTawkProperty] = useState(false);
  const [showTawkWidget, setShowTawkWidget] = useState(false);

  // Email provider states
  const [mailDriver, setMailDriver] = useState(initialSettings['mail_driver'] || 'smtp');
  const [mailEncryption, setMailEncryption] = useState(initialSettings['mail_encryption'] || 'tls');

  // Tawk.to configurations states
  const [tawkEnabled, setTawkEnabled] = useState(initialSettings['tawk_enabled'] === '1');
  const [chatConfigMode, setChatConfigMode] = useState<'ids' | 'raw'>(() => {
    return initialSettings['tawk_raw_script'] ? 'raw' : 'ids';
  });

  return (
    <div className="max-w-2xl space-y-4">
      {/* Toast Alert */}
      {showToast && (
        <div className="flash-ok">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>API settings saved successfully.</span>
        </div>
      )}

      {state?.error && (
        <div className="flash-err">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {/* ═══ BulkSMS BD ═══ */}
        <div className="sd-card overflow-hidden">
          <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#d1fae5,#6ee7b7)' }}>
                <svg className="w-5 h-5 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"/></svg>
              </div>
              <div>
                <p className="text-[15px] font-bold text-slate-900 tracking-tight">BulkSMS BD</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5 font-sans">bulksmsbd.net · SMS Gateway</p>
              </div>
            </div>

            {/* Live Balance */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-2xl text-[12px] font-bold border transition-all duration-300 ${
                smsStatus === 'idle' ? 'bg-slate-100/80 border-transparent text-slate-500' :
                smsStatus === 'loading' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                smsStatus === 'loaded' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                'bg-rose-50 border-rose-100 text-rose-600'
              }`}>
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                <span>{smsLabel}</span>
                <button 
                  type="button" 
                  onClick={checkSmsBalance}
                  className="w-6 h-6 flex items-center justify-center rounded-xl hover:bg-black/5 transition ml-0.5"
                  title="Check balance"
                  disabled={smsStatus === 'loading'}
                >
                  <svg className={`w-3 h-3 ${smsStatus === 'loading' ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4 bg-white">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">API Key</label>
              <div className="relative">
                <input 
                  type={showSmsKey ? 'text' : 'password'} 
                  name="sms_api_key" 
                  defaultValue={initialSettings['sms_api_key'] || ''}
                  className="sd-input font-mono pr-10" 
                  placeholder="Enter your BulkSMS BD API key" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowSmsKey(!showSmsKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showSmsKey ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Sender ID</label>
              <input 
                type="text" 
                name="sms_sender_id" 
                defaultValue={initialSettings['sms_sender_id'] || ''}
                className="sd-input" 
                placeholder="e.g. 8809617612345" 
              />
            </div>
          </div>
        </div>

        {/* ═══ Email ═══ */}
        <div className="sd-card overflow-hidden">
          <div className="px-5 pt-5 pb-4 flex items-center gap-3 border-b border-slate-100 bg-slate-50/50">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#dbeafe,#93c5fd)' }}>
              <svg className="w-5 h-5 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <div>
              <p className="text-[15px] font-bold text-slate-900 tracking-tight">Email</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 font-sans">Transactional email delivery</p>
            </div>
          </div>

          <div className="p-5 space-y-5 bg-white">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Provider</label>
              <div className="mt-1.5 inline-flex items-center gap-1 p-1 bg-slate-100 rounded-2xl">
                <button 
                  type="button" 
                  onClick={() => setMailDriver('smtp')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition-all duration-200 ${
                    mailDriver === 'smtp' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-505 hover:text-slate-700'
                  }`}
                >
                  SMTP
                </button>
                <button 
                  type="button" 
                  onClick={() => setMailDriver('resend')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition-all duration-200 ${
                    mailDriver === 'resend' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-505 hover:text-slate-700'
                  }`}
                >
                  Resend
                </button>
              </div>
              <input type="hidden" name="mail_driver" value={mailDriver} />
            </div>

            {/* SMTP Inputs */}
            {mailDriver === 'smtp' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">SMTP Host</label>
                    <input type="text" name="mail_host" defaultValue={initialSettings['mail_host'] || ''} className="sd-input" placeholder="smtp.gmail.com" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Port</label>
                    <input type="number" name="mail_port" defaultValue={initialSettings['mail_port'] || '587'} className="sd-input" placeholder="587" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Username</label>
                    <input type="text" name="mail_username" defaultValue={initialSettings['mail_username'] || ''} className="sd-input" placeholder="you@gmail.com" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
                    <input type="password" name="mail_password" defaultValue={initialSettings['mail_password'] || ''} className="sd-input" placeholder="App password" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Encryption</label>
                  <div className="mt-1.5 flex items-center gap-2">
                    {Object.entries({ 'tls': 'TLS', 'ssl': 'SSL', '': 'None' }).map(([val, lbl]) => (
                      <label 
                        key={val}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 cursor-pointer transition-all text-[12px] font-bold ${
                          mailEncryption === val ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="mail_encryption" 
                          value={val}
                          checked={mailEncryption === val}
                          onChange={() => setMailEncryption(val)}
                          className="accent-blue-500" 
                        />
                        {lbl}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Resend Inputs */}
            {mailDriver === 'resend' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Resend API Key</label>
                  <div className="relative">
                    <input 
                      type={showResendKey ? 'text' : 'password'} 
                      name="resend_api_key" 
                      defaultValue={initialSettings['resend_api_key'] || ''}
                      className="sd-input font-mono pr-10" 
                      placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxx" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowResendKey(!showResendKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showResendKey ? (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>
                <a href="https://resend.com/api-keys" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition">
                  Get your API key at resend.com
                </a>
              </div>
            )}

            {/* Common Sender Settings */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Sender</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">From Address</label>
                  <input type="email" name="mail_from_address" defaultValue={initialSettings['mail_from_address'] || ''} className="sd-input" placeholder="no-reply@yourdomain.com" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Display Name</label>
                  <input type="text" name="mail_from_name" defaultValue={initialSettings['mail_from_name'] || ''} className="sd-input" placeholder="NSDA Prep" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Tawk.to Live Chat ═══ */}
        <div className="sd-card overflow-hidden">
          <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#e0e7ff,#c7d2fe)' }}>
                <svg className="w-5 h-5 text-indigo-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div>
                <p className="text-[15px] font-bold text-slate-900 tracking-tight">Tawk.to Live Chat</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5 font-sans">tawk.to · Live Support Chat Widget</p>
              </div>
            </div>

            <div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="hidden" name="tawk_enabled" value="0" />
                <input 
                  type="checkbox" 
                  name="tawk_enabled" 
                  value="1" 
                  checked={tawkEnabled} 
                  onChange={(e) => setTawkEnabled(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          {tawkEnabled && (
            <div className="p-5 space-y-5 bg-white">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Connection Method</label>
                <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-2xl">
                  <button 
                    type="button" 
                    onClick={() => setChatConfigMode('ids')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition-all duration-200 ${
                      chatConfigMode === 'ids' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Property & Widget IDs
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setChatConfigMode('raw')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition-all duration-200 ${
                      chatConfigMode === 'raw' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Complete Embed Script
                  </button>
                </div>
              </div>

              {chatConfigMode === 'ids' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Property ID</label>
                      <div className="relative">
                        <input 
                          type={showTawkProperty ? 'text' : 'password'} 
                          name="tawk_property_id" 
                          defaultValue={initialSettings['tawk_property_id'] || ''}
                          className="sd-input font-mono text-[13px] pr-10" 
                          placeholder="e.g. 60ba26e84ae63c34a0d5c07b" 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowTawkProperty(!showTawkProperty)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                        >
                          {showTawkProperty ? (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          ) : (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Widget ID</label>
                      <div className="relative">
                        <input 
                          type={showTawkWidget ? 'text' : 'password'} 
                          name="tawk_widget_id" 
                          defaultValue={initialSettings['tawk_widget_id'] || ''}
                          className="sd-input font-mono text-[13px] pr-10" 
                          placeholder="e.g. 1f7cebe1h" 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowTawkWidget(!showTawkWidget)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                        >
                          {showTawkWidget ? (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          ) : (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">You can find these IDs in your tawk.to dashboard under Settings &gt; Channels &gt; Chat Widget.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">Tawk.to Embed Script</label>
                    <textarea 
                      name="tawk_raw_script" 
                      rows={5} 
                      className="sd-input font-mono text-[12px]"
                      placeholder="Paste the complete tawk.to script code here (including <script> tags)"
                      defaultValue={initialSettings['tawk_raw_script'] || ''}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══ AI & Machine Learning ═══ */}
        <div className="sd-card overflow-hidden bg-white">
          <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#fce7f3,#fbcfe8)' }}>
                <svg className="w-5 h-5 text-pink-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <div>
                <p className="text-[15px] font-bold text-slate-900 tracking-tight">AI & Machine Learning</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5 font-sans">OpenAI and Gemini integrations</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-6">
            {/* OpenAI */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">OpenAI API Key</label>
                <button 
                  type="button" 
                  onClick={() => testAiKey('openai')} 
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 transition flex items-center gap-1 font-sans"
                >
                  Test Connection
                </button>
              </div>
              <div className="relative">
                <input 
                  type={showOpenaiKey ? 'text' : 'password'} 
                  name="openai_api_key" 
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  className="sd-input font-mono pr-10" 
                  placeholder="sk-..." 
                />
                <button 
                  type="button" 
                  onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showOpenaiKey ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              {openaiTestResult.show && (
                <p className={`text-[11px] font-bold mt-1 ${openaiTestResult.error ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {openaiTestResult.msg}
                </p>
              )}
            </div>

            {/* Gemini */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Google Gemini API Key</label>
                <button 
                  type="button" 
                  onClick={() => testAiKey('gemini')} 
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 transition flex items-center gap-1 font-sans"
                >
                  Test Connection
                </button>
              </div>
              <div className="relative">
                <input 
                  type={showGeminiKey ? 'text' : 'password'} 
                  name="gemini_api_key" 
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="sd-input font-mono pr-10" 
                  placeholder="AIzaSy..." 
                />
                <button 
                  type="button" 
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showGeminiKey ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              {geminiTestResult.show && (
                <p className={`text-[11px] font-bold mt-1 ${geminiTestResult.error ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {geminiTestResult.msg}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ═══ Analytics & Tracking ═══ */}
        <div className="sd-card overflow-hidden bg-white">
          <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#fef3c7,#fde68a)' }}>
                <svg className="w-5 h-5 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
              </div>
              <div>
                <p className="text-[15px] font-bold text-slate-900 tracking-tight">Analytics & Tracking</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5 font-sans">Google Analytics and Meta Pixel IDs</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Google Analytics ID</label>
                <input 
                  type="text" 
                  name="google_analytics_id" 
                  defaultValue={initialSettings['google_analytics_id'] || ''}
                  className="sd-input font-mono" 
                  placeholder="G-XXXXXXXXXX" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Meta Pixel ID</label>
                <input 
                  type="text" 
                  name="facebook_pixel_id" 
                  defaultValue={initialSettings['facebook_pixel_id'] || ''}
                  className="sd-input font-mono" 
                  placeholder="123456789012345" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-2">
          <button 
            type="submit" 
            disabled={isPending}
            className="btn-brand w-full justify-center py-3 text-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            {isPending ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
