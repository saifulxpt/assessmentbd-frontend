import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { toggleUserAction, deleteUserAction } from '@/app/actions/admin-user.actions';

function fmtDate(d: Date | null | string) {
  if (!d) return '';
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' });
}
function waLink(mobile: string | null) {
  if (!mobile) return '#';
  const n = mobile.replace(/[^0-9]/g, '');
  return `https://wa.me/${n.length === 11 && n.startsWith('01') ? '88' + n : n}`;
}

export default async function AdminUsersPage(props: {
  searchParams: Promise<{ tab?: string; search?: string; verified?: string; page?: string }>;
}) {
  const sp = await props.searchParams;
  const tab = sp.tab === 'staff' ? 'staff' : 'users';
  const search = sp.search || '';
  const verifiedFilter = sp.verified;
  const page = Math.max(1, parseInt(sp.page || '1', 10));
  const perPage = 20;

  // ── trainees ──────────────────────────────────────────
  const where = {
    is_admin: false,
    ...(search ? {
      OR: [
        { name: { contains: search } },
        { mobile: { contains: search } },
      ]
    } : {}),
    ...(verifiedFilter !== undefined && verifiedFilter !== '' ? { is_verified: verifiedFilter === '1' } : {}),
  };

  const [total, users] = await Promise.all([
    tab === 'users' ? prisma.users.count({ where }) : 0,
    tab === 'users' ? prisma.users.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      select: { id: true, name: true, mobile: true, wallet_balance: true, is_verified: true, is_active: true, suspicious_flag: true, created_at: true },
    }) : [],
  ]);

  const staff = tab === 'staff' ? await prisma.users.findMany({
    where: { is_admin: true },
    orderBy: { created_at: 'asc' },
  }) : [];

  const lastPage = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="space-y-5">

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
        <Link href="/admin/users"
          className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'users' ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Trainees
        </Link>
        <Link href="/admin/users?tab=staff"
          className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'staff' ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
          Staff
        </Link>
      </div>

      {tab === 'users' && <>
        {/* Search */}
        <div className="sd-card p-4">
          <form method="GET" className="flex flex-col sm:flex-row gap-2.5 items-center">
            <input type="hidden" name="tab" value="users" />
            <div className="relative w-full sm:flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input type="text" name="search" defaultValue={search} placeholder="Search by name or mobile..." className="sd-input w-full pl-10" />
            </div>
            <select name="verified" className="sd-input sm:w-44" defaultValue={verifiedFilter ?? ''}>
              <option value="">All Verification</option>
              <option value="1">Verified</option>
              <option value="0">Unverified</option>
            </select>
            <button type="submit" className="btn-brand w-full sm:w-auto px-6">Search</button>
            {(search || verifiedFilter) && (
              <Link href="/admin/users" className="btn-outline w-full sm:w-auto text-center">Clear</Link>
            )}
          </form>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block sd-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="sd-table w-full text-left">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Wallet</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="font-medium">কোনো ব্যবহারকারী পাওয়া যায়নি।</p>
                  </td></tr>
                ) : users.map(u => (
                  <tr key={Number(u.id)} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{u.name}</span>
                    </td>
                    <td className="font-medium text-slate-600 py-3 px-4">{u.mobile}</td>
                    <td className="font-bold text-emerald-600 py-3 px-4">৳{Number(u.wallet_balance ?? 0).toLocaleString('en-BD')}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {u.is_verified ? <span className="badge-active">Verified</span> : <span className="badge-inactive">Unverified</span>}
                        {!u.is_active && <span className="badge-danger">Inactive</span>}
                        {u.suspicious_flag && <span className="badge-danger">⚠️ Suspicious</span>}
                      </div>
                    </td>
                    <td className="text-xs font-medium text-slate-400 py-3 px-4">{fmtDate(u.created_at)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1.5 flex-wrap opacity-80 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/users/${Number(u.id)}`} className="btn-outline px-2.5 py-1.5 text-xs">Details</Link>
                        <a href={waLink(u.mobile)} target="_blank" rel="noopener noreferrer"
                          className="btn-outline px-2.5 py-1.5 text-xs flex items-center gap-1"
                          style={{ color: '#059669', borderColor: '#a7f3d0' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                          WhatsApp
                        </a>
                        <form action={toggleUserAction}>
                          <input type="hidden" name="userId" value={Number(u.id)} />
                          <button type="submit" className={`btn-outline px-2.5 py-1.5 text-xs ${u.is_active ? '!text-rose-600 !border-rose-200 hover:!bg-rose-50' : '!text-emerald-600 !border-emerald-200 hover:!bg-emerald-50'}`}>
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </form>
                        <form action={deleteUserAction} onSubmit={e => { if (!confirm('Permanently delete this user? This cannot be undone.')) e.preventDefault(); }}>
                          <input type="hidden" name="userId" value={Number(u.id)} />
                          <button type="submit" className="btn-outline px-2.5 py-1.5 text-xs !text-rose-600 !border-rose-200 hover:!bg-rose-50">Delete</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Page {page} of {lastPage} ({total} total)
            </span>
            <div className="flex gap-2">
              {page > 1
                ? <Link href={`/admin/users?tab=users&search=${search}&verified=${verifiedFilter ?? ''}&page=${page - 1}`} className="px-4 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">Prev</Link>
                : <span className="px-4 py-2 text-xs font-bold text-slate-400 bg-slate-50 rounded-lg cursor-not-allowed">Prev</span>
              }
              {page < lastPage
                ? <Link href={`/admin/users?tab=users&search=${search}&verified=${verifiedFilter ?? ''}&page=${page + 1}`} className="px-4 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">Next</Link>
                : <span className="px-4 py-2 text-xs font-bold text-slate-400 bg-slate-50 rounded-lg cursor-not-allowed">Next</span>
              }
            </div>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {users.length === 0 && (
            <div className="sd-card p-10 text-center"><p className="text-slate-400 font-semibold">No trainees found.</p></div>
          )}
          {users.map(u => (
            <div key={Number(u.id)} className="sd-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-800">{u.name}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{u.mobile}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {u.is_verified ? <span className="badge-active">Verified</span> : <span className="badge-inactive">Unverified</span>}
                  {!u.is_active && <span className="badge-danger">Inactive</span>}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
                <span className="text-emerald-600 font-bold">৳{Number(u.wallet_balance ?? 0).toLocaleString('en-BD')}</span>
                <span>Joined {fmtDate(u.created_at)}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <Link href={`/admin/users/${Number(u.id)}`} className="btn-outline py-1.5 text-xs text-center">View</Link>
                <a href={waLink(u.mobile)} target="_blank" rel="noopener noreferrer" className="btn-outline py-1.5 text-xs text-center !text-emerald-600 !border-emerald-200">WhatsApp</a>
              </div>
            </div>
          ))}
        </div>
      </>}

      {tab === 'staff' && (
        <div className="sd-card overflow-hidden">
          {staff.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
              </div>
              <p className="font-bold text-slate-500">No staff accounts yet</p>
              <p className="text-sm text-slate-400 mt-1">Add a staff member to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="sd-table w-full text-left">
                <thead>
                  <tr><th>Staff Member</th><th>Mobile</th><th>Role</th><th>Added</th></tr>
                </thead>
                <tbody>
                  {staff.map(m => (
                    <tr key={Number(m.id)}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-black text-sm bg-emerald-100 text-emerald-700">
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <p className="font-bold text-slate-800 text-sm">{m.name}</p>
                        </div>
                      </td>
                      <td className="font-medium text-slate-500 text-sm">{m.mobile}</td>
                      <td>
                        {m.admin_role === 'super_admin'
                          ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Super Admin</span>
                          : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Admin</span>
                        }
                      </td>
                      <td className="text-xs text-slate-400 font-medium">{fmtDate(m.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
