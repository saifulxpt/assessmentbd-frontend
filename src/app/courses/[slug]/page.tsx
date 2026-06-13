import { getCourseBySlug } from '@/app/actions/public-course.actions';
import { prisma, getCachedSettings } from '@/lib/prisma';
import { getSession } from '@/lib/auth-utils';

import { getResourceUrl } from '@/lib/api';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

function getStableHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// Awaited params in Next.js 15+
export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const course = await getCourseBySlug(params.slug);
  if (!course) return { title: 'Course Not Found' };

  const occName = course.occupation || course.title;
  const level = course.level || '';
  const sector = course.sector || course.category || 'NSDA';
  const uocPreview = course.course_units?.slice(0, 4).map((u: any) => u.title).join(', ') || '';

  return {
    title: course.seo_title || `${occName} NSDA Assessment Question Bank, MCQ ও Written প্রস্তুতি | AssessmentBD`,
    description: course.seo_description || `NSDA ${occName} (${level}) CBT&A Assessment-এর সম্পূর্ণ প্রস্তুতি — UoC-wise MCQ, Written Question Bank, Tools & Equipment List ও CBT&A Standard Model Assessment. ${uocPreview ? `UoC: ${uocPreview}.` : ''} সাবস্ক্রিপশন প্ল্যানের মাধ্যমে আজই প্রস্তুতি শুরু করুন।`,
    keywords: course.seo_keywords || `nsda ${occName.toLowerCase()} question bank, ${occName.toLowerCase()} assessment question, ${occName.toLowerCase()} written question answer, nsda ${occName.toLowerCase()} mcq, cbt&a ${occName.toLowerCase()} preparation, nsda ${level.toLowerCase()} ${sector.toLowerCase()} question, nsda assessment tools`,
  };
}

