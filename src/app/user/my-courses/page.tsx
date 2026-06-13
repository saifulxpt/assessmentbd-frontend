import { getMyCourses } from '@/app/actions/user-dashboard.actions';
import Link from 'next/link';

export const metadata = {
  title: 'আমার Occupation - AssessmentBD',
};

function getStatusInfo(sub: any): { isActive: boolean; isPending: boolean; isExpired: boolean; isRejected: boolean } {
  const now = new Date();
  const expiresAt = sub.expires_at ? new Date(sub.expires_at) : null;
  const isActive = sub.status === 'active' && (expiresAt ? expiresAt > now : true);
  const isPending = sub.status === 'pending' || sub.status === 'pending_gateway';
  const isExpired  = sub.status === 'expired' || (sub.status === 'active' && !!expiresAt && expiresAt <= now);
  const isRejected = sub.status === 'rejected' || sub.status === 'cancelled';
  return { isActive, isPending, isExpired, isRejected };
}

function calcProgress(sub: any, attemptCounts: Record<string, { cnt: number; best: number }>) {
  const units = sub.courses?.course_units ?? [];
  const courseExams = sub.courses?.exams ?? [];
  const useExamsAsUnits = units.length === 0 && courseExams.length > 0;
  const totalUnits = useExamsAsUnits ? courseExams.length : units.length;
  let masteredUnits = 0;

  if (totalUnits > 0) {
    if (useExamsAsUnits) {
      for (const exam of courseExams) {
        const agg = attemptCounts[exam.id.toString()];
        if (agg && Math.round(agg.best) >= 100) masteredUnits++;
      }
    } else {
      for (const unit of units) {
        let unitBest = 0, unitCnt = 0;
        for (const exam of unit.exams) {
          const agg = attemptCounts[exam.id.toString()];
          if (agg) { unitBest = Math.max(unitBest, agg.best); unitCnt += agg.cnt; }
        }
        if (unitCnt > 0 && Math.round(unitBest) >= 100) masteredUnits++;
      }
    }
  }

  const progressPct = totalUnits > 0 ? Math.round((masteredUnits / totalUnits) * 100) : 0;
  const totalExams = courseExams.length;
  const totalAttempted = courseExams.filter((e: any) => !!attemptCounts[e.id.toString()]).length;
  return { progressPct, totalExams, totalAttempted };
}

export default async function MyCoursesPage() {
  const { subscriptions, attemptCounts } = await getMyCourses();
  const activeCount = subscriptions.filter((s: any) => {
    const { isActive } = getStatusInfo(s);
    return isActive;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">আমার Occupation</p>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {activeCount}<span className="text-sm font-semibold text-slate-400 ml-1">টি Active</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/user/subscription-history"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            History
          </Link>
          <Link href="/courses"
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-xl transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            নতুন
          </Link>
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <div className="col-span-full bg-white rounded-2xl border border-slate-200 px-6 py-16 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1.5">এখনো কোনো Occupation নেই</h3>
          <p className="text-sm font-medium text-slate-500 mb-6">NSDA Assessment-এ Competent (C) পেতে আজই আপনার Occupation বেছে প্রস্তুতি শুরু করুন</p>
          <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            Occupation দেখুন ও কিনুন
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {subscriptions.map((sub: any) => {
            const { isActive, isPending, isExpired, isRejected } = getStatusInfo(sub);
            const { progressPct, totalExams, totalAttempted } = calcProgress(sub, attemptCounts);
            const expiresAt = sub.expires_at ? new Date(sub.expires_at) : null;
            const daysLeft = expiresAt ? Math.floor((expiresAt.getTime() - Date.now()) / 86400000) : null;

            return (
              <Link key={sub.id} href={`/learn/course/${sub.course_id}`}
                className={`block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col ${isExpired || isRejected ? 'opacity-70 hover:opacity-100' : ''}`}>
                <div className="p-5 flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">{sub.courses?.title}</h3>
                      </div>
                      <div className="flex items-center flex-wrap gap-2">
                        {sub.courses?.level && (
                          <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">{sub.courses.level}</span>
                        )}
                        {isActive && (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-100 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/>Active
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"/>যাচাই চলছে
                          </span>
                        )}
                        {isRejected && <span className="inline-block bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Rejected</span>}
                        {isExpired && !isRejected && <span className="inline-block bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Expired</span>}
                      </div>
                    </div>
                  </div>

                  {isActive && (
                    <>
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                          <span>Course Progress</span>
                          <span className="text-blue-600 font-extrabold">{progressPct}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}/>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 pt-3">
                        <div className="px-2 text-center">
                          {daysLeft !== null ? (
                            <>
                              <p className={`text-sm font-black ${daysLeft <= 7 ? 'text-rose-500' : daysLeft <= 30 ? 'text-amber-500' : 'text-slate-800'}`}>{daysLeft}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">দিন বাকি</p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-black text-slate-300">—</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">দিন বাকি</p>
                            </>
                          )}
                        </div>
                        <div className="px-2 text-center">
                          <p className="text-sm font-black text-slate-800">{totalExams}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">পরীক্ষা</p>
                        </div>
                        <div className="px-2 text-center">
                          <p className="text-sm font-black text-blue-600">{totalAttempted}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">দেওয়া হয়েছে</p>
                        </div>
                      </div>
                    </>
                  )}
                  {isPending && (
                    <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      <div>
                        <p className="text-[13px] font-bold text-amber-800">অনুমোদনের অপেক্ষায়</p>
                        <p className="text-xs text-amber-700 font-medium mt-0.5">Admin অনুমোদন করলে সক্রিয় হবে।</p>
                      </div>
                    </div>
                  )}
                  {isRejected && (
                    <div className="flex items-start gap-3 p-3 bg-rose-50 rounded-xl border border-rose-100">
                      <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      <div>
                        <p className="text-[13px] font-bold text-rose-800">সাবস্ক্রিপশন বাতিল</p>
                        <p className="text-xs text-rose-700 font-medium mt-0.5">আপনার সাবস্ক্রিপশন অনুরোধটি বাতিল করা হয়েছে।</p>
                      </div>
                    </div>
                  )}
                  {isExpired && !isRejected && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 mt-2">
                      <p className="text-[12px] text-slate-500 font-bold">এই কোর্সটির মেয়াদ শেষ হয়েছে।</p>
                      <span className="text-[12px] font-bold text-blue-600 flex items-center gap-0.5">
                        নবায়ন করুন
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
