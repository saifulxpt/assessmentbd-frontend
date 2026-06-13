import { getExamAttemptResult } from '@/app/actions/results.actions';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const metadata = { title: 'পরীক্ষার ফলাফল - AssessmentBD' };

const LABELS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];

const BN_DIGITS: Record<string, string> = {
  '0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'
};
function bn(n: number): string {
  return Math.round(n).toString().replace(/[0-9]/g, d => BN_DIGITS[d]);
}

export default async function ExamResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const attempt = await getExamAttemptResult(id);
  if (!attempt) notFound();

  const mcqAnswers = (attempt.exam_answers ?? []).filter(
    (a: any) => a.questions?.question_type === 'mcq'
  );
  const correctCount = mcqAnswers.filter((a: any) => a.is_correct).length;
  const wrongCount   = mcqAnswers.filter((a: any) => !a.is_correct && a.selected_option_id).length;
  const skippedCount = mcqAnswers.filter((a: any) => !a.selected_option_id).length;
  const totalCount   = mcqAnswers.length;

  const passThreshold = attempt.exams?.total_marks > 0 && attempt.exams?.pass_marks > 0
    ? Math.round((attempt.exams.pass_marks / attempt.exams.total_marks) * 100)
    : 40;
  const pct = Math.round(Number(attempt.percentage));
  const passed = pct >= passThreshold;

  const gradientBg = passed
    ? 'linear-gradient(135deg,#059669 0%,#047857 50%,#065f46 100%)'
    : 'linear-gradient(135deg,#dc2626 0%,#b91c1c 50%,#9f1239 100%)';

  return (
    <div className="max-w-lg mx-auto relative z-10">
      {/* Score Card */}
      <div className="rounded-3xl overflow-hidden mb-4" style={{ background: gradientBg }}>
        {/* Exam title bar */}
        <div className="px-5 pt-4 pb-1 flex items-center gap-2.5">
          <div className="flex-1 min-w-0">
            <p className="text-white/50 text-[9px] font-bold uppercase tracking-widest truncate">{attempt.exams?.courses?.title ?? ''}</p>
            <p className="text-white text-[13px] font-bold truncate">{attempt.exams?.title}</p>
          </div>
        </div>
        <div className="px-5 pt-3 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-end gap-1 leading-none">
                <span className="text-[58px] font-black text-white leading-none">{bn(pct)}</span>
                <span className="text-[26px] font-bold text-white/60 mb-1">%</span>
              </div>
              <p className="text-white/70 text-[11px] font-semibold mt-1.5">
                {passed ? 'অভিনন্দন! উত্তীর্ণ হয়েছেন ✓' : 'আবার চেষ্টা করুন'}
              </p>
            </div>
            <div className="pt-1 space-y-2 text-right shrink-0">
              <div className="flex items-center justify-end gap-3">
                <span className="text-white/70 text-[12px] font-bold">✓ সঠিক</span>
                <span className="text-white text-[17px] font-black tabular-nums">{bn(correctCount)}/{bn(totalCount)}</span>
              </div>
              <div className="flex items-center justify-end gap-3">
                <span className="text-white/70 text-[12px] font-bold">× ভুল</span>
                <span className="text-white text-[17px] font-black tabular-nums">{bn(wrongCount)}</span>
              </div>
              <div className="flex items-center justify-end gap-3">
                <span className="text-white/70 text-[12px] font-bold">○ বাদ</span>
                <span className="text-white text-[17px] font-black tabular-nums">{bn(skippedCount)}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Action buttons */}
        <div className="grid grid-cols-2 divide-x divide-white/20 border-t border-white/20">
          <Link href={`/learn/course/${attempt.exams?.course_id}`}
            className="flex items-center justify-center gap-2 py-3.5 text-white font-bold text-[13px] hover:bg-white/10 transition">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            ফিরে যান
          </Link>
          <Link href={`/learn/course/${attempt.exams?.course_id}/exam/${attempt.exam_id}`}
            className="flex items-center justify-center gap-2 py-3.5 text-white font-bold text-[13px] hover:bg-white/10 transition">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.55"/></svg>
            আবার চেষ্টা
          </Link>
        </div>
      </div>

      {/* Question Review */}
      <div className="space-y-3 pb-8">
        {mcqAnswers.map((answer: any, idx: number) => {
          const isCorrect = answer.is_correct;
          const isSkipped = !answer.selected_option_id;
          const isWrong   = !isCorrect && !isSkipped;

          const headerBg = isCorrect ? 'bg-emerald-50' : isSkipped ? 'bg-slate-50' : 'bg-rose-50';
          const badgeBg  = isCorrect ? 'bg-emerald-500 text-white' : isSkipped ? 'bg-slate-400 text-white' : 'bg-rose-500 text-white';
          const statusText = isCorrect ? 'সঠিক উত্তর দিয়েছেন' : isSkipped ? 'বাদ দিয়েছেন' : 'ভুল উত্তর';
          const statusColor = isCorrect ? 'text-emerald-700' : isSkipped ? 'text-slate-500' : 'text-rose-700';

          return (
            <div key={answer.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100" style={{ boxShadow: '0 2px 12px rgba(15,23,42,.06)' }}>
              <div className={`flex items-center gap-2.5 px-4 py-2.5 ${headerBg}`}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-black ${badgeBg}`}>
                  {idx + 1}
                </div>
                <span className={`text-[11px] font-bold ${statusColor}`}>{statusText}</span>
              </div>

              <div className="px-4 pt-3 pb-2">
                <p className="text-[14px] font-bold text-slate-800 leading-relaxed">{answer.questions?.question_text}</p>
              </div>

              <div className="px-3 pb-3 space-y-1.5">
                {(answer.questions?.question_options ?? []).map((opt: any, optIdx: number) => {
                  const isOptCorrect  = opt.is_correct;
                  const isOptSelected = answer.selected_option_id === opt.id || answer.selected_option_id?.toString() === opt.id?.toString();
                  const isOptWrong    = isOptSelected && !opt.is_correct;

                  const optBg = isOptCorrect ? 'bg-emerald-50 border-emerald-200' : isOptWrong ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-transparent';
                  const circleBg = isOptCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : isOptWrong ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-slate-300 text-slate-500';
                  const textColor = isOptCorrect ? 'text-emerald-800' : isOptWrong ? 'text-rose-700 line-through' : 'text-slate-600';

                  return (
                    <div key={opt.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${optBg}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold border ${circleBg}`}>
                        {LABELS[optIdx] ?? String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className={`flex-1 text-[12px] font-medium ${textColor}`}>{opt.option_text}</span>
                      {isOptCorrect && <span className="text-[10px] font-bold text-emerald-600 shrink-0">সঠিক ✓</span>}
                      {isOptWrong   && <span className="text-[10px] font-bold text-rose-600 shrink-0">আপনার উত্তর ✗</span>}
                    </div>
                  );
                })}

                {answer.questions?.explanation && (
                  <div className="mt-1 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-100">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p className="text-[11px] font-medium text-blue-800 leading-relaxed">{answer.questions.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
