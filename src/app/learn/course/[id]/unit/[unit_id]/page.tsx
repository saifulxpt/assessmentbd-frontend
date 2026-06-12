'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function UnitPage({ params }: { params: Promise<{ id: string, unit_id: string }> }) {
  const { id, unit_id } = use(params);
  const { token, isAuthenticated, isLoading } = useAuth();
  const [unit, setUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [examStarted, setExamStarted] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const router = useRouter();

  // 1. Fetch unit details
  useEffect(() => {
    const fetchUnitDetail = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://server.assessmentbd.com/api'}/user/learn/course/${id}/unit/${unit_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        const result = await res.json();
        if (result.success) {
          setUnit(result.data);
        } else {
          // Access denied or not found
          console.error(result.message);
        }
      } catch (err) {
        console.error("Failed to fetch unit detail", err);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && isAuthenticated) {
      fetchUnitDetail();
    }
  }, [token, isLoading, isAuthenticated, id, unit_id]);

  // 2. Exam Timer Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examStarted && timeLeft !== null && timeLeft > 0 && !examResult) {
      timer = setInterval(() => setTimeLeft((prev) => (prev ? prev - 1 : 0)), 1000);
    } else if (timeLeft === 0 && examStarted && !examResult) {
      // Auto submit when time is up
      submitExam();
    }
    return () => clearInterval(timer);
  }, [examStarted, timeLeft, examResult]);

  // Start Exam
  const startExam = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://server.assessmentbd.com/api'}/user/learn/exam/${unit.exam.id}/questions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const result = await res.json();
      if (result.success) {
        setQuestions(result.data.questions);
        setExamStarted(true);
        setTimeLeft(result.data.exam.duration * 60); // minutes to seconds
      }
    } catch (err) {
      console.error("Failed to load questions", err);
    } finally {
      setLoading(false);
    }
  };

  // Submit Exam
  const submitExam = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://server.assessmentbd.com/api'}/user/learn/exam/${unit.exam.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ answers })
      });
      const result = await res.json();
      if (result.success) {
        setExamResult(result.data);
      }
    } catch (err) {
      console.error("Failed to submit exam", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOptionChange = (questionId: number, optionId: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  if (loading || isLoading) {
    return <div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
  }

  if (!unit) return <div className="p-8 text-center text-red-500">Unit not found or access denied.</div>;

  // Render Video Unit
  if (unit.type === 'video') {
    return (
      <div className="p-6 md:p-10 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{unit.title}</h1>
        
        <div className="bg-black rounded-xl overflow-hidden shadow-lg aspect-video mb-8">
          {unit.video_type === 'youtube' ? (
            <iframe 
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${unit.video_url.split('v=')[1]?.split('&')[0] || unit.video_url.split('/').pop()}`}
              title={unit.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : unit.video_type === 'vimeo' ? (
            <iframe 
              className="w-full h-full"
              src={`https://player.vimeo.com/video/${unit.video_url.split('/').pop()}`}
              title={unit.title}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <video className="w-full h-full" controls>
              <source src={unit.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-2">About this lesson</h3>
          <p className="text-gray-600">Watch the video carefully. You can re-watch it as many times as you need.</p>
        </div>
      </div>
    );
  }

  // Render Exam Unit
  if (unit.type === 'exam') {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto">
        
        {/* Exam Intro Screen */}
        {!examStarted && !examResult && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center max-w-2xl mx-auto mt-10">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{unit.exam.title}</h1>
            
            {unit.exam.attempted ? (
              <div className="mt-8">
                <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-lg mb-2">You have already completed this exam!</h3>
                  <p className="text-3xl font-black">{unit.exam.score} / {unit.exam.total_marks}</p>
                </div>
                <button disabled className="bg-gray-300 text-gray-600 font-bold py-3 px-8 rounded-lg cursor-not-allowed">
                  Exam Completed
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4 mt-8 mb-8 border-y border-gray-100 py-6">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Duration</p>
                    <p className="text-xl font-bold text-gray-900">{unit.exam.duration} Min</p>
                  </div>
                  <div className="border-x border-gray-100">
                    <p className="text-sm text-gray-500 font-medium">Total Marks</p>
                    <p className="text-xl font-bold text-gray-900">{unit.exam.total_marks}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Pass Marks</p>
                    <p className="text-xl font-bold text-gray-900">{unit.exam.pass_marks}</p>
                  </div>
                </div>
                <button 
                  onClick={startExam}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors w-full sm:w-auto"
                >
                  Start Exam Now
                </button>
              </>
            )}
          </div>
        )}

        {/* Active Exam Interface */}
        {examStarted && !examResult && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between sticky top-0 z-10">
              <h2 className="font-bold text-lg text-gray-900">{unit.exam.title}</h2>
              <div className={`font-mono text-xl font-bold px-4 py-2 rounded-lg ${timeLeft !== null && timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-700'}`}>
                {timeLeft !== null ? `${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}` : '--:--'}
              </div>
            </div>

            <div className="space-y-8">
              {questions.map((q, index) => (
                <div key={q.id} className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-start mb-6">
                    <span className="flex-shrink-0 bg-blue-100 text-blue-700 font-bold w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-0.5">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900" dangerouslySetInnerHTML={{ __html: q.question_text }}></h3>
                      <span className="inline-block mt-2 text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        Marks: {q.marks}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pl-12">
                    {q.options.map((opt: any) => (
                      <label 
                        key={opt.id} 
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${answers[q.id] === opt.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                      >
                        <input
                          type="radio"
                          name={`question_${q.id}`}
                          value={opt.id}
                          checked={answers[q.id] === opt.id}
                          onChange={() => handleOptionChange(q.id, opt.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-gray-700" dangerouslySetInnerHTML={{ __html: opt.option_text }}></span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
              <button 
                onClick={submitExam}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-12 rounded-lg shadow-lg transition-colors text-lg disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Exam'}
              </button>
            </div>
          </div>
        )}

        {/* Exam Results */}
        {examResult && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center max-w-2xl mx-auto mt-10">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${examResult.status === 'passed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {examResult.status === 'passed' ? (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              ) : (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {examResult.status === 'passed' ? 'Congratulations! You Passed' : 'Exam Failed'}
            </h1>
            
            <div className="bg-gray-50 rounded-xl p-8 mt-8 mb-8 grid grid-cols-2 gap-6 divide-x divide-gray-200">
              <div>
                <p className="text-gray-500 font-medium mb-1">Your Score</p>
                <p className={`text-4xl font-black ${examResult.status === 'passed' ? 'text-green-600' : 'text-red-600'}`}>
                  {examResult.score} <span className="text-xl text-gray-400">/ {examResult.total_marks}</span>
                </p>
              </div>
              <div>
                <div className="flex justify-around text-left">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Correct</p>
                    <p className="font-bold text-green-600">{examResult.correct}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Wrong</p>
                    <p className="font-bold text-red-600">{examResult.wrong}</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setExamStarted(false);
                setExamResult(null);
                // Can trigger refresh of unit data to show completed state
                window.location.reload();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors"
            >
              Back to Course
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
