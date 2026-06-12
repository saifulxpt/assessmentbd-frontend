"use client";

import React, { useState } from 'react';

export default function Home() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const basicPriceBn = "৯৯";
  const proPriceBn = "২৯৯";

  const faqs = [
    { q: 'সব প্রশ্ন কি রিয়েল অ্যাসেসমেন্ট থেকে নেওয়া?', a: 'আমাদের প্রশ্নব্যাংক CS, UoC, অ্যাসেসমেন্ট প্যাটার্ন এবং এক্সপার্ট ট্রেইনারদের মতামতের ভিত্তিতে তৈরি। এগুলো শতভাগ রিয়েল না হলেও অ্যাসেসমেন্ট পাসের জন্য যথেষ্ট প্রস্তুতি দেয়।' },
    { q: 'এখানে কি প্র্যাকটিক্যাল ট্রেনিং করানো হয়?', a: 'না। AssessmentBD শুধুমাত্র Written ও MCQ প্রস্তুতির জন্য একটি ডিজিটাল প্ল্যাটফর্ম। কোনো প্র্যাকটিক্যাল ট্রেনিং প্রদান করা হয় না।' },
    { q: 'যেকোনো ডিভাইস থেকে ব্যবহার করা যাবে?', a: 'হ্যাঁ, যেকোনো স্মার্টফোন, ট্যাবলেট বা কম্পিউটার থেকে লগইন করে প্র্যাকটিস করা যাবে।' },
  ];

  return (
    <>
      {/* Header (Simplified Carbon Copy for now) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/50 shadow-sm transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16 md:h-20">
                  <a href="/" className="flex items-center gap-2 group">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                      </div>
                      <div>
                          <span className="text-xl md:text-2xl font-black tracking-tight text-slate-900 leading-none">AssessmentBD</span>
                          <p className="text-[9px] font-semibold text-slate-400 tracking-wider hidden md:block">Competent With Confidence</p>
                      </div>
                  </a>

                  <nav className="hidden md:flex items-center gap-8">
                      <a href="/" className="text-sm font-bold text-blue-600">Home</a>
                      <a href="/courses" className="text-sm font-bold text-slate-600 hover:text-blue-600">Courses</a>
                      <a href="/pricing" className="text-sm font-bold text-slate-600 hover:text-blue-600">Packages</a>
                      <a href="/about" className="text-sm font-bold text-slate-600 hover:text-blue-600">About Us</a>
                      <a href="/contact" className="text-sm font-bold text-slate-600 hover:text-blue-600">Contact</a>
                  </nav>

                  <div className="hidden md:flex items-center gap-4">
                      <a href="/login" className="text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-3 rounded-xl shadow-md transition transform active:scale-95">লগইন / শুরু করুন</a>
                  </div>
              </div>
          </div>
      </header>

      {/* Main Content Padding */}
      <div className="pt-20"></div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 10% 60%,rgba(59,130,246,.07) 0%,transparent 50%),radial-gradient(circle at 85% 20%,rgba(99,102,241,.06) 0%,transparent 50%)" }}></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-100"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-14 md:pt-28 md:pb-20 relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                  
                  {/* Hero Text */}
                  <div className="text-center lg:text-left">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold mb-6 border shadow-sm" style={{ background: "rgba(37,99,235,.07)", color: "#2563eb", borderColor: "rgba(37,99,235,.2)" }}>
                          <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                          </span>
                          #1 NSDA Assessment Tools in BD
                      </div>
                      
                      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-6" style={{ lineHeight: 1.4 }}>
                          বাংলাদেশের এক নাম্বার NSDA অ্যাসেসমেন্ট প্রস্তুতি প্ল্যাটফর্ম
                      </h1>
                      
                      <p className="text-base sm:text-lg text-slate-500 font-medium mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                          শুধু প্র্যাকটিক্যাল নয়, CS অনুযায়ী সম্পূর্ণ MCQ ও Written প্রশ্নব্যাংক প্র্যাকটিস করুন আপনার মোবাইলেই। নিজেকে আগে থেকেই যাচাই করে নিন এবং প্রথমবারেই 'Competent (C)' সার্টিফিকেট অর্জন করুন।
                      </p>
                      
                      <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                          <a href="/courses" className="w-full sm:w-auto text-base font-black text-white px-8 py-4 rounded-xl transition transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", boxShadow: "0 8px 24px rgba(37,99,235,.3)" }}>
                              কোর্স সমূহ
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                          </a>
                          <a href="#packages" className="w-full sm:w-auto text-base font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-8 py-4 rounded-xl transition flex items-center justify-center shadow-sm">
                              প্যাকেজ সমূহ
                          </a>
                      </div>
                  </div>
                  
                  {/* Hero Image */}
                  <div className="relative lg:ml-10 hidden md:flex justify-center items-center w-full z-10 py-8">
                      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 75% 65% at 55% 50%, rgba(59,130,246,0.1) 0%, transparent 70%)", filter: "blur(24px)" }}></div>
                      <div className="relative w-full z-10 hover:-translate-y-1 transition-transform duration-500">
                          <img src="https://placehold.co/800x600/f8fafc/2563eb?text=Hero+Banner" alt="Hero Banner" className="w-full h-auto block rounded-2xl" />
                      </div>
                  </div>
                  
              </div>
          </div>
      </section>

      {/* Packages / Pricing */}
      <section id="packages" className="py-14 bg-slate-50 pricing-section font-hind">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-10">
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest border border-blue-100 mb-3">প্যাকেজ সমূহ</span>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">আমাদের প্যাকেজ সমূহ</h2>
                  <p className="text-slate-500 text-sm font-medium">সহজ ও স্বচ্ছ মূল্য পরিকল্পনা। কোনো hidden charge নেই।</p>
              </div>

              <div className="flex flex-col md:flex-row justify-center gap-6 max-w-4xl mx-auto">

                  {/* BASIC PLAN */}
                  <div className="bg-white rounded-2xl flex flex-col overflow-hidden hover:-translate-y-1 transition-transform duration-200 w-full md:w-1/2" style={{ border: "1.5px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
                      <div className="px-7 pt-8 pb-6 text-center border-b border-slate-100">
                          <h2 className="text-[1.15rem] font-black mb-1 text-blue-600">Basic Plan</h2>
                          <p className="text-sm text-slate-400 font-semibold mb-4">সীমিত বাজেটে প্রস্তুতি</p>
                          <div className="flex items-baseline justify-center gap-0.5">
                              <span className="text-xl font-black text-slate-500">৳</span>
                              <span className="font-black text-slate-900 leading-none tracking-tight text-5xl">{basicPriceBn}</span>
                              <span className="text-sm font-bold text-slate-400 ml-1 self-end mb-1">/ মাস</span>
                          </div>
                          <div className="flex justify-center mt-4">
                              <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-bold border border-blue-200 bg-blue-50 text-blue-700">যেকোনো ১টি Occupation &bull; ৩০ দিনের অ্যাক্সেস</span>
                          </div>
                      </div>
                      <div className="px-7 pt-5 pb-7 flex flex-col flex-1">
                          <ul className="space-y-3.5 flex-1 mb-7">
                              <li className="flex items-center gap-3">
                                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center shadow-sm bg-blue-600"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                                  <span className="font-semibold text-slate-700 text-sm">কমন MCQ প্রশ্নব্যাংক</span>
                              </li>
                              <li className="flex items-center gap-3">
                                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center shadow-sm bg-blue-600"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                                  <span className="font-semibold text-slate-700 text-sm">গুরুত্বপূর্ণ Written প্রশ্ন ব্যাংক</span>
                              </li>
                              <li className="flex items-center gap-3">
                                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-slate-100"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>
                                  <span className="font-medium text-slate-400 line-through text-sm">Money-back গ্যারান্টি</span>
                              </li>
                          </ul>
                          <a href="/courses" className="block w-full py-3.5 rounded-xl font-black text-center transition-all duration-150 text-blue-600 border-2 border-blue-600 hover:bg-blue-50">
                              Basic Plan নিন
                          </a>
                      </div>
                  </div>

                  {/* PRO PLAN */}
                  <div className="rounded-2xl flex flex-col overflow-hidden relative hover:-translate-y-1 transition-transform duration-200 w-full md:w-1/2" style={{ border: "2px solid #2563eb", background: "#f0f7ff", boxShadow: "0 10px 36px rgba(37,99,235,0.2)" }}>
                      <div className="px-7 pt-8 pb-6 text-center border-b border-blue-100">
                          <h2 className="text-[1.15rem] font-black mb-1 text-blue-600">Pro Plan</h2>
                          <p className="text-sm font-semibold mb-4 text-slate-500">পূর্ণাঙ্গ প্রস্তুতি</p>
                          <div className="flex items-baseline justify-center gap-0.5">
                              <span className="text-xl font-black text-slate-500">৳</span>
                              <span className="font-black text-slate-900 leading-none tracking-tight text-5xl">{proPriceBn}</span>
                              <span className="text-sm font-bold text-slate-400 ml-1 self-end mb-1">/ ৩ মাস</span>
                          </div>
                          <div className="flex justify-center mt-4">
                              <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-bold border border-blue-300 bg-blue-100 text-blue-800">যেকোনো ১টি Occupation &bull; ৯০ দিনের অ্যাক্সেস</span>
                          </div>
                      </div>
                      <div className="px-7 pt-5 pb-7 flex flex-col flex-1">
                          <ul className="space-y-3.5 flex-1 mb-5">
                              <li className="flex items-center gap-3">
                                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center shadow-sm bg-blue-600"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                                  <span className="font-semibold text-slate-700 text-sm">সকল Unit-এর MCQ Question Bank</span>
                              </li>
                              <li className="flex items-center gap-3">
                                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center shadow-sm bg-blue-600"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                                  <span className="font-semibold text-slate-700 text-sm">Money-back গ্যারান্টি (NYC হলে ফেরত)</span>
                              </li>
                          </ul>
                          <a href="/courses" className="block w-full py-3.5 rounded-xl font-black text-white text-center transition-all duration-150 bg-blue-600 hover:bg-blue-700 shadow-lg">
                              Pro Plan নিন
                          </a>
                      </div>
                  </div>

              </div>
          </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">কেন AssessmentBD-তে প্রস্তুতি নিবেন?</h2>
                  <p className="text-lg text-slate-600 font-medium leading-relaxed">শুধু থিওরি পড়ে অ্যাসেসমেন্ট পাস করা কঠিন। AssessmentBD-তে আপনি পাচ্ছেন CS অনুযায়ী সাজানো রিয়েল-টাইম Model Assessment। নিজের ভুলগুলো আগেই ধরে ফেলুন, ইনস্ট্যান্ট সল্যুশন দেখুন এবং শতভাগ কনফিডেন্স নিয়ে ফাইনাল অ্যাসেসমেন্টে বসুন।</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
                  <div className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 hover:shadow-xl transition-all">
                      <h3 className="text-xl font-bold text-slate-900 mb-4 hover:text-blue-600">১. রিঅ্যাসেসমেন্ট ফি বাঁচান</h3>
                      <p className="text-base text-slate-600">ফাইনাল অ্যাসেসমেন্টে Not Yet Competent (NYC) হয়ে পুনরায় ফি দেওয়ার টেনশন কেন? মূল অ্যাসেসমেন্টের আগেই আমাদের পোর্টালে নিজেকে যাচাই করে প্রথমবারেই আপনার Competent হওয়া নিশ্চিত করুন।</p>
                  </div>
                  <div className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 hover:shadow-xl transition-all">
                      <h3 className="text-xl font-bold text-slate-900 mb-4 hover:text-blue-600">২. ৫০% মানি-ব্যাক গ্যারান্টি (Pro Plan)</h3>
                      <p className="text-base text-slate-600">আমাদের প্রস্তুতির ওপর আমরা ১০০% কনফিডেন্ট! আমাদের মডেল অ্যাসেসমেন্টগুলোতে পাস করার পরও রিয়েল NSDA অ্যাসেসমেন্টে যদি দুর্ভাগ্যবশত NYC হন, তবে আমরা দিচ্ছি ৫০% সাবস্ক্রিপশন ফি রিফান্ড।</p>
                  </div>
              </div>
          </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">সাধারণ জিজ্ঞাসা (FAQ)</h2>
              </div>
              <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${faqOpen === index ? 'ring-2 ring-blue-500/20 border-blue-300' : 'border-slate-200'}`}>
                        <button onClick={() => toggleFaq(index)} className="w-full flex items-center justify-between p-5 md:p-6 text-left gap-4 focus:outline-none">
                            <span className={`font-bold text-[15px] md:text-base ${faqOpen === index ? 'text-blue-700' : 'text-slate-800'}`}>{faq.q}</span>
                            <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${faqOpen === index ? 'bg-blue-100 text-blue-600 rotate-180' : 'bg-slate-50 text-slate-400'}`}>
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                            </span>
                        </button>
                        {faqOpen === index && (
                          <div className="px-5 md:px-6 pb-6 pt-1">
                              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 text-sm md:text-[15px] leading-relaxed font-medium">
                                  {faq.a}
                              </div>
                          </div>
                        )}
                    </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Footer Carbon Copy */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 pt-20 pb-12 mt-auto border-t-[6px] border-blue-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
              <p className="text-slate-400 text-sm font-medium mb-6">
                  &copy; {new Date().getFullYear()} AssessmentBD. All rights reserved.
              </p>
          </div>
      </footer>
    </>
  );
}
