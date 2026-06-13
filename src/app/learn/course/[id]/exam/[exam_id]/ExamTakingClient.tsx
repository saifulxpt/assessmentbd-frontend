'use client';

import { useState, useEffect, useRef } from 'react';
import { startExamAttempt, submitExam } from '@/app/actions/learning.actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const BENGALI_LABELS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];

export default function ExamTakingClient({
  exam,
  courseId,
  userPhone
}: {
  exam: any;
  courseId: string;
  userPhone: string;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const answeredCount = Object.keys(answers).length;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(exam.duration_minutes * 60);
  const [attemptId, setAttemptId] = useState<string | null>(exam.ongoingAttemptId ?? null);
  
  // Anti-cheat state
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [showBlackScreen, setShowBlackScreen] = useState(false);
  const [screenshotAttempts, setScreenshotAttempts] = useState(0);
  
  // UI filter & modals state
  const [filter, setFilter] = useState<'all' | 'answered' | 'unanswered'>('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const submittingRef = useRef(false);

  // Instructions screen vs active exam state
  const [started, setStarted] = useState(false);

  const triggerBlackScreen = () => {
    setScreenshotAttempts(prev => prev + 1);
    setShowBlackScreen(true);
    setTimeout(() => {
      navigator.clipboard.writeText('').catch(() => {});
    }, 50);
    setTimeout(() => {
      setShowBlackScreen(false);
    }, 3000);
  };

  const handleSubmit = async (autoSubmit = false, forceWarningsCount?: number) => {
    if (submittingRef.current || submitted) return;
    const finalTabSwitches = forceWarningsCount !== undefined ? forceWarningsCount : tabSwitches;

    if (!autoSubmit && answeredCount < exam.questions.length && timeLeft > 0) {
      if (!confirm('কিছু প্রশ্নের উত্তর দেওয়া হয়নি। তবুও কি জমা দেবেন?')) return;
    }
    if (!attemptId) {
      alert('পরীক্ষা শুরু হয়নি। পেজ রিলোড করুন।');
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setConfirmSubmit(false);

    try {
      const res = await submitExam(exam.id.toString(), attemptId, answers, finalTabSwitches);
      if ('success' in res && res.success) {
        setSubmitted(true);
        router.push(`/user/exam-history/${res.attemptId}`);
      } else if ('error' in res) {
        alert(res.error || 'জমা দিতে সমস্যা হয়েছে');
        submittingRef.current = false;
        setIsSubmitting(false);
      }
    } catch (err) {
      alert('একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // Prevent right-click, copy, cut, selection, dragstart during active exam
  useEffect(() => {
    if (!started) return;

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();
    const handleCut = (e: ClipboardEvent) => e.preventDefault();
    const handleSelectStart = (e: Event) => e.preventDefault();
    const handleDragStart = (e: Event) => e.preventDefault();

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, [started]);

  // Anti-cheat keyboard shortcuts & PrintScreen during active exam
  useEffect(() => {
    if (!started) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = (e.key || '').toLowerCase();
      
      // PrintScreen key
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        navigator.clipboard.writeText('Screenshot blocked — AssessmentBD').catch(() => {});
        triggerBlackScreen();
        return;
      }

      // Block Ctrl / Cmd combinations
      if (e.ctrlKey || e.metaKey) {
        const blocked = ['c', 'a', 'x', 'p', 's', 'u'];
        if (blocked.includes(k)) {
          e.preventDefault();
          return;
        }
        if (e.shiftKey && ['i', 'j', 'c'].includes(k)) {
          e.preventDefault();
          return;
        }
      }

      // F12 DevTools
      if (e.key === 'F12') {
        e.preventDefault();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [started]);

  // Tab switch detection during active exam
  useEffect(() => {
    if (!started) return;

    const handleVisibilityChange = () => {
      if (document.hidden && !submitted && !isSubmitting && !confirmSubmit) {
        setTabSwitches(prev => {
          const next = prev + 1;
          setShowWarning(true);
          if (next >= 3) {
            // Auto submit after warning
            setTimeout(() => {
              handleSubmit(true, next);
            }, 2000);
          }
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [started, submitted, isSubmitting, attemptId, answers, confirmSubmit]);

  // Timer during active exam
  useEffect(() => {
    if (!started || submitted || isSubmitting || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, timeLeft, submitted, isSubmitting]);

  const formatTime = (seconds: number) => {
    if (seconds < 0) return '∞';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selectAnswer = (questionId: string, optionId: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const isAnswered = (questionId: string) => {
    return Object.prototype.hasOwnProperty.call(answers, questionId);
  };

  const handleStartExam = async () => {
    if (attemptId) {
      setStarted(true);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await startExamAttempt(exam.id.toString());
      if ('attemptId' in res) {
        setAttemptId(res.attemptId);
        setStarted(true);
      } else {
        alert(res.error);
      }
    } catch (err) {
      alert('পরীক্ষা শুরু করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filterLabel = () => {
    if (filter === 'answered') return 'উত্তর দেওয়া';
    if (filter === 'unanswered') return 'বাকি আছে';
    return 'সবগুলো';
  };

  const shouldShowQuestion = (questionId: string) => {
    const answered = isAnswered(questionId);
    if (filter === 'all') return true;
    if (filter === 'answered') return answered;
    if (filter === 'unanswered') return !answered;
    return true;
  };

  const mcqQuestions = exam.questions.filter((q: any) => q.question_type === 'mcq');
  const totalQs = mcqQuestions.length;

  // Render start page if not started
  if (!started) {
    const isOngoing = !!exam.ongoingAttemptId;
    return (
      <div className="max-w-lg mx-auto space-y-4 py-8 px-4 sm:px-0 relative z-10">
        <style dangerouslySetInnerHTML={{__html: `
          .learn-sidebar { display: none !important; }
        `}} />
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
          {/* Dark gradient header */}
          <div className="px-6 py-7 text-white relative overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#1e3a8a]">
            <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/5 rounded-full" />
            <div className="absolute -bottom-6 -left-4 w-28 h-28 bg-white/5 rounded-full" />
            <div className="relative z-10">
              <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 11l3 3L22 4" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest mb-1">{exam.courses?.title}</p>
              <h1 className="text-[19px] font-black leading-snug">{exam.title}</h1>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100 bg-white">
            <div className="px-2 py-4 text-center">
              <p className="text-[19px] font-black text-slate-800">{totalQs}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">প্রশ্ন</p>
            </div>
            <div className="px-2 py-4 text-center">
              <p className="text-[19px] font-black text-slate-800">{exam.duration_minutes}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">মিনিট</p>
            </div>
            <div className="px-2 py-4 text-center">
              <p className="text-[19px] font-black text-slate-800">{exam.total_marks}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">মোট নম্বর</p>
            </div>
            <div className="px-2 py-4 text-center">
              <p className="text-[19px] font-black text-blue-600">{exam.pass_marks}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">পাস নম্বর</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="px-5 py-5 space-y-3 bg-white">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3.5">পরীক্ষার নির্দেশনা</p>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[13px] font-medium text-slate-600 leading-relaxed">পরীক্ষা শুরু হলে টাইমার শুরু হবে — সময় শেষে স্বয়ংক্রিয়ভাবে জমা হবে।</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[13px] font-medium text-slate-600 leading-relaxed">প্রতিটি MCQ প্রশ্নের একটিমাত্র সঠিক উত্তর আছে।</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
              </div>
              <p className="text-[13px] font-medium text-slate-600 leading-relaxed">সন্দেহজনক প্রশ্নে Flag করে পরে ফিরে আসতে পারবেন।</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <p className="text-[13px] font-medium text-slate-600 leading-relaxed">Question Palette থেকে যেকোনো প্রশ্নে সরাসরি যাওয়া যাবে।</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-[13px] font-medium text-rose-600 leading-relaxed">ট্যাব পরিবর্তন, Copy-Paste বা Screenshot সম্পূর্ণ নিষিদ্ধ।</p>
            </div>
          </div>

          {/* Ongoing Warning Banner */}
          {isOngoing && (
            <div className="mx-5 mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
              <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-[12px] font-semibold text-amber-800">একটি অসম্পূর্ণ পরীক্ষা আছে। আগের থেকে চালিয়ে যেতে পারবেন।</p>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="px-5 pb-6 bg-white">
            <button
              onClick={handleStartExam}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white text-[14px] transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: isOngoing ? '#d97706' : '#0b57d0' }}
            >
              {isOngoing ? (
                <>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {isSubmitting ? 'প্রক্রিয়া চলছে...' : 'পরীক্ষা চালিয়ে যান'}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {isSubmitting ? 'প্রক্রিয়া চলছে...' : 'পরীক্ষা শুরু করুন'}
                </>
              )}
            </button>
          </div>
        </div>

        <Link
          href={`/learn/course/${courseId}`}
          className="flex items-center justify-center gap-1.5 text-[12px] font-semibold text-slate-400 hover:text-slate-600 py-2 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          কোর্সে ফিরুন
        </Link>
      </div>
    );
  }

  return (
    <div className="relative exam-page select-none">
      {/* Anti-selection CSS injection */}
      <style dangerouslySetInnerHTML={{__html: `
        .exam-page, .exam-page * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
        }
        @media print {
          html, body { visibility: hidden !important; background: #000 !important; }
          * { display: none !important; }
        }
        .learn-sidebar, header, footer, #ann-bar { display: none !important; }
        #main-content { padding-top: 0 !important; }
      `}} />

      {/* Watermark Grid */}
      <div className="fixed inset-0 select-none pointer-events-none z-[1] overflow-hidden" style={{ opacity: 0.055 }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(6, 1fr)',
          gap: 0
        }}>
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{
                transform: 'rotate(-30deg)',
                fontSize: '13px',
                fontWeight: 900,
                whiteSpace: 'nowrap',
                letterSpacing: '.05em',
                color: '#000'
              }}>
                {userPhone} · AssessmentBD
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top sticky action nav */}
      <nav className="sticky top-0 left-0 right-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 text-slate-700 font-bold text-sm px-3 py-2 rounded-xl hover:bg-slate-100 transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <span>{filterLabel()}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-lg overflow-hidden z-50 min-w-[130px]">
                <button
                  onClick={() => { setFilter('all'); setDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition ${filter === 'all' ? 'text-emerald-600' : 'text-slate-700'}`}
                >
                  সবগুলো
                </button>
                <button
                  onClick={() => { setFilter('answered'); setDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition ${filter === 'answered' ? 'text-emerald-600' : 'text-slate-700'}`}
                >
                  উত্তর দেওয়া
                </button>
                <button
                  onClick={() => { setFilter('unanswered'); setDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition ${filter === 'unanswered' ? 'text-emerald-600' : 'text-slate-700'}`}
                >
                  বাকি আছে
                </button>
              </div>
            )}
          </div>

          {/* Time & answered counter */}
          <div className="flex items-center gap-3">
            {timeLeft >= 0 && (
              <div className={`font-mono font-bold text-sm px-2.5 py-1 rounded-lg border ${timeLeft <= 60 ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                {formatTime(timeLeft)}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-7 h-7 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center tabular-nums">
                {answeredCount}
              </span>
              <span className="text-slate-500 text-sm font-medium">/ {totalQs} উত্তর</span>
            </div>
          </div>
        </div>

        {/* Top Progress bar */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${totalQs > 0 ? (answeredCount / totalQs * 100) : 0}%` }}
          />
        </div>
      </nav>

      {/* Questions Scrollable List */}
      <main className="w-full max-w-2xl mx-auto px-4 py-4 pb-28 space-y-4 relative z-10">
        {exam.questions.map((q: any, index: number) => {
          const qId = q.id.toString();
          if (!shouldShowQuestion(qId)) return null;

          return (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
              style={{ boxShadow: '0 2px 12px rgba(15,23,42,.06)' }}
            >
              {/* Question Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-50">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold transition-colors ${isAnswered(qId) ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-white'}`}>
                  {index + 1}
                </div>
                <span className="flex-1 text-[12px] font-bold text-slate-400">
                  প্রশ্ন {index + 1} · {q.marks || 1} মার্ক
                </span>
                {isAnswered(qId) && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    দেওয়া হয়েছে
                  </span>
                )}
              </div>

              {/* Question Text */}
              <div className="px-4 pt-4 pb-3">
                <p className="text-[15px] font-bold text-slate-800 leading-relaxed">{q.question_text}</p>
              </div>

              {/* Options */}
              {q.question_type === 'mcq' ? (
                <div className="px-3 pb-3 space-y-2">
                  {q.question_options?.map((opt: any, oi: number) => {
                    const isSelected = answers[qId] === opt.id.toString();
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => selectAnswer(qId, opt.id.toString())}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border-2 text-left transition-all duration-150 ${isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white'}`}
                      >
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 text-[13px] font-bold transition-all ${isSelected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white text-slate-500'}`}>
                          {BENGALI_LABELS[oi] ?? String.fromCharCode(65 + oi)}
                        </div>
                        <span className="flex-1 text-[13px] font-medium text-slate-700 leading-snug">{opt.option_text}</span>
                        {isSelected && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-blue-50 border border-blue-100 text-sm text-blue-700 font-medium mx-4 mb-4 rounded-xl">
                  এটি একটি লিখিত প্রশ্ন। স্বয়ংক্রিয়ভাবে মূল্যায়ন হবে না।
                </div>
              )}
            </div>
          );
        })}
      </main>

      {/* Fixed Bottom Submit Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 pb-safe shadow-[0_-4px_20px_rgba(15,23,42,.08)]"
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-[12px] font-medium text-slate-500">
            <span className="font-bold text-slate-900 tabular-nums">{answeredCount}</span> / {totalQs} টি প্রশ্নের উত্তর দিয়েছেন
          </p>
          <button
            type="button"
            onClick={() => setConfirmSubmit(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white text-[13px] transition-all active:scale-[0.97] bg-[#16a34a] shadow-[0_4px_14px_-4px_rgba(22,163,74,0.6)] hover:bg-[#15803d]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            পরীক্ষা জমা দিন
          </button>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {confirmSubmit && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setConfirmSubmit(false)} />
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm relative z-10 text-center shadow-[0_20px_60px_rgba(15,23,42,.2)]">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-emerald-50">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="text-[18px] font-black text-slate-800 mb-1.5">জমা দিতে প্রস্তুত?</h3>
            <p className="text-slate-500 text-[13px] mb-6">
              আপনি <span className="font-bold text-emerald-600">{answeredCount}</span> টি প্রশ্নের উত্তর দিয়েছেন ({totalQs} টির মধ্যে)।
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmSubmit(false)}
                className="flex-1 py-3 rounded-xl font-bold text-[13px] text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                আরো দেখুন
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                className="flex-1 py-3 rounded-xl font-bold text-[13px] text-white transition bg-[#16a34a] hover:bg-[#15803d]"
              >
                জমা দিন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Black Screen Overlay */}
      {showBlackScreen && (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center select-none bg-black">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <line x1="12" y1="11" x2="12" y2="17" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p className="text-white font-black text-xl mt-5">Screenshot নিষিদ্ধ!</p>
          <p className="text-gray-500 text-sm mt-2 font-medium">পরীক্ষার সময় screenshot নেওয়া যাবে না।</p>
          <p className="text-gray-600 text-xs mt-6 font-medium">এই পরীক্ষা watermark করা আছে।</p>
        </div>
      )}

      {/* Tab-Switch Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm relative z-10 text-center">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="text-[22px] font-black text-slate-800 mb-3">সতর্কতা!</h3>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed text-[13px]">
              ট্যাব পরিবর্তন সীমাবদ্ধ। আরও <span className="text-rose-600 font-bold">{Math.max(0, 3 - tabSwitches)}</span> বার করলে পরীক্ষা স্বয়ংক্রিয়ভাবে জমা হবে।
            </p>
            <button
              onClick={() => setShowWarning(false)}
              type="button"
              className="w-full py-3 rounded-xl font-bold text-white text-[14px] bg-slate-800 hover:bg-slate-900 transition"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
