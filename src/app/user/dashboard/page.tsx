import { getStudentDashboardData } from '@/app/actions/user-dashboard.actions';
import Link from 'next/link';

export const metadata = {
  title: 'ড্যাশবোর্ড - AssessmentBD',
};

const BN_DIGITS: Record<string, string> = {
  '0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'
};
function bn(n: number): string {
  return n.toString().replace(/[0-9]/g, d => BN_DIGITS[d]);
}

export default async function DashboardPage() {
  const data = await getStudentDashboardData();
  const { user, activeSubscriptions, recentAttempts, pendingCount, referralCount, overallProgress } = data;

  const progressColor = overallProgress >= 80 ? 'text-green-600' : overallProgress >= 50 ? 'text-amber-600' : 'text-blue-600';

  return (
    <div className="space-y-6">

      {/* ── Profile & Stats Card ── */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <div className="shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar.startsWith('data:image/') ? user.avatar : user.avatar.startsWith('uploads/') ? `https://server.assessmentbd.com/${user.avatar}` : `https://server.assessmentbd.com/storage/${user.avatar}`}
                alt={user.name}
                className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border border-slate-100 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-sm bg-blue-600">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{user?.name}</h1>
            <p className="text-[13px] md:text-sm font-medium text-slate-500 mt-0.5">শিক্ষার্থী</p>
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 pt-5 md:pt-6">
          <div className="text-center px-2">
            <p className="text-xl md:text-2xl font-bold text-slate-800">{activeSubscriptions.length}</p>
            <p className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">কোর্স</p>
          </div>
          <div className="text-center px-2">
            <p className="text-xl md:text-2xl font-bold text-slate-800">{referralCount}</p>
            <p className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">রেফার করেছেন</p>
          </div>
          <div className="text-center px-2">
            <p className={`text-xl md:text-2xl font-bold ${progressColor}`}>{overallProgress}%</p>
            <p className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">কোর্স অগ্রগতি</p>
          </div>
        </div>
      </div>

      {/* ── Quick Shortcuts ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { href: '/user/my-courses',            label: 'Courses',  color: 'text-blue-600',    bg: 'bg-blue-50',    icon: (<svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>) },
          { href: '/user/profile?tab=wallet',    label: 'Wallet',   color: 'text-emerald-600', bg: 'bg-emerald-50', icon: (<svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>) },
          { href: '/user/referral',              label: 'Referral', color: 'text-purple-600',  bg: 'bg-purple-50',  icon: (<svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>) },
          { href: '/user/profile',               label: 'Profile',  color: 'text-slate-600',   bg: 'bg-slate-50',   icon: (<svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>) },
        ].map(({ href, label, color, bg, icon }) => (
          <Link key={label} href={href}
            className="bg-white hover:bg-slate-50 hover:shadow-md hover:-translate-y-1 border border-slate-200 transition-all duration-300 flex flex-col items-center justify-center py-5 md:py-6 rounded-2xl md:rounded-[1.5rem] shadow-sm">
            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3 ${bg}`}>
              <span className={color}>{icon}</span>
            </div>
            <span className="text-xs md:text-sm font-bold text-slate-700">{label}</span>
          </Link>
        ))}
      </div>

      {/* ── Pending Subscriptions Banner ── */}
      {pendingCount > 0 && (
        <Link href="/user/subscription-history" className="bg-amber-50 border border-amber-200 p-4 md:p-5 flex items-center gap-4 rounded-2xl">
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-white shadow-sm text-amber-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-amber-900">{pendingCount} Pending Subscriptions</p>
            <p className="text-sm font-medium mt-0.5 text-amber-700">আপনার পেমেন্ট ভেরিফাই করা হচ্ছে, অনুমোদনের পর কোর্স শুরু হবে।</p>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white border border-amber-100">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          </div>
        </Link>
      )}

      {/* ── No Active Subscription State ── */}
      {activeSubscriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-8 md:p-10 text-center max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">প্রস্তুতি শুরু করুন</h2>
            <p className="text-slate-600 font-medium mb-8 text-sm md:text-base leading-relaxed">NSDA অ্যাসেসমেন্টের পূর্ণাঙ্গ প্রস্তুতি নিতে আপনার পছন্দের কোর্সে এনরোল করুন। রিয়েল-টাইম মডেল অ্যাসেসমেন্ট দিয়ে নিজের দক্ষতা যাচাই করুন।</p>
            <Link href="/courses" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              কোর্স সমূহ দেখুন
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* ── Active Courses ── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">আমার কোর্স সমূহ</h2>
              <Link href="/user/my-courses" className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">সব দেখুন</Link>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {activeSubscriptions.slice(0, 4).map((sub: any) => (
                <div key={sub.id} className="bg-white border border-slate-200 rounded-[1.5rem] flex flex-col p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4 md:gap-5 mb-5 md:mb-6">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-100 shrink-0 shadow-sm bg-gradient-to-br from-blue-600 to-indigo-600">
                      <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                    </div>
                    <div className="flex-1 min-w-0 mt-1">
                      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 mb-1">
                        <p className="text-base md:text-lg font-bold text-slate-800 line-clamp-2 md:line-clamp-1 leading-snug">{sub.courses?.title}</p>
                        {sub.plan === 'pro' && (
                          <span className="shrink-0 inline-flex self-start md:self-auto text-[10px] font-bold text-white px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">PRO</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-500 truncate">{sub.courses?.category ?? 'Course'}</p>
                    </div>
                  </div>
                  <Link href={`/learn/course/${sub.course_id}`}
                    className="mt-auto block w-full text-center py-3 md:py-3.5 rounded-xl md:rounded-xl font-bold text-sm bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-blue-700 transition-colors">
                    কোর্সটি দেখুন
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* ── Recent Results ── */}
          {recentAttempts.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4 mt-8">
                <h2 className="text-lg font-bold text-slate-800">সাম্প্রতিক রেজাল্ট</h2>
                <Link href="/user/exam-history" className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">সব দেখুন</Link>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
                {recentAttempts.slice(0, 3).map((att: any) => {
                  const pct = Math.round(Number(att.percentage));
                  const sClr = pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-rose-600';
                  const sBg  = pct >= 80 ? 'bg-green-50 border-green-100' : pct >= 50 ? 'bg-amber-50 border-amber-100' : 'bg-rose-50 border-rose-100';
                  return (
                    <Link key={att.id} href={`/user/exam-history/${att.id}`}
                      className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group">
                      <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 border ${sBg} ${sClr}`}>
                        <span className="text-lg font-bold tabular-nums leading-none">{pct}</span>
                        <span className="text-[10px] font-bold mt-0.5">%</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold text-slate-800 truncate">{att.exams?.title ?? 'Assessment'}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">{Number(att.score)}/{att.total_marks} marks</span>
                          <span className="text-xs font-medium text-slate-400">
                            {att.completed_at ? new Date(att.completed_at).toLocaleDateString('bn-BD') : ''}
                          </span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white border border-slate-200 text-slate-400 group-hover:border-slate-300 group-hover:text-slate-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
