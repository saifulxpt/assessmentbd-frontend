"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/frontend/landing')
      .then(res => {
        setData(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching landing data", err);
        setLoading(false);
      });
  }, []);

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center text-blue-600 font-bold">Loading...</div>;
  }

  const settings = data?.settings || {};
  const faqs = settings.site_faqs ? settings.site_faqs.filter((f: any) => f.section === 'Home') : [];
  
  // Format prices to Bengali digits
  const toBn = (num: number) => num.toString().replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
  const basicPriceBn = toBn(data?.pricing?.basic || 99);
  const proPriceBn = toBn(data?.pricing?.pro || 299);

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/50 shadow-sm transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16 md:h-20">
                  <a href="/" className="flex items-center gap-2 group">
                      {settings.site_logo ? (
                          <img src={`http://127.0.0.1:8000/storage/${settings.site_logo}`} alt="AssessmentBD" className="h-10 md:h-14 w-auto object-contain group-hover:opacity-90 transition-opacity" style={{maxWidth: 220}} width="220" height="56"/>
                      ) : (
                          <>
                              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                              </div>
                              <div>
                                  <span className="text-xl md:text-2xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors leading-none">AssessmentBD</span>
                                  <p className="text-[9px] font-semibold text-slate-400 tracking-wider hidden md:block">Competent With Confidence</p>
                              </div>
                          </>
                      )}
                  </a>

                  <nav className="hidden md:flex items-center gap-8">
                      <a href="/" className="text-sm font-bold text-blue-600">Home</a>
                      <a href="/courses" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Courses</a>
                      <a href="/pricing" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Packages</a>
                      <a href="/about" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">About Us</a>
                      <a href="/contact" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Contact</a>
                  </nav>

                  <div className="hidden md:flex items-center gap-4">
                      <a href="/login" className="text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-blue-800 hover:opacity-90 px-6 py-3 rounded-xl shadow-md transition transform active:scale-95">লগইন / শুরু করুন</a>
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
                  <div className="text-center lg:text-left">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold mb-6 border shadow-sm" style={{ background: "rgba(37,99,235,.07)", color: "#2563eb", borderColor: "rgba(37,99,235,.2)" }}>
                          <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                          </span>
                          {settings.hero_badge || '#1 NSDA Assessment Tools in BD'}
                      </div>
                      
                      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-6" style={{ lineHeight: 1.4 }}>
                          {settings.hero_heading || 'বাংলাদেশের এক নাম্বার NSDA অ্যাসেসমেন্ট প্রস্তুতি প্ল্যাটফর্ম'}
                      </h1>
                      
                      <p className="text-base sm:text-lg text-slate-500 font-medium mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                          {settings.hero_subtext || 'শুধু প্র্যাকটিক্যাল নয়, CS অনুযায়ী সম্পূর্ণ MCQ ও Written প্রশ্নব্যাংক প্র্যাকটিস করুন আপনার মোবাইলেই। নিজেকে আগে থেকেই যাচাই করে নিন এবং প্রথমবারেই \'Competent (C)\' সার্টিফিকেট অর্জন করুন।'}
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
                  
                  <div className="relative lg:ml-10 hidden md:flex justify-center items-center w-full z-10 py-8">
                      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 75% 65% at 55% 50%, rgba(59,130,246,0.1) 0%, transparent 70%)", filter: "blur(24px)" }}></div>
                      <div className="relative w-full z-10 hover:-translate-y-1 transition-transform duration-500">
                          <img src={settings.resource_banner ? `http://127.0.0.1:8000/storage/${settings.resource_banner}` : "https://placehold.co/800x600/f8fafc/2563eb?text=Hero+Banner"} alt="Hero Banner" className="w-full h-auto block rounded-2xl" />
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
                              <span className="inline-flex items-center px-4 py-1 rounded-full text-[11px] font-bold border border-blue-200 bg-blue-50 text-blue-700">যেকোনো ১টি Occupation &bull; ৩০ দিনের অ্যাক্সেস</span>
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
                          <a href="/courses" className="block w-full py-3.5 rounded-xl font-black text-center transition-all duration-150 text-blue-600 border-2 border-blue-600 hover:bg-blue-50">Basic Plan নিন</a>
                      </div>
                  </div>

                  {/* PRO PLAN */}
                  <div className="rounded-2xl flex flex-col overflow-hidden relative hover:-translate-y-1 transition-transform duration-200 w-full md:w-1/2" style={{ border: "2px solid #2563eb", background: "#f0f7ff", boxShadow: "0 10px 36px rgba(37,99,235,0.2)" }}>
                      <div className="absolute top-0 right-0 w-[92px] h-[92px] overflow-hidden pointer-events-none">
                          <div className="absolute top-[20px] right-[-30px] w-[116px] text-center py-[7px] text-white font-black tracking-widest rotate-45 shadow bg-blue-600 text-[10px] tracking-widest">
                              RECOMMENDED
                          </div>
                      </div>
                      <div className="px-7 pt-8 pb-6 text-center border-b border-blue-100">
                          <h2 className="text-[1.15rem] font-black mb-1 text-blue-600">Pro Plan</h2>
                          <p className="text-sm font-semibold mb-4 text-slate-500">পূর্ণাঙ্গ প্রস্তুতি</p>
                          <div className="flex items-baseline justify-center gap-0.5">
                              <span className="text-xl font-black text-slate-500">৳</span>
                              <span className="font-black text-slate-900 leading-none tracking-tight text-5xl">{proPriceBn}</span>
                              <span className="text-sm font-bold text-slate-400 ml-1 self-end mb-1">/ ৩ মাস</span>
                          </div>
                          <div className="flex justify-center mt-4">
                              <span className="inline-flex items-center px-4 py-1 rounded-full text-[11px] font-bold border border-blue-300 bg-blue-100 text-blue-800">যেকোনো ১টি Occupation &bull; ৯০ দিনের অ্যাক্সেস</span>
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
                          <a href="/courses" className="block w-full py-3.5 rounded-xl font-black text-white text-center transition-all duration-150 bg-blue-600 hover:bg-blue-700 shadow-lg">Pro Plan নিন</a>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">{settings.pain_points_title || 'কেন AssessmentBD-তে প্রস্তুতি নিবেন?'}</h2>
                  <p className="text-lg text-slate-600 font-medium leading-relaxed">{settings.pain_points_text || 'শুধু থিওরি পড়ে অ্যাসেসমেন্ট পাস করা কঠিন। AssessmentBD-তে আপনি পাচ্ছেন CS অনুযায়ী সাজানো রিয়েল-টাইম Model Assessment। নিজের ভুলগুলো আগেই ধরে ফেলুন, ইনস্ট্যান্ট সল্যুশন দেখুন এবং শতভাগ কনফিডেন্স নিয়ে ফাইনাল অ্যাসেসমেন্টে বসুন।'}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
                  <div className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 hover:shadow-xl transition-all">
                      <h3 className="text-xl font-bold text-slate-900 mb-4 hover:text-blue-600">{settings.pain_points_1_title || '১. রিঅ্যাসেসমেন্ট ফি বাঁচান'}</h3>
                      <p className="text-base text-slate-600">{settings.pain_points_1_text || 'ফাইনাল অ্যাসেসমেন্টে Not Yet Competent (NYC) হয়ে পুনরায় ফি দেওয়ার টেনশন কেন? মূল অ্যাসেসমেন্টের আগেই আমাদের পোর্টালে নিজেকে যাচাই করে প্রথমবারেই আপনার Competent হওয়া নিশ্চিত করুন।'}</p>
                  </div>
                  <div className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 hover:shadow-xl transition-all">
                      <h3 className="text-xl font-bold text-slate-900 mb-4 hover:text-blue-600">{settings.pain_points_2_title || '২. ৫০% মানি-ব্যাক গ্যারান্টি (Pro Plan)'}</h3>
                      <p className="text-base text-slate-600">{settings.pain_points_2_text || 'আমাদের প্রস্তুতির ওপর আমরা ১০০% কনফিডেন্ট! আমাদের মডেল অ্যাসেসমেন্টগুলোতে পাস করার পরও রিয়েল NSDA অ্যাসেসমেন্টে যদি দুর্ভাগ্যবশত NYC হন, তবে আমরা দিচ্ছি ৫০% সাবস্ক্রিপশন ফি রিফান্ড।'}</p>
                  </div>
              </div>
          </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">{settings.faq_title || 'সাধারণ জিজ্ঞাসা (FAQ)'}</h2>
                  <p className="text-lg text-slate-500 font-medium">{settings.faq_text || 'আপনাদের মনে থাকা কিছু সাধারণ প্রশ্নের উত্তর'}</p>
              </div>
              <div className="space-y-4">
                  {faqs.length > 0 ? faqs.map((faq: any, index: number) => (
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
                                  {faq.a.split('\n').map((line: string, i: number) => (
                                      <React.Fragment key={i}>{line}<br/></React.Fragment>
                                  ))}
                              </div>
                          </div>
                        )}
                    </div>
                  )) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-slate-500 font-medium">No FAQs available right now.</p>
                    </div>
                  )}
              </div>
          </div>
      </section>

      {/* FULL DYNAMIC FOOTER */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 pt-20 pb-12 mt-auto border-t-[6px] border-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-12 gap-y-10 gap-x-6 md:gap-8 lg:gap-12 mb-16">
                  
                  {/* Brand Info */}
                  <div className="col-span-2 md:col-span-6 lg:col-span-4">
                      <a href="/" className="flex items-center gap-2 mb-6 group/logo">
                          {settings.site_logo ? (
                              <div className="bg-white rounded-xl px-3 py-1.5 inline-flex items-center">
                                  <img src={`http://127.0.0.1:8000/storage/${settings.site_logo}`} alt="AssessmentBD" className="h-9 w-auto object-contain" style={{maxWidth:180}}/>
                              </div>
                          ) : (
                              <>
                                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                                  </div>
                                  <div>
                                      <span className="text-2xl font-black tracking-tight text-white leading-none">AssessmentBD</span>
                                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">Competent With Confidence</p>
                                  </div>
                              </>
                          )}
                      </a>
                      <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium pr-4">
                          {settings.footer_description || 'NSDA লেভেল অ্যাসেসমেন্ট পরীক্ষার জন্য বাংলাদেশের সবচেয়ে আধুনিক এবং কার্যকরী প্র্যাকটিস প্ল্যাটফর্ম। দিনশেষে আপনার হাতের কাজটাই আসল। কিন্তু ওইটুকু থিওরি বা MCQ-এর জন্য কেন আপনার অ্যাসেসমেন্ট আটকে থাকবে?'}
                      </p>
                      <div className="flex gap-3">
                          {settings.social_facebook && (
                              <a href={settings.social_facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-300 hover:bg-[#1877F2] hover:text-white transition-all border border-slate-700/50 shadow-sm" title="Facebook">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                              </a>
                          )}
                          {settings.social_youtube && (
                              <a href={settings.social_youtube} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-300 hover:bg-[#FF0000] hover:text-white transition-all border border-slate-700/50 shadow-sm" title="YouTube">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58a2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>
                              </a>
                          )}
                          {settings.social_linkedin && (
                              <a href={settings.social_linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-300 hover:bg-[#0A66C2] hover:text-white transition-all border border-slate-700/50 shadow-sm" title="LinkedIn">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                              </a>
                          )}
                      </div>
                  </div>

                  {/* Quick Links */}
                  <div className="col-span-1 md:col-span-3 lg:col-span-3 lg:col-start-6">
                      <h3 className="text-white font-bold text-lg mb-6 tracking-wide relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-12 after:h-[2px] after:bg-blue-600">Quick Links</h3>
                      <ul className="space-y-4 text-slate-400 text-sm font-medium">
                          <li><a href="/" className="hover:text-blue-400 transition-all">Home</a></li>
                          <li><a href="/courses" className="hover:text-blue-400 transition-all">Courses</a></li>
                          <li><a href="/about" className="hover:text-blue-400 transition-all">About Us</a></li>
                          <li><a href="/pricing" className="hover:text-blue-400 transition-all">Packages</a></li>
                      </ul>
                  </div>

                  {/* Important Links */}
                  <div className="col-span-1 md:col-span-3 lg:col-span-3">
                      <h3 className="text-white font-bold text-lg mb-6 tracking-wide relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-12 after:h-[2px] after:bg-blue-600">Important</h3>
                      <ul className="space-y-4 text-slate-400 text-sm font-medium">
                          <li><a href="/contact" className="hover:text-blue-400 transition-all">Contact Us</a></li>
                          <li><a href="/terms" className="hover:text-blue-400 transition-all">Terms & Conditions</a></li>
                          <li><a href="/privacy" className="hover:text-blue-400 transition-all">Privacy Policy</a></li>
                          <li><a href="/refund" className="hover:text-blue-400 transition-all">Refund Policy</a></li>
                          <li><a href="/faq" className="hover:text-blue-400 transition-all">FAQ</a></li>
                      </ul>
                  </div>

              </div>

              <div className="border-t border-slate-800/80 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <p className="text-sm text-slate-400 font-medium text-center md:text-left">
                      &copy; {new Date().getFullYear()} AssessmentBD. All rights reserved.
                  </p>
                  <p className="text-[11px] text-slate-500 text-center md:text-right max-w-lg leading-relaxed font-medium">
                      <strong className="text-slate-400">Disclaimer:</strong> AssessmentBD is an independent educational platform and is NOT affiliated with, endorsed by, or representing the National Skills Development Authority (NSDA) or any government entity.
                  </p>
              </div>
          </div>
      </footer>
    </>
  );
}