export default async function CourseDetailsPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const course = await getCourseBySlug(params.slug);

  if (!course) {
    notFound();
  }

  // Handle Numeric ID Slug Redirect
  const isNumeric = /^\d+$/.test(params.slug);
  if (isNumeric && course.slug) {
    redirect(`/courses/${course.slug}`);
  }

  // Fetch Session and Subscription details
  const session = await getSession();
  const userId = session?.userId ? BigInt(session.userId) : null;

  let isSubscribed = false;
  if (userId) {
    const activeSub = await prisma.subscriptions.findFirst({
      where: {
        user_id: userId,
        course_id: BigInt(course.id),
        status: 'active',
        expires_at: { gt: new Date() }
      }
    });
    isSubscribed = !!activeSub;
  }

  // Fetch Settings
  const settingsMap = await getCachedSettings();


  const basicPrice = parseFloat(settingsMap['basic_plan_price'] || '99');
  const proPrice = parseFloat(settingsMap['pro_plan_price'] || '299');

  // hasQuestions logic
  const hasQuestionsCount = await prisma.questions.count({
    where: { course_id: BigInt(course.id) }
  });
  const hasUnitWrittenQaCount = await prisma.unit_written_qas.count({
    where: { course_units: { course_id: BigInt(course.id) } }
  });
  const hasQuestions = hasQuestionsCount > 0 || hasUnitWrittenQaCount > 0;

  // WhatsApp logic
  const occName = course.occupation || course.title;
  const sectorName = course.sector || course.category || 'NSDA';
  const level = course.level || '';
  const uocList = course.course_units && course.course_units.length > 0 ? course.course_units : (course.exams || []);
  const unitCount = uocList.length;

  const rawWa = (settingsMap['site_whatsapp'] || '8801603409757').replace(/[^0-9]/g, '');
  const waNumber = (rawWa.length === 11 && rawWa.startsWith('01')) ? '88' + rawWa : (rawWa || '8801603409757');
  const waText = encodeURIComponent(`আসসালামু আলাইকুম। আমি NSDA ${occName} (${level}) -এর প্রশ্ন ব্যাংক কিনতে আগ্রহী। কিন্তু এখনো কোনো প্রশ্ন যোগ হয়নি। অনুগ্রহ করে জানান কখন প্রশ্ন ব্যাংক তৈরি হবে।`);
  const waLink = `https://wa.me/${waNumber}?text=${waText}`;

  // Fake Rating/Reviews (stable hashing)
  const hash = getStableHash(course.title);
  const fakeRating = (4.8 + (hash % 2) / 10).toFixed(1);
  const fakeReviewCount = 120 + (hash % 180);

  const enrollUrl = `/checkout/${course.id}`;

  let thumbnailSrc = '';
  if (course.thumbnail) {
    if (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('storage/') || course.thumbnail.startsWith('/storage/')) {
      thumbnailSrc = getResourceUrl(course.thumbnail);
    } else {
      thumbnailSrc = getResourceUrl('storage/' + course.thumbnail);
    }
  }

  return (
    <>
      {/* Sticky Mobile CTA */}
      {!isSubscribed && hasQuestions && (
        <div 
          className="fixed bottom-0 left-0 w-full z-50 p-3 lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)] bg-white/90 backdrop-blur-xl border-t border-slate-200" 
          id="sticky-cta"
        >
          <div className="flex items-center justify-between gap-3 max-w-4xl mx-auto pr-[70px]">
            <div className="flex-1 min-w-0 hidden sm:block">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Premium Access</p>
              <p className="text-sm font-black text-slate-900 truncate">Unlock All UoC</p>
            </div>
            <Link 
              href={enrollUrl} 
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-sm font-black text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/30"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              এখনই কিনুন
            </Link>
          </div>
        </div>
      )}

      <main className="pb-24 lg:pb-12 bg-slate-50 min-h-screen">
        {/* Hero Banner Section */}
        <div className="relative bg-slate-900 overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-800">
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[80%] bg-blue-600 rounded-full mix-blend-screen filter blur-[120px]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[80%] bg-purple-600 rounded-full mix-blend-screen filter blur-[120px]"></div>
          </div>
          <div className="max-w-4xl mx-auto px-4 relative z-10">
            <div className="flex flex-col items-center gap-10">
              
              <div className="flex-1 text-center">
                <div className="inline-flex flex-wrap justify-center items-center gap-2 mb-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20 backdrop-blur-sm">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                    {sectorName}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 backdrop-blur-sm">
                    BNQF {level}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] mb-5">
                  {course.title}
                </h1>
                
                <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto mb-8">
                  NSDA CBT&A পদ্ধতিতে <strong className="text-white">MCQ ও Written Question</strong> প্র্যাকটিস করে Final Assessment-এ <span className="text-yellow-400">Competent (C)</span> হতে আজই প্রস্তুতি শুরু করুন।
                </p>
                <div className="flex flex-wrap justify-center items-center gap-4">
                  {isSubscribed ? (
                    <Link 
                      href={`/learn/course/${course.id}`}
                      className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black text-white bg-green-600 hover:bg-green-500 transition-all shadow-lg shadow-green-600/20 active:scale-95"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                      ড্যাশবোর্ডে যান
                    </Link>
                  ) : (
                    <>
                      {hasQuestions ? (
                        <Link 
                          href={enrollUrl}
                          className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 active:scale-95"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <line x1="19" y1="8" x2="19" y2="14"/>
                            <line x1="22" y1="11" x2="16" y2="11"/>
                          </svg>
                          কোর্সটি এনরোল করুন
                        </Link>
                      ) : (
                        <a 
                          href={waLink} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black text-white bg-[#25D366] hover:bg-[#20bd5a] transition-all shadow-lg shadow-[#25D366]/30 active:scale-95"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          অ্যাডমিনকে রিকুয়েস্ট করুন
                        </a>
                      )}
                      <a 
                        href="#syllabus" 
                        className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                        </svg>
                        সিলেবাস দেখুন
                      </a>
                    </>
                  )}
                </div>
                
                <div className="mt-8 flex flex-wrap justify-center items-center gap-x-6 gap-y-3">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5 text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-300">{fakeRating}/5.0</span>
                  </div>
                  <span className="text-slate-500 text-xs">•</span>
                  <span className="text-xs font-bold text-slate-300">{fakeReviewCount} টি রিভিউ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb Navigation Bar */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-xs md:text-sm text-slate-500 font-medium overflow-x-auto whitespace-nowrap hide-scrollbar">
              <Link href="/" className="hover:text-blue-600 transition-colors shrink-0">Home</Link>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="shrink-0">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              <Link href="/courses" className="hover:text-blue-600 transition-colors shrink-0">Courses</Link>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="shrink-0">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              <span className="text-slate-800 font-semibold truncate">{course.title}</span>
            </nav>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-4 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Main Content */}
            <div className="order-2 lg:order-1 lg:col-span-2 space-y-12">
              {course.description && (
                <section>
                  <h2 className="text-2xl font-black text-slate-900 mb-6">Course Overview</h2>
                  <div 
                    className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-sm md:text-base whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: course.description }}
                  />
                </section>
              )}

              {/* Why choose card deck */}
              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-6">কেন AssessmentBD-তে প্রস্তুতি নিবেন?</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow duration-300">
                    <h3 className="text-base font-bold text-slate-800 mb-2">১. রিঅ্যাসেসমেন্ট ফি বাঁচান</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      ফাইনাল অ্যাসেসমেন্টে Not Yet Competent (NYC) হয়ে পুনরায় ফি দেওয়ার টেনশন কেন? মূল অ্যাসেসমেন্টের আগেই আমাদের পোর্টালে নিজেকে যাচাই করে প্রথমবারেই আপনার &apos;Competent&apos; হওয়া নিশ্চিত করুন।
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow duration-300">
                    <h3 className="text-base font-bold text-slate-800 mb-2">২. ৫০% মানি-ব্যাক গ্যারান্টি (Pro Plan)</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      আমাদের প্রস্তুতির ওপর আমরা ১০০% কনফিডেন্ট! আমাদের মডেল অ্যাসেসমেন্টগুলোতে পাস করার পরও রিয়েল NSDA অ্যাসেসমেন্টে যদি দুর্ভাগ্যবশত NYC হন, তবে আমরা দিচ্ছি ৫০% সাবস্ক্রিপশন ফি রিফান্ড।
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow duration-300">
                    <h3 className="text-base font-bold text-slate-800 mb-2">৩. CS অনুযায়ী MCQ ও Written প্রস্তুতি</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      শুধু প্র্যাকটিক্যাল পারলেই তো হবে না! Competency Standard (CS) অনুযায়ী MCQ এবং লিখিত (Written) অ্যাসেসমেন্টের জন্য সবচেয়ে গুরুত্বপূর্ণ প্রশ্ন, উত্তর ও গাইডলাইনগুলো আপনি এখানেই পেয়ে যাচ্ছেন।
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow duration-300">
                    <h3 className="text-base font-bold text-slate-800 mb-2">৪. সাথে সাথেই রেজাল্ট ও ব্যাখ্যা</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      অনলাইনে মডেল অ্যাসেসমেন্ট সাবমিট করার সাথে সাথেই জেনে নিন আপনি Competent (C) নাকি Not Yet Competent (NYC)। কোথায় ভুল হয়েছে এবং তার সঠিক উত্তর কী—সেটি বিস্তারিত এক্সপ্লানেশন সহ দেখে নিন।
                    </p>
                  </div>
                </div>
              </section>

              {/* Course Syllabus */}
              {unitCount > 0 && (
                <section id="syllabus" className="scroll-mt-24">
                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">Course Syllabus</h2>
                      <p className="text-sm text-slate-500 font-medium mt-1">Competency Standard (CS) — {unitCount} Units of Competency</p>
                    </div>
                    {!isSubscribed && (
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-800 rounded-lg text-xs font-bold border border-yellow-200">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        Locked content
                      </span>
                    )}
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="divide-y divide-slate-100">
                      {uocList.map((unit: any, i: number) => (
                        <div key={unit.id || i} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors group">
                          <div className="flex items-start gap-4">
                            <div className="shrink-0 w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm border border-blue-100">
                              {String(i + 1).padStart(2, '0')}
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">
                                {unit.title}
                              </h3>
                              <div className="flex items-center gap-3 mt-3">
                                {isSubscribed ? (
                                  <>
                                    <Link 
                                      href={`/learn/course/${course.id}`}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 transition"
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12 8 12 12 14 14"/>
                                      </svg> 
                                      MCQ Test
                                    </Link>
                                    <Link 
                                      href={`/learn/course/${course.id}`}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-purple-600 hover:bg-purple-700 transition"
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                      </svg> 
                                      Written Q&A
                                    </Link>
                                  </>
                                ) : (
                                  <>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200">
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                      </svg> 
                                      MCQ Locked
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200">
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                      </svg> 
                                      Written Locked
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {!isSubscribed && hasQuestions && (
                      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-slate-200 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <h4 className="text-base font-black text-slate-900">সম্পূর্ণ কোর্সটি আনলক করুন</h4>
                          <p className="text-xs text-slate-500 font-medium mt-1">যেকোনো একটি সাবস্ক্রিপশন প্ল্যান নিয়ে পেয়ে যান সকল {unitCount} ইউনিটের ফুল অ্যাক্সেস।</p>
                        </div>
                        <Link 
                          href={enrollUrl} 
                          className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-black text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 text-center"
                        >
                          সাবস্ক্রিপশন প্ল্যান দেখুন
                        </Link>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="order-1 lg:order-2 lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                  {/* Thumbnail Container */}
                  <div className="w-full aspect-video bg-slate-100 relative">
                    {thumbnailSrc ? (
                      <img 
                        src={thumbnailSrc} 
                        alt={`${course.title} NSDA Question`} 
                        title={`${course.title} NSDA Question`} 
                        className="absolute inset-0 w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    {hasQuestions ? (
                      <>
                        {/* Price boxes */}
                        <div className="mb-6 grid grid-cols-2 gap-3">
                          <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                            <span className="text-xs font-bold text-slate-500 mb-1">Basic (১ মাস)</span>
                            <span className="text-xl font-black text-slate-900">৳{basicPrice.toFixed(0)}</span>
                          </div>
                          <div className="flex flex-col items-center justify-center bg-blue-50 border border-blue-200 rounded-xl p-3 text-center relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-12 h-12 bg-blue-100 rounded-full"></div>
                            <span className="text-xs font-bold text-blue-700 mb-1 relative z-10">Pro (৩ মাস)</span>
                            <span className="text-xl font-black text-blue-700 relative z-10">৳{proPrice.toFixed(0)}</span>
                          </div>
                        </div>

                        {/* CTA button */}
                        {isSubscribed ? (
                          <Link 
                            href={`/learn/course/${course.id}`}
                            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-black text-white bg-green-600 hover:bg-green-700 transition shadow-lg shadow-green-600/20 mb-6"
                          >
                            ড্যাশবোর্ডে যান 
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="9 18 15 12 9 6"/>
                            </svg>
                          </Link>
                        ) : (
                          <Link 
                            href={enrollUrl}
                            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-black text-white bg-[#0b57d0] hover:bg-blue-800 transition shadow-lg shadow-blue-600/20 mb-6"
                          >
                            কোর্সটি এনরোল করুন 
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="9 18 15 12 9 6"/>
                            </svg>
                          </Link>
                        )}

                        {/* Metadata List */}
                        <ul className="space-y-4 text-sm text-slate-600 font-medium border-t border-slate-100 pt-6">
                          <li className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                              </svg>
                              <span>মেয়াদ</span>
                            </div>
                            <span className="font-bold text-slate-800">প্ল্যান অনুযায়ী</span>
                          </li>
                          <li className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                              </svg>
                              <span>অ্যাক্সেস</span>
                            </div>
                            <span className="font-bold text-slate-800">ফুল অ্যাক্সেস</span>
                          </li>
                          <li className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                              </svg>
                              <span>সাপোর্ট</span>
                            </div>
                            <span className="font-bold text-slate-800">24/7 সাপোর্ট</span>
                          </li>
                        </ul>
                      </>
                    ) : (
                      <div className="text-center space-y-4 py-4">
                        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 8 12 12 12 16"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                        </div>
                        <h3 className="text-xl font-black text-slate-900">Course Updating</h3>
                        <p className="text-sm text-slate-500">এই কোর্সের প্রশ্ন ব্যাংক এখনো তৈরি হয়নি। মেসেজ দিলে আমরা দ্রুত আপডেট করে দেব।</p>
                        <a 
                          href={waLink}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-full py-3.5 rounded-xl text-sm font-black text-white bg-[#25D366] hover:bg-[#20bd5a] transition-colors shadow-xl mt-4"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          Admin-কে Request করুন
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Contact Banner */}
                  <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">যেকোনো তথ্যের জন্য কল করুন</p>
                    <a 
                      href={`tel:${(settingsMap['site_phone'] || '01603-409757').replace(/[^0-9+]/g, '')}`} 
                      className="text-lg font-black text-teal-700 hover:text-teal-800 transition-colors"
                    >
                      {settingsMap['site_phone'] || '01603-409757'}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
