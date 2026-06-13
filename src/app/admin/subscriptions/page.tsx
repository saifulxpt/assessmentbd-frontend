import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { approveSubAction, rejectSubAction } from '@/app/actions/admin-subscription.actions';

function fmtDate(d: Date | null | string, time = false) {
  if (!d) return '—';
  const dt = d instanceof Date ? d : new Date(d);
  const dateStr = dt.toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' });
  if (!time) return dateStr;
  return dateStr + ' · ' + dt.toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' });
}

const methodMeta: Record<string, { label: string; color: string }> = {
  bkash:      { label: 'bKash',      color: 'bg-pink-100 text-pink-700' },
  nagad:      { label: 'Nagad',       color: 'bg-orange-100 text-orange-700' },
  wallet:     { label: 'Wallet',      color: 'bg-emerald-100 text-emerald-700' },
  manual:     { label: 'Manual',      color: 'bg-slate-100 text-slate-600' },
  sslcommerz: { label: 'SSLCommerz', color: 'bg-blue-100 text-blue-700' },
  aamarpay:   { label: 'AamarPay',   color: 'bg-violet-100 text-violet-700' },
  piprapay:   { label: 'PipraPay 💳', color: 'bg-indigo-100 text-indigo-700' },
};
const statusBadge: Record<string, { cls: string; label: string }> = {
  pending:         { cls: 'bg-amber-50 text-amber-700 border border-amber-200',     label: '⏳ Pending' },
  pending_gateway: { cls: 'bg-blue-50 text-blue-700 border border-blue-200',        label: '🔄 Processing' },
  approved:        { cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200', label: '✅ Active' },
  active:          { cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200', label: '✅ Active' },
  expired:         { cls: 'bg-slate-100 text-slate-500',                              label: '⌛ Expired' },
  rejected:        { cls: 'bg-red-50 text-red-700 border border-red-200',            label: '❌ Rejected' },
  cancelled:       { cls: 'bg-slate-100 text-slate-400',                              label: '🚫 Cancelled' },
};

export default async function AdminSubscriptionsPage(props: {
  searchParams: Promise<{ status?: string; plan?: string; method?: string; search?: string; date_from?: string; date_to?: string; page?: string }>;
}) {
  const sp = await props.searchParams;
  const page = Math.max(1, parseInt(sp.page || '1', 10));
  const perPage = 25;

  const where: Record<string, unknown> = {};
  if (sp.status)    where.status = sp.status;
  if (sp.plan)      where.plan = sp.plan;
  if (sp.method)    where.payment_method = sp.method;
  if (sp.date_from || sp.date_to) {
    const created_at: Record<string, Date> = {};
    if (sp.date_from) created_at.gte = new Date(sp.date_from);
    if (sp.date_to)   created_at.lte = new Date(sp.date_to + 'T23:59:59');
    where.created_at = created_at;
  }
  if (sp.search) {
    Object.assign(where, {
      OR: [
        { users: { name:   { contains: sp.search } } },
        { users: { mobile: { contains: sp.search } } },
        { transaction_id:  { contains: sp.search } },
      ]
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [total, subs, stats] = await Promise.all([
    prisma.subscriptions.count({ where }),
    prisma.subscriptions.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        users:   { select: { id: true, name: true, mobile: true } },
        courses: { select: { title: true } },
      },
    }),
    Promise.all([
      prisma.subscriptions.count({ where: { status: 'pending' } }),
      prisma.subscriptions.count({ where: { status: 'active', expires_at: { gt: new Date() } } }),
      prisma.subscriptions.count({ where: { status: 'active', plan: 'basic', expires_at: { gt: new Date() } } }),
      prisma.subscriptions.count({ where: { status: 'active', plan: 'pro',   expires_at: { gt: new Date() } } }),
      prisma.subscriptions.count({ where: { status: 'active', amount_paid: 0, expires_at: { gt: new Date() } } }),
      prisma.subscriptions.aggregate({ _sum: { amount_paid: true }, where: { status: 'active', created_at: { gte: today } } }),
      prisma.subscriptions.aggregate({ _sum: { amount_paid: true }, where: { status: 'active', created_at: { gte: monthStart } } }),
    ]).then(([pending, active, basic, pro, free, todayRev, monthRev]) => ({
      pending, active, active_basic: basic, active_pro: pro, active_free: free,
      revenue_today: Number(todayRev._sum.amount_paid ?? 0),
      revenue_month: Number(monthRev._sum.amount_paid ?? 0),
    })),
  ]);

  const lastPage = Math.max(1, Math.ceil(total / perPage));

  const kpiCards = [
    { label: 'Pending Approval',     value: stats.pending,       cls: sp.status === 'pending' ? 'ring-2 ring-amber-400' : '',   href: '?status=pending',                      bg: 'bg-amber-100',  color: 'text-amber-600',   icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2' },
    { label: 'Active Subscriptions', value: stats.active,        cls: sp.status === 'active' && !sp.plan ? 'ring-2 ring-emerald-400' : '', href: '?status=active', bg: 'bg-emerald-100', color: 'text-emerald-600', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
    { label: 'Active Basic',          value: stats.active_basic,  cls: sp.plan === 'basic' ? 'ring-2 ring-indigo-400' : '',      href: '?status=active&plan=basic',            bg: 'bg-indigo-100', color: 'text-indigo-600',  icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10' },
    { label: 'Active Pro',            value: stats.active_pro,    cls: sp.plan === 'pro' ? 'ring-2 ring-amber-400' : '',         href: '?status=active&plan=pro',              bg: 'bg-amber-100',  color: 'text-amber-500',   icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
    { label: 'Active Free',           value: stats.active_free,   cls: '',                                                        href: '?status=active&plan=free',             bg: 'bg-fuchsia-100',color: 'text-fuchsia-600', icon: 'M20 12V22H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z' },
    { label: 'Revenue Today',         value: '৳' + stats.revenue_today.toLocaleString('en-BD'), cls: '', href: '#', bg: 'bg-emerald-100', color: 'text-emerald-600', icon: 'M22 7l-8-5-8 5m0 0v7l8 5 8-5V7' },
    { label: 'This Month',            value: '৳' + stats.revenue_month.toLocaleString('en-BD'), cls: '', href: '#', bg: 'bg-indigo-100',  color: 'text-indigo-600',  icon: 'M18 20V10M12 20V4M6 20v-6' },
  ];

  return (
    <div className="space-y-5">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-7 gap-4">
        {kpiCards.map(k => (
          <Link key={k.label} href={`/admin/subscriptions${k.href}`}
            className={`sd-card p-4 group cursor-pointer ${k.cls}`}>
            <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center mb-2`}>
              <svg className={`w-4 h-4 ${k.color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={k.icon}/></svg>
            </div>
            <p className="text-2xl font-black text-slate-900 tabular-nums">{k.value}</p>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{k.label}</p>
          </Link>
        ))}
      </div>

      {/* Filter */}
      <div className="sd-card p-4">
        <form method="GET" className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Search</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input type="text" name="search" defaultValue={sp.search} className="sd-input !pl-8 text-[13px]" placeholder="Name, mobile, or TrxID..." />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Status</label>
            <select name="status" className="sd-input text-[13px]" style={{ minWidth: 140 }} defaultValue={sp.status ?? ''}>
              <option value="">All Status</option>
              <option value="pending">⏳ Pending</option>
              <option value="pending_gateway">🔄 Gateway</option>
              <option value="approved">✅ Active</option>
              <option value="expired">⌛ Expired</option>
              <option value="rejected">❌ Rejected</option>
              <option value="cancelled">🚫 Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Plan</label>
            <select name="plan" className="sd-input text-[13px]" style={{ minWidth: 110 }} defaultValue={sp.plan ?? ''}>
              <option value="">All Plans</option>
              <option value="basic">Basic</option>
              <option value="pro">★ Pro</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Method</label>
            <select name="method" className="sd-input text-[13px]" style={{ minWidth: 130 }} defaultValue={sp.method ?? ''}>
              <option value="">All Methods</option>
              {Object.entries(methodMeta).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wide">From</label>
            <input type="date" name="date_from" defaultValue={sp.date_from} className="sd-input text-[13px]" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wide">To</label>
            <input type="date" name="date_to" defaultValue={sp.date_to} className="sd-input text-[13px]" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-brand !py-2.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filter
            </button>
            {(sp.search || sp.status || sp.plan || sp.method || sp.date_from || sp.date_to) && (
              <Link href="/admin/subscriptions" className="btn-outline !py-2.5">Clear</Link>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="sd-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <p className="text-[13px] font-bold text-slate-600">{total} subscription{total !== 1 ? 's' : ''} found</p>
          <p className="text-[11px] text-slate-400 font-medium">Page {page} of {lastPage}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="sd-table w-full text-left">
            <thead>
              <tr>
                <th className="min-w-[170px]">Trainee</th>
                <th className="min-w-[180px]">Course</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Method</th>
                <th className="min-w-[140px]">Transaction ID</th>
                <th>Status</th>
                <th>Submitted</th>
                <th className="min-w-[140px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {subs.length === 0 && (
                <tr><td colSpan={9} className="py-16 text-center">
                  <p className="font-bold text-slate-400">No subscriptions found</p>
                  <p className="text-[12px] text-slate-300 mt-1">Try adjusting your filters</p>
                </td></tr>
              )}
              {subs.map(sub => {
                const mm = methodMeta[sub.payment_method ?? ''] ?? { label: sub.payment_method ?? '—', color: 'bg-slate-100 text-slate-600' };
                const sb = statusBadge[sub.status ?? ''] ?? { cls: 'bg-slate-100 text-slate-500', label: sub.status ?? '—' };
                const isPending = sub.status === 'pending';
                const expiresAt = sub.expires_at ? new Date(sub.expires_at) : null;
                const daysLeft = expiresAt ? Math.floor((expiresAt.getTime() - Date.now()) / 86400000) : null;
                return (
                  <tr key={Number(sub.id)} className={isPending ? 'bg-amber-50/40' : ''}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-black shrink-0" style={{ background: '#0b57d0' }}>
                          {(sub.users?.name ?? 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/admin/users/${Number(sub.user_id)}`} className="font-bold text-[13px] text-slate-800 hover:text-emerald-600 transition-colors">
                            {sub.users?.name ?? '—'}
                          </Link>
                          <p className="text-[11px] text-slate-400 font-medium">{sub.users?.mobile ?? '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="font-semibold text-[13px] text-slate-700 leading-tight max-w-[180px] truncate">{sub.courses?.title ?? '—'}</p>
                      {sub.status === 'active' && expiresAt && (
                        <p className={`text-[10px] font-semibold mt-0.5 ${expiresAt < new Date() ? 'text-red-500' : daysLeft! <= 7 ? 'text-amber-500' : 'text-emerald-600'}`}>
                          {expiresAt < new Date() ? 'Expired' : `${daysLeft} days left`}
                        </p>
                      )}
                    </td>
                    <td>
                      {sub.plan === 'pro'
                        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>⭐ Pro</span>
                        : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-500 bg-slate-100">Basic</span>
                      }
                    </td>
                    <td>
                      <p className="font-black text-[13px] text-emerald-600">৳{Number(sub.amount_paid ?? 0).toLocaleString('en-BD')}</p>
                      {Number(sub.discount_applied ?? 0) > 0 && <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">-৳{Number(sub.discount_applied).toLocaleString('en-BD')} off</p>}
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${mm.color}`}>{mm.label}</span>
                    </td>
                    <td>
                      {sub.transaction_id
                        ? <span className="text-[11px] font-mono text-slate-600 max-w-[120px] truncate block" title={sub.transaction_id}>{sub.transaction_id}</span>
                        : <span className="text-slate-300">—</span>
                      }
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${sb.cls}`}>{sb.label}</span>
                    </td>
                    <td>
                      <p className="text-[12px] font-semibold text-slate-600">{sub.created_at ? new Date(sub.created_at).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p>
                      <p className="text-[10px] text-slate-400">{sub.created_at ? new Date(sub.created_at).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                    </td>
                    <td>
                      {isPending ? (
                        <div className="flex gap-1.5">
                          <form action={approveSubAction}>
                            <input type="hidden" name="id" value={Number(sub.id)} />
                            <button type="submit" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              Approve
                            </button>
                          </form>
                          <form action={rejectSubAction}>
                            <input type="hidden" name="id" value={Number(sub.id)} />
                            <button type="submit" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-200">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              Reject
                            </button>
                          </form>
                        </div>
                      ) : sub.status === 'active' ? (
                        <Link href={`/admin/users/${Number(sub.user_id)}`} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          View User
                        </Link>
                      ) : <span className="text-[11px] font-medium text-slate-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[12px] text-slate-400 font-medium">Showing {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} of {total}</p>
          <div className="flex gap-2">
            {page > 1
              ? <Link href={`/admin/subscriptions?${new URLSearchParams({ ...sp, page: String(page - 1) }).toString()}`} className="px-4 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">Prev</Link>
              : <span className="px-4 py-2 text-xs font-bold text-slate-400 bg-slate-50 rounded-lg cursor-not-allowed">Prev</span>
            }
            {page < lastPage
              ? <Link href={`/admin/subscriptions?${new URLSearchParams({ ...sp, page: String(page + 1) }).toString()}`} className="px-4 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">Next</Link>
              : <span className="px-4 py-2 text-xs font-bold text-slate-400 bg-slate-50 rounded-lg cursor-not-allowed">Next</span>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
