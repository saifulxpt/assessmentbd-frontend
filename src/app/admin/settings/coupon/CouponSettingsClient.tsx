'use client';

import { useActionState, useState, useEffect, useTransition } from 'react';
import { saveSettings } from '@/app/actions/admin-settings.actions';
import { createCouponAction, updateCouponAction, toggleCouponAction, deleteCouponAction } from '@/app/actions/admin-coupon.actions';

interface Coupon {
  id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number;
  max_uses_per_user: number;
  used_count: number;
  first_purchase_only: boolean;
  expires_at: string | null;
  is_active: boolean;
  course_id: number | null;
  plan_restriction: string;
  course_title: string | null;
}

interface Course {
  id: number;
  title: string;
}

export default function CouponSettingsClient({ 
  initialSettings, 
  coupons, 
  courses 
}: { 
  initialSettings: Record<string, string>; 
  coupons: Coupon[]; 
  courses: Course[]; 
}) {
  const [settingsState, settingsFormAction, isPendingSettings] = useActionState(saveSettings, null);
  const [createState, createFormAction, isPendingCreate] = useActionState(createCouponAction, null);
  const [editState, editFormAction, isPendingEdit] = useActionState(updateCouponAction, null);

  const [isPendingTransition, startTransition] = useTransition();

  const [enabled, setEnabled] = useState(initialSettings['coupon_enabled'] === '1');
  const [stackRef, setStackRef] = useState(initialSettings['coupon_stack_referral'] === '1');

  const [showCreate, setShowCreate] = useState(false);
  const [createType, setCreateType] = useState('flat');

  const [editOpen, setEditOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editType, setEditType] = useState('flat');

  const [showToast, setShowToast] = useState('');

  // Close creation form on successful coupon create
  useEffect(() => {
    if (createState?.success) {
      setShowCreate(false);
      setShowToast('Coupon created successfully!');
      const timer = setTimeout(() => setShowToast(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [createState]);

  // Close edit modal on successful coupon update
  useEffect(() => {
    if (editState?.success) {
      setEditOpen(false);
      setEditingCoupon(null);
      setShowToast('Coupon updated successfully!');
      const timer = setTimeout(() => setShowToast(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [editState]);

  // Show settings save success
  useEffect(() => {
    if (settingsState?.success) {
      setShowToast('Settings saved successfully.');
      const timer = setTimeout(() => setShowToast(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [settingsState]);

  const handleToggle = (id: number) => {
    startTransition(async () => {
      await toggleCouponAction(id);
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      startTransition(async () => {
        await deleteCouponAction(id);
      });
    }
  };

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setEditType(coupon.discount_type);
    setEditOpen(true);
  };

  const isExpired = (expiry: string | null) => {
    if (!expiry) return false;
    return new Date(expiry).getTime() < Date.now();
  };

  const isExhausted = (coupon: Coupon) => {
    return coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses;
  };

  // Format local date string for HTML inputs
  const formatDateLocal = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const tzoffset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  return (
    <div className="max-w-4xl space-y-4">
      {/* Toast Alert */}
      {showToast && (
        <div className="flash-ok">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>{showToast}</span>
        </div>
      )}

      {/* Global Validation Errors */}
      {settingsState?.error && <div className="flash-err">{settingsState.error}</div>}
      {createState?.error && <div className="flash-err">{createState.error}</div>}
      {editState?.error && <div className="flash-err">{editState.error}</div>}

      <form action={settingsFormAction} className="bg-white rounded-xl border border-slate-200 mb-6 p-5 space-y-6 shadow-sm">
        {/* Coupon System Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-bold text-slate-800">Coupon System</h3>
            <p className="text-[13px] text-slate-505 mt-0.5 font-medium">Enable or disable the coupon system globally.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="hidden" name="coupon_enabled" value="0" />
            <input 
              type="checkbox" 
              name="coupon_enabled" 
              value="1" 
              checked={enabled} 
              onChange={(e) => setEnabled(e.target.checked)}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            <span className="ml-3 text-[13px] font-bold text-slate-700 w-16" style={{ contentVisibility: 'auto' }}>{enabled ? 'Enabled' : 'Disabled'}</span>
          </label>
        </div>

        {/* Stack with Referral */}
        {enabled && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-5 transition-all">
            <div>
              <h3 className="text-[14px] font-semibold text-slate-800">Stack with Referral</h3>
              <p className="text-[13px] text-slate-505 mt-0.5 font-medium">Allow users to apply both a coupon and a referral discount simultaneously.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="hidden" name="coupon_stack_referral" value="0" />
              <input 
                type="checkbox" 
                name="coupon_stack_referral" 
                value="1" 
                checked={stackRef} 
                onChange={(e) => setStackRef(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="ml-3 text-[13px] font-bold text-slate-700 w-16">{stackRef ? 'Yes' : 'No'}</span>
            </label>
          </div>
        )}

        <div className="flex justify-end pt-5 border-t border-slate-100">
          <button type="submit" disabled={isPendingSettings} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[13px] font-semibold py-2 px-6 transition-colors shadow-sm disabled:opacity-50">
            {isPendingSettings ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* ── COUPON LIST + CREATE ── */}
      <div className="sd-card overflow-hidden">
        <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#fce7f3,#f9a8d4)' }}>
              <svg className="w-5 h-5 text-pink-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </div>
            <div>
              <p className="text-[15px] font-bold text-slate-900 tracking-tight">Coupon Codes</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{coupons.length} coupons created</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setShowCreate(!showCreate)}
            className="btn-brand text-[12px] py-2 px-4"
          >
            {showCreate ? 'Cancel' : 'New Coupon'}
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="p-6 border-b border-slate-100 bg-white">
            <h3 className="text-[16px] font-bold text-slate-800 mb-5">New Coupon</h3>
            
            <form action={createFormAction} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Coupon Code <span className="text-slate-400 font-normal">(required)</span></label>
                  <input 
                    type="text" 
                    name="code" 
                    maxLength={50} 
                    required 
                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2.5 text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors uppercase font-mono" 
                    placeholder="e.g. SAVE50" 
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Expiry Date <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input 
                    type="datetime-local" 
                    name="expires_at" 
                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2.5 text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Type</label>
                  <select 
                    name="discount_type" 
                    value={createType} 
                    onChange={(e) => setCreateType(e.target.value)} 
                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2.5 text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  >
                    <option value="flat">Fixed Amount (৳)</option>
                    <option value="percent">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Amount</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-medium text-[14px] pointer-events-none">
                      {createType === 'flat' ? '৳' : '%'}
                    </span>
                    <input 
                      type="number" 
                      name="discount_value" 
                      min="0" 
                      step="0.01" 
                      required 
                      className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-lg py-2.5 pr-3 text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" 
                      style={{ paddingLeft: '2rem' }} 
                      placeholder="e.g. 10" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Use limit <span className="text-slate-400 font-normal">(0 = No limit)</span></label>
                  <input type="number" name="max_uses" min="0" defaultValue="0" className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2.5 text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Limit per user <span className="text-slate-400 font-normal">(0 = No limit)</span></label>
                  <input type="number" name="max_uses_per_user" min="0" defaultValue="1" className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2.5 text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Course Restriction <span className="text-slate-400 font-normal">(optional)</span></label>
                  <select name="course_id" className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2.5 text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors">
                    <option value="">All courses</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Plan Restriction <span className="text-slate-400 font-normal">(optional)</span></label>
                  <select name="plan_restriction" className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2.5 text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors">
                    <option value="all">All Plans (Basic & Pro)</option>
                    <option value="basic">Basic Plan Only</option>
                    <option value="pro">Pro Plan Only</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="hidden" name="first_purchase_only" value="0" />
                  <input type="checkbox" name="first_purchase_only" value="1" className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-colors" />
                  <span className="text-[13px] font-semibold text-slate-700">Applicable only on the first purchase</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-5 mt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-2.5 text-[13px] font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">Close</button>
                <button type="submit" disabled={isPendingCreate} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50">
                  {isPendingCreate ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Coupons Table */}
        {coupons.length === 0 ? (
          <div className="p-10 text-center bg-white">
            <svg className="w-8 h-8 text-slate-200 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>
            <p className="text-[13px] font-semibold text-slate-400">No coupons created yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white">
            <table className="w-full text-left border-collapse sd-table">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-100">
                  <th>Code</th>
                  <th>Value</th>
                  <th>Usage</th>
                  <th>Applicable On</th>
                  <th>Expiry</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((coupon) => {
                  const expired = isExpired(coupon.expires_at);
                  const exhausted = isExhausted(coupon);
                  return (
                    <tr key={coupon.id} className={`transition-colors ${
                      expired || exhausted ? 'bg-slate-50/30 opacity-75' : ''
                    }`}>
                      <td className="align-middle">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[14px] text-slate-800">{coupon.code}</span>
                          {!coupon.is_active ? (
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">Off</span>
                          ) : expired || exhausted ? (
                            <span className="w-2 h-2 rounded-full bg-rose-500" title="Expired/Full" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active" />
                          )}
                        </div>
                      </td>
                      <td className={`align-middle text-[13px] font-semibold ${
                        coupon.discount_type === 'percent' ? 'text-blue-600' : 'text-emerald-600'
                      }`}>
                        {coupon.discount_type === 'flat' ? `৳${coupon.discount_value} Flat` : `${coupon.discount_value}% Off`}
                      </td>
                      <td className="align-middle">
                        <p className="text-[13px] font-medium text-slate-700">
                          {coupon.used_count} / {coupon.max_uses > 0 ? coupon.max_uses : '∞'}
                          {exhausted && <span className="text-rose-500 ml-1 text-[11px] font-bold">(Full)</span>}
                        </p>
                      </td>
                      <td className="align-middle">
                        <p className="text-[13px] font-semibold text-slate-700 truncate max-w-[200px]" title={coupon.course_title || 'All Courses'}>
                          {coupon.course_title || 'All Courses'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-slate-405">
                          <span>{coupon.plan_restriction === 'all' ? 'All Plans' : `${coupon.plan_restriction.toUpperCase()} Only`}</span>
                          {coupon.first_purchase_only && (
                            <>
                              <span className="w-1 h-1 bg-slate-300 rounded-full" />
                              <span>1st purchase</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="align-middle">
                        <p className={`text-[13px] font-medium ${expired ? 'text-rose-500 font-semibold' : 'text-slate-700'}`}>
                          {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Never'}
                        </p>
                      </td>
                      <td className="align-middle text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            type="button" 
                            onClick={() => openEdit(coupon)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-500 hover:text-emerald-600 transition-colors"
                            title="Edit"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                          </button>
                          
                          <button 
                            type="button"
                            onClick={() => handleToggle(coupon.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
                            title={coupon.is_active ? 'Disable' : 'Enable'}
                            disabled={isPendingTransition}
                          >
                            {coupon.is_active ? (
                              <svg className="w-3.5 h-3.5 text-amber-500 hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 text-emerald-600 hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            )}
                          </button>

                          <button 
                            type="button"
                            onClick={() => handleDelete(coupon.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                            title="Delete"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══ EDIT COUPON MODAL ═══ */}
      {editOpen && editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1.5px]" onClick={() => { setEditOpen(false); setEditingCoupon(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-[16px] font-bold text-slate-800">
                Edit Coupon: <span className="font-mono text-emerald-600">{editingCoupon.code}</span>
              </h3>
              <button 
                onClick={() => { setEditOpen(false); setEditingCoupon(null); }} 
                className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form action={editFormAction} className="space-y-5 pt-2">
              <input type="hidden" name="id" value={editingCoupon.id} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Type</label>
                  <select 
                    name="discount_type" 
                    value={editType} 
                    onChange={(e) => setEditType(e.target.value)} 
                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2.5 text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  >
                    <option value="flat">Fixed Amount (৳)</option>
                    <option value="percent">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Amount</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-medium text-[14px] pointer-events-none">
                      {editType === 'flat' ? '৳' : '%'}
                    </span>
                    <input 
                      type="number" 
                      name="discount_value" 
                      defaultValue={editingCoupon.discount_value} 
                      min="0" 
                      step="0.01" 
                      required
                      className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-lg py-2.5 pr-3 text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" 
                      style={{ paddingLeft: '2rem' }} 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Use limit <span className="text-slate-400 font-normal">(0=∞)</span></label>
                  <input type="number" name="max_uses" defaultValue={editingCoupon.max_uses} min="0" className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2.5 text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Limit per user <span className="text-slate-400 font-normal">(0=∞)</span></label>
                  <input type="number" name="max_uses_per_user" defaultValue={editingCoupon.max_uses_per_user} min="0" className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2.5 text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Course Restriction</label>
                  <select 
                    name="course_id" 
                    defaultValue={editingCoupon.course_id || ''} 
                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2.5 text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  >
                    <option value="">All courses</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Plan Restriction</label>
                  <select 
                    name="plan_restriction" 
                    defaultValue={editingCoupon.plan_restriction} 
                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2.5 text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  >
                    <option value="all">All Plans</option>
                    <option value="basic">Basic Plan Only</option>
                    <option value="pro">Pro Plan Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Expires At <span className="text-slate-400 font-normal">(optional)</span></label>
                <input 
                  type="datetime-local" 
                  name="expires_at" 
                  defaultValue={formatDateLocal(editingCoupon.expires_at)} 
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2.5 text-[14px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" 
                />
              </div>

              <div className="flex items-center pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="hidden" name="first_purchase_only" value="0" />
                  <input 
                    type="checkbox" 
                    name="first_purchase_only" 
                    value="1" 
                    defaultChecked={editingCoupon.first_purchase_only} 
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-colors" 
                  />
                  <span className="text-[13px] font-semibold text-slate-700">Applicable only on the first purchase</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-5 mt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => { setEditOpen(false); setEditingCoupon(null); }} 
                  className="px-5 py-2.5 text-[13px] font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isPendingEdit}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {isPendingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
