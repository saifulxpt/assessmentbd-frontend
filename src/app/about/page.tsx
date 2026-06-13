import Link from 'next/link';

export const metadata = {
  title: 'Assessment Portal সম্পর্কে | AssessmentBD',
  description: 'Assessment Portal - বাংলাদেশের কারিগরি সেক্টরের (TVET) ট্রেইনিদের জন্য তৈরি একটি আস্থার জায়গা।',
};

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative overflow-hidden" 
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #0f172a 100%)' }}
      >
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle at 15% 60%, rgba(59, 130, 246, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)' }}
        />
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-center relative z-10">
          <span 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4 border animate-pulse" 
            style={{ background: 'rgba(59,130,246,.15)', color: '#93c5fd', borderColor: 'rgba(59,130,246,.3)' }}
          >
            আমাদের পরিচিতি
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-5">
            স্কিলড বাংলাদেশ গড়ার<br />
            <span style={{ color: '#60a5fa' }}>এক ক্ষুদ্র প্রয়াস</span>
          </h1>
          <p className="text-slate-300 text-[15px] md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            কারিগরি শিক্ষায় আমাদের দেশের ট্রেইনিরা প্র্যাকটিক্যাল কাজে অসম্ভব দক্ষ। কিন্তু থিওরি বা MCQ-এর অভাবে যেন তারা পিছিয়ে না পড়ে, সেই উদ্দেশ্যেই Assessment Portal-এর পথচলা।
          </p>
        </div>
      </div>

      {/* Story & Mission Grid */}
      <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          <div className="space-y-6">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">আমাদের গল্প</h2>
            <p className="text-slate-600 leading-relaxed font-medium text-[17px]">
              যখনই ফাইনাল অ্যাসেসমেন্টে Written বা MCQ টেস্ট আসে, তখন অনেকেই ইংরেজি টার্ম বা রুলস বুঝতে না পেরে <strong>'Not Yet Competent (NYC)'</strong> হয়ে যায়। বারবার রিঅ্যাসেসমেন্ট ফি দেওয়ার হতাশা দূর করতেই আমরা এই রিয়েল-টাইম প্র্যাকটিস প্ল্যাটফর্ম তৈরি করেছি।
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">আমাদের লক্ষ্য</h2>
            <p className="text-slate-600 leading-relaxed font-medium text-[17px]">
              দেশের কারিগরি দক্ষতাকে আন্তর্জাতিক মানে পৌঁছে দিতে এবং সবাইকে স্কিলড ওয়ার্কার হিসেবে গড়ে তুলতে আমরা একটি নির্ভুল ও সাশ্রয়ী ডিজিটাল গাইডলাইন তৈরি করতে কাজ করে যাচ্ছি।
            </p>
          </div>
        </div>
      </div>

      {/* Social Promise */}
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">আমাদের মানবিক উদ্যোগ</h2>
        <p className="text-slate-600 text-lg font-medium leading-relaxed mb-8 max-w-2xl mx-auto">
          আমরা বিশ্বাস করি, স্কিল ডেভেলপমেন্ট সবার অধিকার। টাকার অভাবে কারো প্রস্তুতি যেন থেমে না থাকে! যদি কোনো ট্রেইনির ফি দেওয়ার সামর্থ্য না থাকে, তবে আমাদের Support Team-কে জানালে আমরা সম্পূর্ণ ফ্রিতে সাবস্ক্রিপশন অ্যাক্সেস দিয়ে দিই।
        </p>
      </div>

      {/* Disclaimer & CTA */}
      <div className="max-w-3xl mx-auto px-4 pb-24">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center mb-12">
          <p className="text-amber-900 text-[15px] font-bold mb-2">Important Disclaimer</p>
          <p className="text-amber-800 text-[13px] font-medium leading-relaxed">
            Assessment Portal একটি স্বতন্ত্র বেসরকারি প্ল্যাটফর্ম। এটি NSDA বা বাংলাদেশ সরকারের কোনো সংস্থার সাথে অনুমোদিত বা সংযুক্ত নয়। এখানকার প্রশ্নসমূহ কেবল অনুশীলন ও জ্ঞান উন্নয়নের উদ্দেশ্যে প্রদান করা হয়।
          </p>
        </div>

        <div className="text-center">
          <Link 
            href="/login" 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-black text-white transition-all hover:opacity-90 hover:scale-105 shadow-xl shadow-blue-600/30 text-[17px] bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            লগইন / শুরু করুন
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
