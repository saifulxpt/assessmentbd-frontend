"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getResourceUrl } from "@/lib/api";

const BN_DIGITS: Record<string, string> = {
  "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪", "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯"
};

function bn(n: string | number): string {
  return n.toString().replace(/[0-9]/g, d => BN_DIGITS[d]);
}

export default function HomeClient({ settings }: { settings: Record<string, string> }) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showPromo, setShowPromo] = useState(false);

  // Hero Banners and Screens
  const heroBannerUrl = getResourceUrl(settings["resource_banner"]) || "https://placehold.co/800x600/f8fafc/2563eb?text=Upload+Hero+Banner";
  const appScreenUrl = getResourceUrl(settings["resource_app_screen"]) || "https://placehold.co/280x580/cbd5e1/1e293b?text=App+Preview";

  // Plan Prices
  const basicPrice = settings["basic_plan_price"] || "99";
  const proPrice = settings["pro_plan_price"] || "299";
  const basicPriceBn = bn(basicPrice);
  const proPriceBn = bn(proPrice);

  // FAQs parsing
  let faqsList: any[] = [];
  try {
    const allFaqs = JSON.parse(settings["site_faqs"] || "[]");
    faqsList = allFaqs.filter((f: any) => f.section === "Home");
  } catch (e) {
    console.error("Error parsing FAQs JSON:", e);
  }

  // Mobile Entry Promo Popup Trigger
  useEffect(() => {
    const hasPromoUrl = !!settings["resource_banner"];
    if (hasPromoUrl && window.innerWidth < 768 && !sessionStorage.getItem("abd_promo_v2")) {
      const timer = setTimeout(() => {
        setShowPromo(true);
        document.body.style.overflow = "hidden";
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [settings]);

  const closePromo = () => {
    sessionStorage.setItem("abd_promo_v2", "1");
    setShowPromo(false);
    document.body.style.overflow = "";
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .pricing-section { font-family: 'Hind Siliguri', sans-serif; }
        .pricing-section .bn { line-height: 1.75; letter-spacing: 0.01em; }
        .pricing-section .feature-text { font-size: 0.9375rem; line-height: 1.6; }
        .pricing-wrap { max-width:52rem; width:100%; margin-left:auto; margin-right:auto; padding:0 20px; }
        .pricing-grid { display:flex; gap:16px; overflow-x:auto; padding-bottom:16px; scrollbar-width:none; -ms-overflow-style:none; align-items:stretch; }
        .pricing-grid::-webkit-scrollbar { display:none; }
        .pricing-card { flex-shrink:0; width:82vw; max-width:340px; display:flex; flex-direction:column; }
        .access-pill { display:inline-flex; align-items:center; padding:4px 14px; border-radius:999px; font-size:0.72rem; font-weight:700; border:1.5px solid #bfdbfe; background:#eff6ff; color:#1d4ed8; margin-top:10px; letter-spacing:0.01em; font-family:'Hind Siliguri',sans-serif; }
        .pricing-section, .pricing-section * { font-family:'Hind Siliguri',sans-serif; }
        @media (min-width: 768px) {
            .pricing-grid { display:grid; grid-template-columns:1fr 1fr; gap:22px; overflow:visible; padding-bottom:0; align-items:stretch; }
            .pricing-card { width:auto; max-width:none; flex-shrink:unset; }
        }
      `}} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 10% 60%,rgba(59,130,246,.07) 0%,transparent 50%),radial-gradient(circle at 85% 20%,rgba(99,102,241,.06) 0%,transparent 50%)" }}></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-100"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-14 md:pt-28 md:pb-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold mb-6 border shadow-sm" style={{ background: "rgba(37,99,235,.07)", color: "#2563eb", borderColor: "rgba(37,99,235,.2)" }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                {settings["hero_badge"] || "#1 NSDA Assessment Tools in BD"}
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-6" style={{ lineHeight: "1.4" }}>
                {settings["hero_heading"] || "বাংলাদেশের এক নাম্বার NSDA অ্যাসেসমেন্ট প্রস্তুতি প্ল্যাটফর্ম"}
              </h1>
              
              <p className="text-base sm:text-lg text-slate-500 font-medium mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {settings["hero_subtext"] || "শুধু প্র্যাকটিক্যাল নয়, CS অনুযায়ী সম্পূর্ণ MCQ ও Written প্রশ্নব্যাংক প্র্যাকটিস করুন আপনার মোবাইলেই। নিজেকে আগে থেকেই যাচাই করে নিন এবং প্রথমবারেই 'Competent (C)' সার্টিফিকেট অর্জন করুন।"}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/courses" className="w-full sm:w-auto text-base font-black text-white hover:opacity-90 px-8 py-4 rounded-xl transition transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", boxShadow: "0 8px 24px rgba(37,99,235,.3)" }}>
                  কোর্স সমূহ
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                <a href="#packages" className="w-full sm:w-auto text-base font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-8 py-4 rounded-xl transition flex items-center justify-center shadow-sm">
                  প্যাকেজ সমূহ
                </a>
              </div>
            </div>

            {/* Hero Right Banner Image */}
            <div className="relative lg:ml-10 hidden md:flex justify-center items-center w-full z-10 py-8">
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 75% 65% at 55% 50%, rgba(59,130,246,0.1) 0%, transparent 70%)", filter: "blur(24px)" }}></div>
              <div className="relative w-full z-10 hover:-translate-y-1 transition-transform duration-500">
                <img src={heroBannerUrl} alt="Hero Banner" className="w-full h-auto block rounded-2xl shadow-xl border border-slate-100" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Packages / Pricing */}
      <section id="packages" className="py-14 bg-slate-50 pricing-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest border border-blue-100 mb-3">প্যাকেজ সমূহ</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2 bn">আমাদের প্যাকেজ সমূহ</h2>
            <p className="text-slate-500 text-sm font-medium bn">সহজ ও স্বচ্ছ মূল্য পরিকল্পনা। কোনো hidden charge নেই।</p>
          </div>

          <div className="pricing-wrap">
            <div className="pricing-grid">
              
              {/* BASIC PLAN */}
              <div className="pricing-card bg-white rounded-2xl flex flex-col overflow-hidden hover:-translate-y-1 transition-transform duration-200" style={{ border: "1.5px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
                <div className="px-7 pt-8 pb-6 text-center border-b border-slate-100">
                  <h2 className="text-[1.15rem] font-black mb-1 bn text-blue-600">Basic Plan</h2>
                  <p className="text-sm text-slate-400 font-semibold mb-4 bn">সীমিত বাজেটে প্রস্তুতি</p>
                  <div className="flex items-baseline justify-center gap-0.5">
                    <span className="text-xl font-black text-slate-500">৳</span>
                    <span className="font-black text-slate-900 leading-none tracking-tight text-[3rem]">{basicPriceBn}</span>
                    <span className="text-sm font-bold text-slate-400 ml-1 self-end mb-1">/ মাস</span>
                  </div>
                  <div className="flex justify-center">
                    <span className="access-pill bn">যেকোনো ১টি Occupation &bull; ৩০ দিনের অ্যাক্সেস</span>
                  </div>
                </div>
                <div className="px-7 pt-5 pb-7 flex flex-col flex-1">
                  <ul className="space-y-3.5 flex-1 mb-7">
                    {[
                      ["কমন MCQ প্রশ্নব্যাংক", true],
                      ["গুরুত্বপূর্ণ Written প্রশ্ন ব্যাংক", true],
                      ["ইনস্ট্যান্ট রেজাল্ট ও ব্যাখ্যা", true],
                      ["সার্বক্ষণিক Expert সাপোর্ট", false],
                      ["Money-back গ্যারান্টি", false]
                    ].map(([text, on], idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        {on ? (
                          <>
                            <span className="shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center shadow-sm bg-blue-600">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </span>
                            <span className="feature-text font-semibold text-slate-700 bn">{text as string}</span>
                          </>
                        ) : (
                          <>
                            <span className="shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center bg-slate-100">
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </span>
                            <span className="feature-text font-medium text-slate-400 line-through bn">{text as string}</span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                  <Link href="/courses" className="block w-full py-3.5 rounded-xl font-black text-center transition-all duration-150 bn border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-[0.9375rem] bg-transparent">
                    Basic Plan নিন
                  </Link>
                  <p className="text-center text-xs text-slate-400 font-medium mt-3 bn">৩০ দিনের জন্য মাত্র ৳{basicPriceBn}</p>
                </div>
              </div>

              {/* PRO PLAN */}
              <div className="pricing-card rounded-2xl flex flex-col overflow-hidden relative hover:-translate-y-1 transition-transform duration-200" style={{ border: "2px solid #2563eb", background: "#f0f7ff", boxShadow: "0 10px 36px rgba(37,99,235,0.2)" }}>
                <div className="absolute top-0 right-0 w-[92px] h-[92px] overflow-hidden pointer-events-none">
                  <div className="absolute top-[20px] right-[-30px] w-[116px] text-center py-[7px] text-white font-black tracking-widest rotate-45 shadow bg-blue-600 text-[0.6rem] [letter-spacing:0.12em]">
                    RECOMMENDED
                  </div>
                </div>
                <div className="px-7 pt-8 pb-6 text-center" style={{ borderBottom: "1.5px solid #dbeafe" }}>
                  <h2 className="text-[1.15rem] font-black mb-1 bn text-blue-600">Pro Plan</h2>
                  <p className="text-sm font-semibold mb-4 bn text-slate-500">পূর্ণাঙ্গ প্রস্তুতি</p>
                  <div className="flex items-baseline justify-center gap-0.5">
                    <span className="text-xl font-black text-slate-500">৳</span>
                    <span className="font-black text-slate-900 leading-none tracking-tight text-[3rem]">{proPriceBn}</span>
                    <span className="text-sm font-bold text-slate-400 ml-1 self-end mb-1">/ ৩ মাস</span>
                  </div>
                  <div className="flex justify-center">
                    <span className="access-pill bn" style={{ borderColor: "#93c5fd", background: "#dbeafe", color: "#1e40af" }}>যেকোনো ১টি Occupation &bull; ৯০ দিনের অ্যাক্সেস</span>
                  </div>
                </div>
                <div className="px-7 pt-5 pb-7 flex flex-col flex-1">
                  <ul className="space-y-3.5 flex-1 mb-5">
                    {[
                      "সকল Unit-এর MCQ Question Bank",
                      "গুরুত্বপূর্ণ Written প্রশ্ন ব্যাংক",
                      "ইনস্ট্যান্ট রেজাল্ট ও ব্যাখ্যা",
                      "সার্বক্ষণিক Expert সাপোর্ট",
                      "যেকোনো প্রশ্নের বিস্তারিত ব্যাখ্যা"
                    ].map((text, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <span className="shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center shadow-sm bg-blue-600">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                        <span className="feature-text font-semibold text-slate-700 bn">{text}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-start gap-3 p-4 rounded-xl mb-6 bg-amber-50 border border-amber-200">
                    <span className="shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center mt-0.5 bg-amber-500">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                    <div>
                      <p className="font-black bn text-[0.9rem] text-amber-800 leading-normal">৫০% Money-back গ্যারান্টি</p>
                      <p className="text-xs font-semibold mt-0.5 bn text-amber-700">NYC হলে অর্ধেক টাকা ফেরত!</p>
                    </div>
                  </div>
                  <Link href="/courses" className="block w-full py-3.5 rounded-xl font-black text-white text-center transition-all duration-150 bn bg-blue-600 hover:bg-blue-700 text-[0.9375rem] shadow-md hover:shadow-lg">
                    Pro Plan নিন
                  </Link>
                  <p className="text-center text-xs text-slate-400 font-medium mt-3 bn">৩ মাসের জন্য মাত্র ৳{proPriceBn}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Pain Points & Solutions */}
      <section id="how-it-works" className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
              {settings["pain_points_title"] || "কেন AssessmentBD-তে প্রস্তুতি নিবেন?"}
            </h2>
            <p className="text-lg text-slate-600 font-medium leading-relaxed">
              {settings["pain_points_text"] || "শুধু থিওরি পড়ে অ্যাসেসমেন্ট পাস করা কঠিন। AssessmentBD-তে আপনি পাচ্ছেন CS অনুযায়ী সাজানো রিয়েল-টাইম Model Assessment। নিজের ভুলগুলো আগেই ধরে ফেলুন, ইনস্ট্যান্ট সল্যুশন দেখুন এবং শতভাগ কনফিডেন্স নিয়ে ফাইনাল অ্যাসেসমেন্টে বসুন।"}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
              <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                {settings["pain_points_1_title"] || "১. রিঅ্যাসেসমেন্ট ফি বাঁচান"}
              </h3>
              <p className="text-base text-slate-600 leading-relaxed">
                {settings["pain_points_1_text"] || "ফাইনাল অ্যাসেসমেন্টে Not Yet Competent (NYC) হয়ে পুনরায় ফি দেওয়ার টেনশন কেন? মূল অ্যাসেসমেন্টের আগেই আমাদের পোর্টালে নিজেকে যাচাই করে প্রথমবারেই আপনার Competent হওয়া নিশ্চিত করুন।"}
              </p>
            </div>
            
            <div className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
              <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                {settings["pain_points_2_title"] || "২. ৫০% মানি-ব্যাক গ্যারান্টি (Pro Plan)"}
              </h3>
              <p className="text-base text-slate-600 leading-relaxed">
                {settings["pain_points_2_text"] || "আমাদের প্রস্তুতির ওপর আমরা ১০০% কনফিডেন্ট! আমাদের মডেল অ্যাসেসমেন্টগুলোতে পাস করার পরও রিয়েল NSDA অ্যাসেসমেন্টে যদি দুর্ভাগ্যবশত NYC হন, তবে আমরা দিচ্ছি ৫০% সাবস্ক্রিপশন ফি রিফান্ড।"}
              </p>
            </div>
            
            <div className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
              <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                {settings["pain_points_3_title"] || "৩. CS অনুযায়ী MCQ ও Written প্রস্তুতি"}
              </h3>
              <p className="text-base text-slate-600 leading-relaxed">
                {settings["pain_points_3_text"] || "শুধু প্র্যাকটিক্যাল পারলেই তো হবে না! Competency Standard (CS) অনুযায়ী MCQ এবং লিখিত (Written) অ্যাসেসমেন্টের জন্য সবচেয়ে গুরুত্বপূর্ণ প্রশ্ন, উত্তর ও গাইডলাইনগুলো আপনি এখানেই পেয়ে যাচ্ছেন।"}
              </p>
            </div>
            
            <div className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
              <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                {settings["pain_points_4_title"] || "৪. সাথে সাথেই রেজাল্ট ও ব্যাখ্যা"}
              </h3>
              <p className="text-base text-slate-600 leading-relaxed">
                {settings["pain_points_4_text"] || "অনলাইনে মডেল অ্যাসেসমেন্ট সাবমিট করার সাথে সাথেই জেনে নিন আপনি Competent (C) নাকি Not Yet Competent (NYC)। কোথায় ভুল হয়েছে এবং তার সঠিক উত্তর কী—সেটি বিস্তারিত এক্সপ্লানেশন সহ দেখে নিন।"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Friendly Interface Section */}
      <section className="py-24 bg-slate-900 overflow-hidden relative">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Phone Screen Mockup */}
            <div className="order-2 md:order-1 relative flex justify-center perspective-[1000px]">
              <div className="relative bg-slate-900 p-3 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.6)] border-4 border-slate-800 w-[280px] h-[580px] flex-shrink-0 z-10 transform hover:-translate-y-2 transition duration-500 rotate-y-[-5deg] rotate-x-[5deg]">
                {/* Notch */}
                <div className="absolute top-2 inset-x-0 h-6 bg-slate-900 rounded-b-2xl w-32 mx-auto z-20 flex justify-center items-center gap-2">
                  <div className="w-12 h-1.5 bg-slate-800 rounded-full"></div>
                  <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                </div>
                
                {/* Image */}
                <div className="bg-slate-100 w-full h-full rounded-[2.25rem] overflow-hidden relative border border-slate-700/50">
                  <img src={appScreenUrl} alt="AssessmentBD App Preview" className="w-full h-full object-cover object-top" />
                </div>
              </div>
            </div>
            
            {/* Info Right */}
            <div className="order-1 md:order-2 text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6 leading-tight">
                {settings["mobile_friendly_subtitle"] || "১০০% মোবাইল ফ্রেন্ডলি ইন্টারফেস"}
              </h2>
              <p className="text-lg text-slate-300 font-medium leading-relaxed mb-8 max-w-lg mx-auto md:mx-0">
                {settings["mobile_friendly_text"] || "ল্যাপটপ বা কম্পিউটার নেই? কোনো চিন্তা নেই! আমাদের প্ল্যাটফর্ম এমনভাবে ডিজাইন করা হয়েছে যাতে আপনি মোবাইল ফোন দিয়েই সবচেয়ে সেরা ইউজার এক্সপেরিয়েন্স পান।"}
              </p>
              <ul className="space-y-5 mb-10 max-w-md mx-auto md:mx-0 text-left">
                <li className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span className="text-slate-200 font-semibold text-lg">
                    {settings["mobile_friendly_feature_1"] || "অ্যান্ড্রয়েড অ্যাপের মতো স্মুথ নেভিগেশন"}
                  </span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span className="text-slate-200 font-semibold text-lg">
                    {settings["mobile_friendly_feature_2"] || "সহজ ও দ্রুত এক্সাম ইন্টারফেস"}
                  </span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span className="text-slate-200 font-semibold text-lg">
                    {settings["mobile_friendly_feature_3"] || "মোবাইল ব্রাউজার থেকেই ফুল অ্যাক্সেস"}
                  </span>
                </li>
              </ul>
              <Link href="/register" className="inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-900 bg-white hover:bg-slate-50 px-8 py-4 rounded-xl transition shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                {settings["mobile_friendly_cta"] || "মোবাইলে ট্রাই করুন"}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              </Link>
            </div>
            
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
              {settings["faq_title"] || "সাধারণ জিজ্ঞাসা (FAQ)"}
            </h2>
            <p className="text-lg text-slate-500 font-medium">
              {settings["faq_text"] || "আপনাদের মনে থাকা কিছু সাধারণ প্রশ্নের উত্তর"}
            </p>
          </div>

          <div className="space-y-4">
            {faqsList.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index}
                  className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm ${
                    isOpen ? "ring-2 ring-blue-500/20 border-blue-300 shadow-md" : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <button 
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 md:p-6 text-left gap-4 focus:outline-none"
                  >
                    <span className={`font-bold text-slate-800 text-[15px] md:text-base leading-snug pr-4 transition-colors ${isOpen ? "text-blue-700" : ""}`}>
                      {faq.q}
                    </span>
                    <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? "bg-blue-100 text-blue-600 rotate-180" : "bg-slate-50 text-slate-400 border border-slate-200"}`}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 md:px-6 pb-6 pt-1">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-slate-600 text-sm md:text-[15px] leading-relaxed font-medium whitespace-pre-line">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {faqsList.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 font-medium">No FAQs available right now.</p>
              </div>
            )}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/faq" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-700 font-bold hover:text-blue-600 hover:border-blue-200 hover:shadow-sm transition-all text-sm">
              সবগুলো FAQ দেখুন 
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Promise */}
      <section className="py-16 md:py-20 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12 border border-blue-100/50 shadow-lg shadow-blue-900/5 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 shrink-0 bg-white rounded-full flex items-center justify-center shadow-sm border border-blue-100 text-blue-500">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">A Social Promise from Admin</h2>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg md:text-xl font-bold text-blue-700 leading-snug">টাকার অভাবে কারো প্রস্তুতি যেন থেমে না থাকে! 💙</h3>
                <p className="text-slate-600 font-medium leading-relaxed text-[15px] md:text-base">
                  "সার্ভার ও ওয়েবসাইট মেইনটেইন করার জন্য আমরা এই সামান্য সাবস্ক্রিপশন ফি নিয়ে থাকি। এর বাইরে আমাদের লাভের অংশ খুবই সামান্য। তাই বিনীত অনুরোধ—কেউ প্রশ্নগুলো স্ক্রিনশট বা শেয়ার করে পাইরেসি করবেন না।
                </p>
                <div className="bg-white p-5 rounded-2xl border border-blue-100/60 shadow-sm relative overflow-hidden mt-6">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400"></div>
                  <p className="text-slate-600 font-medium leading-relaxed text-[15px] md:text-base pl-3">
                    আর হ্যাঁ, যদি সত্যিই কারো এই সামান্য ফি দেওয়ার সামর্থ্য না থাকে, তবে আমাদের জানান। AssessmentBD-এর অ্যাডমিনের পক্ষ থেকে আপনাকে <strong className="text-slate-800 font-bold">সম্পূর্ণ ফ্রিতে অ্যাক্সেস দেওয়া হবে</strong>; তবে শর্ত একটাই—ভবিষ্যতে আপনার সামর্থ্য হলে টাকাটা AssessmentBD এর এডমিনের হয়ে একজন গরিব মানুষকে দান করে দিতে হবে।"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden text-center bg-white border-t border-slate-100">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-6 border border-blue-100">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">প্রস্তুতি শুরু করার এখনই সময়</h2>
          <p className="text-lg md:text-xl text-slate-500 font-medium mb-10 max-w-2xl mx-auto">হাজারো স্টুডেন্টদের সাথে যুক্ত হয়ে নিজেকে প্রস্তুত করুন আগামীকালের স্কিল টেস্টের জন্য।</p>
          <Link href="/register" className="inline-flex items-center justify-center gap-2 text-base font-black text-white px-10 py-5 rounded-2xl transition transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-blue-600/30" style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}>
            আজই রেজিস্ট্রেশন করুন
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
        </div>
      </section>

      {/* Mobile Promo Popup Overlay */}
      {showPromo && settings["resource_banner"] && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[3px] transition-opacity duration-300">
          <div className="relative w-[92vw] max-w-[360px] animate-in scale-in duration-200">
            {/* Close Button */}
            <button 
              onClick={closePromo}
              className="absolute top-2 right-2 z-20 w-7 h-7 flex items-center justify-center rounded-full text-white transition-opacity hover:opacity-80 cursor-pointer"
              style={{ background: "#e11d48" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            {/* Clickable Banner */}
            <Link href="/courses" onClick={closePromo} className="block w-full">
              <img src={heroBannerUrl} alt="Special Offer" className="w-full h-auto block rounded-2xl shadow-2xl border border-slate-800/20" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
