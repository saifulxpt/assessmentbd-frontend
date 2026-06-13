import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { approveSubAction, rejectSubAction } from '@/app/actions/admin-subscription.actions';

// ─── helpers ────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString('en-BD');
}
function timeAgo(date: Date) {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── page ───────────────────────────────────────────────────────────
export default async function AdminDashboardPage() {

  const [
    totalUsers, verifiedUsers, totalCourses, totalRevenue,
    activeSubscriptions, activeBasic, activePro,
    totalExamsTaken, pendingSubs, recentUsers,
  ] = await Promise.all([
    prisma.users.count(),
    prisma.users.count({ where: { is_verified: true } }),
    prisma.courses.count({ where: { is_active: true } }),
    prisma.subscriptions.aggregate({ _sum: { amount_paid: true }, where: { status: 'active' } }).then(r => Number(r._sum.amount_paid ?? 0)),
    prisma.subscriptions.count({ where: { status: 'active', expires_at: { gt: new Date() } } }),
    prisma.subscriptions.count({ where: { status: 'active', plan: 'basic', expires_at: { gt: new Date() } } }),
    prisma.subscriptions.count({ where: { status: 'active', plan: 'pro',   expires_at: { gt: new Date() } } }),
    prisma.exam_attempts.count({ where: { status: 'completed' } }),
    prisma.subscriptions.findMany({
      where: { status: 'pending' },
      orderBy: { created_at: 'desc' },
      take: 15,
      include: { users: { select: { name: true } }, courses: { select: { title: true } } },
    }),
    prisma.users.findMany({
      where: { is_admin: false },
      orderBy: { created_at: 'desc' },
      take: 15,
      select: { id: true, name: true, mobile: true, is_verified: true, created_at: true },
    }),
  ]);

  const stats = [
    { label: 'Total Users',    value: fmt(totalUsers),             sub: `${fmt(verifiedUsers)} Verified`,  icon: 'users',        color: 'text-blue-600',    bg: 'bg-blue-50' },
    { label: 'Active Courses', value: fmt(totalCourses),           sub: 'Published courses',               icon: 'book-open',    color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Revenue',        value: '৳' + fmt(totalRevenue),    sub: 'Total earnings',                  icon: 'pie-chart',    color: 'text-violet-600',  bg: 'bg-violet-50' },
    { label: 'Active Subs',    value: fmt(activeSubscriptions),    sub: `${activeBasic} Basic, ${activePro} Pro`, icon: 'credit-card', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Exams Taken',    value: fmt(totalExamsTaken),        sub: 'Completed attempts',              icon: 'check-circle', color: 'text-rose-600',    bg: 'bg-rose-50' },
  ];

  const iconPath: Record<string, string> = {
    'users':        'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    'book-open':    'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
    'pie-chart':    'M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z',
    'credit-card':  'M0 0h24v14H0z M4 14v2 M20 14v2',
    'check-circle': 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3',
  };

  return (
    <div className="space-y-6">

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Welcome back, Admin! 👋</h1>
          <p className="text-[13px] font-medium text-slate-500 mt-1">Here is what&apos;s happening on your platform today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/courses/builder" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-[13px] font-bold transition-colors shadow-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            New Course
          </Link>
          <Link href="/admin/exams" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-[13px] font-bold transition-colors shadow-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
            Question Bank
          </Link>
          <Link href="/admin/settings" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl text-[13px] font-bold transition-colors shadow-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            Settings
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} group-hover:scale-105 transition-transform`}>
                <svg className={`w-5 h-5 ${stat.color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={iconPath[stat.icon]} />
                </svg>
              </div>
              <p className="text-[13px] font-bold text-slate-600">{stat.label}</p>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 3-Column Panels */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Pending Subscriptions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[460px]">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
            <h2 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              Action Required: Pending Approvals
            </h2>
            <Link href="/admin/subscriptions?status=pending" className="text-[12px] font-bold text-emerald-600 hover:underline">View All</Link>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {pendingSubs.length > 0 ? (
              <div className="space-y-3">
                {pendingSubs.map((sub) => (
                  <div key={Number(sub.id)} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-white transition-colors shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-100">
                      {(sub.users?.name ?? 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-bold text-slate-800 truncate">{sub.users?.name}</p>
                        {sub.plan === 'pro' && <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 border border-indigo-200 px-1.5 py-0.5 rounded uppercase tracking-wider">Pro</span>}
                      </div>
                      <p className="text-[11px] font-semibold text-slate-500 truncate mt-0.5">{sub.courses?.title}</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-1">{sub.created_at ? timeAgo(new Date(sub.created_at)) : ''}</p>
                    </div>
                    <div className="text-right shrink-0 px-3">
                      <p className="text-[14px] font-black text-slate-800">৳{fmt(Number(sub.amount_paid ?? 0))}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0 border-l border-slate-100 pl-3">
                      <form action={approveSubAction}>
                        <input type="hidden" name="id" value={Number(sub.id)} />
                        <button type="submit" className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-600 flex items-center justify-center transition-colors" title="Approve">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                      </form>
                      <form action={rejectSubAction}>
                        <input type="hidden" name="id" value={Number(sub.id)} />
                        <button type="submit" className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 flex items-center justify-center transition-colors" title="Reject">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <p className="text-[14px] font-bold text-slate-600">You&apos;re all caught up!</p>
                <p className="text-[12px] font-medium text-slate-400 mt-0.5">No pending subscriptions to review.</p>
              </div>
            )}
          </div>
        </div>

        {/* Support & Messages placeholder */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[460px]">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
            <h2 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-4 h-4 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Support &amp; Messages
            </h2>
            <Link href="/admin/support" className="text-[12px] font-bold text-emerald-600 hover:underline">View All</Link>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
            </div>
            <p className="text-[14px] font-bold text-slate-600">Inbox Zero!</p>
            <p className="text-[12px] font-medium text-slate-500 mt-0.5">No unread support or contact messages.</p>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[460px]">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
            <h2 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              New Registrations
            </h2>
            <Link href="/admin/users" className="text-[12px] font-bold text-emerald-600 hover:underline">View All</Link>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {recentUsers.length > 0 ? (
              <div className="space-y-2">
                {recentUsers.map((user) => (
                  <Link key={Number(user.id)} href={`/admin/users/${Number(user.id)}`} className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:bg-slate-50 hover:border-slate-100 transition-all group">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-100">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-slate-800 truncate group-hover:text-emerald-600 transition-colors">{user.name}</p>
                      <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">{user.mobile}</p>
                    </div>
                    <div className="shrink-0 text-right pr-2">
                      <p className="text-[10px] font-bold text-slate-400 mb-1">{user.created_at ? timeAgo(new Date(user.created_at)) : ''}</p>
                      {user.is_verified
                        ? <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded">Verified</span>
                        : <span className="bg-slate-50 text-slate-500 border border-slate-200 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded">Unverified</span>
                      }
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <p className="text-[14px] font-bold text-slate-600">No recent users.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
