import { getSubscriptionHistory } from '@/app/actions/user-dashboard.actions';
import Link from 'next/link';

export const metadata = {
  title: 'Subscription History - AssessmentBD',
};

const METHOD_LABELS: Record<string, string> = {
  bkash: 'bKash', nagad: 'Nagad', wallet: 'Wallet',
  manual: 'Manual', sslcommerz: 'SSLCommerz', aamarpay: 'AamarPay'
};

function getStatusInfo(sub: any) {
  const now = new Date();
  const expiresAt = sub.expires_at ? new Date(sub.expires_at) : null;
  const isActive   = sub.status === 'active' && (expiresAt ? expiresAt > now : true);
  const isGateway  = sub.status === 'pending_gateway';
  const isPending  = sub.status === 'pending' || sub.status === 'pending_gateway';
  const isExpired  = sub.status === 'expired' || (sub.status === 'active' && expiresAt && expiresAt <= now);
  const isRejected = sub.status === 'rejected' || sub.status === 'cancelled';

  let badgeClass = '', badgeText = '';
  if (isActive)        { badgeClass = 'bg-emerald-50 text-emerald-600 border-emerald-100'; badgeText = 'Active'; }
  else if (isGateway)  { badgeClass = 'bg-blue-50 text-blue-600 border-blue-100';     badgeText = 'Processing'; }
  else if (isPending)  { badgeClass = 'bg-amber-50 text-amber-600 border-amber-100';  badgeText = 'Pending'; }
  else if (isExpired)  { badgeClass = 'bg-slate-100 text-slate-500 border-slate-200'; badgeText = 'Expired'; }
  else                 { badgeClass = 'bg-rose-50 text-rose-600 border-rose-100';     badgeText = 'Rejected'; }

  const iconBg = isActive ? '#0b57d0' : isExpired ? '#94a3b8' : isPending ? '#f59e0b' : '#ef4444';
  return { isActive, isGateway, isPending, isExpired, isRejected, badgeClass, badgeText, iconBg };
}

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateTime(d: string) {
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}

export default async function SubscriptionHistoryPage() {
  const subscriptions = await getSubscriptionHistory();

  const activeCount   = subscriptions.filter((s: any) => getStatusInfo(s).isActive).length;
  const expiredCount  = subscriptions.filter((s: any) => getStatusInfo(s).isExpired).length;
  const pendingCount  = subscriptions.filter((s: any) => (s.status === 'pending' || s.status === 'pending_gateway')).length;
  const rejectedCount = subscriptions.filter((s: any) => s.status === 'rejected').length;

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pt-1">
        <Link href="/user/dashboard"
          className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-200">
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        </Link>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Subscription</p>
          <h1 className="text-[20px] font-black text-gray-900 tracking-tight leading-tight">History</h1>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-4 gap-2">
        {[
          ['Active', 'emerald', activeCount],
          ['Expired', 'slate', expiredCount],
          ['Pending', 'amber', pendingCount],
          ['Rejected', 'rose', rejectedCount],
        ].map(([label, color, cnt]) => (
          <div key={label as string} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 text-center">
            <p className={`text-[20px] font-black text-${color}-600 tabular-nums`}>{cnt as number}</p>
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{label as string}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {subscriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
          <svg className="w-10 h-10 text-slate-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
          <p className="text-[14px] font-bold text-slate-400">No Subscription History</p>
        </div>
      ) : (
        <div className="space-y-2">
          {subscriptions.map((sub: any) => {
            const { isActive, isGateway, isPending, isExpired, isRejected, badgeClass, badgeText, iconBg } = getStatusInfo(sub);
            const methodLabel = METHOD_LABELS[sub.payment_method] ?? sub.payment_method;
            const courseInitials = (sub.courses?.title ?? 'C').slice(0, 2).toUpperCase();

            return (
              <div key={sub.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Top row */}
                <div className="flex items-start gap-3 px-4 pt-3.5 pb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-[11px] font-black"
                       style={{ background: iconBg }}>
                    {courseInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-bold text-slate-800 leading-tight">{sub.courses?.title ?? 'Course Deleted'}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${badgeClass}`}>{badgeText}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">{sub.courses?.level}</p>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-px mx-4 mb-3.5 rounded-xl overflow-hidden bg-slate-100">
                  {[
                    ['Amount', `৳${Number(sub.amount_paid).toLocaleString('en-IN')}`],
                    ['Method', methodLabel],
                    ['Started', fmtDate(sub.starts_at)],
                    ['Expires', fmtDate(sub.expires_at)],
                  ].map(([lbl, val]) => (
                    <div key={lbl} className="bg-slate-50 px-3 py-2">
                      <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{lbl}</p>
                      <p className="text-[12px] font-bold text-slate-700 mt-0.5">{val}</p>
                    </div>
                  ))}
                </div>

                {/* Transaction ID */}
                {sub.transaction_id && (
                  <div className="mx-4 mb-3.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Transaction ID</p>
                    <p className="text-[12px] font-mono font-bold text-slate-700 mt-0.5">{sub.transaction_id}</p>
                  </div>
                )}

                {/* Coupon */}
                {(sub.coupon_code || Number(sub.discount_applied) > 0) && (
                  <div className="mx-4 mb-3.5 flex items-center gap-2">
                    {sub.coupon_code && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
                        🎟 {sub.coupon_code}
                      </span>
                    )}
                    {Number(sub.discount_applied) > 0 && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        -৳{Number(sub.discount_applied).toLocaleString()} Discount
                      </span>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                {isGateway && (
                  <div className="px-4 pb-3.5">
                    <div className="flex items-center gap-2 w-full py-2.5 px-3 rounded-xl bg-blue-50 border border-blue-200">
                      <svg className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                      <p className="text-[12px] font-bold text-blue-700">Processing in payment gateway...</p>
                    </div>
                  </div>
                )}
                {(isExpired || isRejected) && !isGateway && (
                  <div className="px-4 pb-3.5">
                    <Link href={`/courses/${sub.courses?.id}`}
                      className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-[12px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition border border-blue-100">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                      {isExpired ? 'Renew Now' : 'Try Again'}
                    </Link>
                  </div>
                )}

                <div className="px-4 pb-3 pt-0 flex justify-between items-center">
                  <p className="text-[10px] text-slate-400 font-medium tracking-wide">{fmtDateTime(sub.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
