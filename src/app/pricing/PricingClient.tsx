'use client';

import { useState } from 'react';
import Link from 'next/link';

const BN_DIGITS: Record<string, string> = {
  '0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'
};
function bn(n: string | number): string {
  return n.toString().replace(/[0-9]/g, d => BN_DIGITS[d]);
}

export default function PricingClient({
  basicPrice,
  proPrice,
  pricingFaqs
}: {
  basicPrice: string;
  proPrice: string;
  pricingFaqs: any[];
}) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const basicPriceBn = bn(basicPrice);
  const proPriceBn = bn(proPrice);

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

      {/* Hero */}
      <div 
        style={{ background: 'linear-gradient(135deg,#0f172a 0%,#0948b3 60%,#0f172a 100%)' }} 
        className="py-10 md:py-14 relative overflow-hidden"
      >
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%)' }}
        />
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <span 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4 border" 
            style={{ background: 'rgba(59,130,246,.15)', color: '#93c5fd', borderColor: 'rgba(59,130,246,.3)' }}
          >
            সহজ ও স্বচ্ছ মূল্য পরিকল্পনা
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3 leading-tight">
            NSDA Assessment-এর<br className="hidden sm:block" />
            <span style={{ color: '#60a5fa' }}>শতভাগ প্রস্তুতি</span>
          </h1>
          <p className="text-sm md:text-base font-medium mb-2 text-slate-400">
            Competency Standard অনুযায়ী Question Bank ও Model Assessment। কোনো hidden charge নেই।
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="bg-slate-50 py-10 pb-16 pricing-section">
        <div className="pricing-wrap">
          <div className="pricing-grid">
            
            {/* BASIC PLAN */}
            <div 
              className="pricing-card bg-white rounded-2xl flex flex-col overflow-hidden hover:-translate-y-1 transition-transform duration-200"
              style={{ border: '1.5px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
            >
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
                    ['কমন MCQ প্রশ্নব্যাংক', true],
                    ['গুরুত্বপূর্ণ Written প্রশ্ন ব্যাংক', true],
                    ['ইনস্ট্যান্ট রেজাল্ট ও ব্যাখ্যা', true],
                    ['সার্বক্ষণিক Expert সাপোর্ট', false],
                    ['Money-back গ্যারান্টি', false],
                  ].map(([text, on], idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      {on ? (
                        <>
                          <span className="shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center shadow-sm bg-blue-600">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                          <span className="feature-text font-semibold text-slate-700 bn">{text as string}</span>
                        </>
                      ) : (
                        <>
                          <span className="shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center bg-slate-100">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </span>
                          <span className="feature-text font-medium text-slate-400 line-through bn">{text as string}</span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>

                <Link 
                  href="/courses"
                  className="block w-full py-3.5 rounded-xl font-black text-center transition-all duration-150 bn border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-[0.9375rem]"
                >
                  Basic Plan নিন
                </Link>
                <p className="text-center text-xs text-slate-400 font-medium mt-3 bn">৩০ দিনের জন্য মাত্র ৳{basicPriceBn}</p>
              </div>
            </div>

            {/* PRO PLAN */}
            <div 
              className="pricing-card rounded-2xl flex flex-col overflow-hidden relative hover:-translate-y-1 transition-transform duration-200"
              style={{ border: '2px solid #2563eb', background: '#f0f7ff', boxShadow: '0 10px 36px rgba(37,99,235,0.2)' }}
            >
              {/* RECOMMENDED Ribbon */}
              <div className="absolute top-0 right-0 w-[92px] h-[92px] overflow-hidden pointer-events-none">
                <div 
                  className="absolute top-[20px] right-[-30px] w-[116px] text-center py-[7px] text-white font-black tracking-widest rotate-45 shadow bg-blue-600 text-[0.6rem] [letter-spacing:0.12em]"
                >
                  RECOMMENDED
                </div>
              </div>

              <div className="px-7 pt-8 pb-6 text-center" style={{ borderBottom: '1.5px solid #dbeafe' }}>
                <h2 className="text-[1.15rem] font-black mb-1 bn text-blue-600">Pro Plan</h2>
                <p className="text-sm font-semibold mb-4 bn text-slate-500">পূর্ণাঙ্গ প্রস্তুতি</p>
                <div className="flex items-baseline justify-center gap-0.5">
                  <span className="text-xl font-black text-slate-500">৳</span>
                  <span className="font-black text-slate-900 leading-none tracking-tight text-[3rem]">{proPriceBn}</span>
                  <span className="text-sm font-bold text-slate-400 ml-1 self-end mb-1">/ ৩ মাস</span>
                </div>
                <div className="flex justify-center">
                  <span 
                    className="access-pill bn" 
                    style={{ borderColor: '#93c5fd', background: '#dbeafe', color: '#1e40af' }}
                  >
                    যেকোনো ১টি Occupation &bull; ৯০ দিনের অ্যাক্সেস
                  </span>
                </div>
              </div>

              <div className="px-7 pt-5 pb-7 flex flex-col flex-1">
                <ul className="space-y-3.5 flex-1 mb-5">
                  {[
                    'সকল Unit-এর MCQ Question Bank',
                    'গুরুত্বপূর্ণ Written প্রশ্ন ব্যাংক',
                    'ইনস্ট্যান্ট রেজাল্ট ও ব্যাখ্যা',
                    'সার্বক্ষণিক Expert সাপোর্ট',
                    'যেকোনো প্রশ্নের বিস্তারিত ব্যাখ্যা',
                  ].map((text, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <span className="shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center shadow-sm bg-blue-600">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span className="feature-text font-semibold text-slate-700 bn">{text}</span>
                    </li>
                  ))}
                </ul>

                {/* Money Back Guarantee Box */}
                <div className="flex items-start gap-3 p-4 rounded-xl mb-6 bg-amber-50 border border-amber-200">
                  <span className="shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center mt-0.5 bg-amber-500">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-black bn text-[0.9rem] text-amber-800 leading-normal">৫০% Money-back গ্যারান্টি</p>
                    <p className="text-xs font-semibold mt-0.5 bn text-amber-700">NYC হলে অর্ধেক টাকা ফেরত!</p>
                  </div>
                </div>

                <Link 
                  href="/courses"
                  className="block w-full py-3.5 rounded-xl font-black text-white text-center transition-all duration-150 bn bg-blue-600 hover:bg-blue-700 text-[0.9375rem] shadow-md hover:shadow-lg"
                >
                  Pro Plan নিন
                </Link>
                <p className="text-center text-xs text-slate-400 font-medium mt-3 bn">৩ মাসের জন্য মাত্র ৳{proPriceBn}</p>
              </div>
            </div>

          </div>
        </div>

        {/* FAQs accordion */}
        <div className="max-w-3xl mx-auto px-4 mt-20">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest border border-indigo-100 mb-4">FAQ</span>
            <h2 className="text-3xl font-black text-slate-900 mb-2">সচরাচর জিজ্ঞাসা</h2>
            <p className="text-slate-500 text-sm font-medium">আপনার মনে কোনো প্রশ্ন থাকলে এখান থেকে জেনে নিন</p>
          </div>

          <div className="space-y-3">
            {pricingFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index} 
                  className="border border-slate-200 rounded-2xl bg-white overflow-hidden transition-all duration-300 hover:border-slate-300 hover:shadow-sm"
                >
                  <button 
                    onClick={() => toggleFaq(index)} 
                    className="flex items-center justify-between w-full px-6 py-5 text-left focus:outline-none"
                  >
                    <span className={`font-bold text-slate-800 text-sm pr-4 leading-snug ${isOpen ? 'text-indigo-600' : ''}`}>
                      {faq.q}
                    </span>
                    <span 
                      className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${isOpen ? 'bg-indigo-50 text-indigo-600 rotate-180' : 'bg-slate-50 text-slate-400'}`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-0 border-t border-slate-50 transition-all">
                      <p className="text-slate-600 text-sm leading-relaxed font-medium pt-4 whitespace-pre-line">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
            {pricingFaqs.length === 0 && (
              <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl">
                <p className="text-slate-400 font-medium text-sm">No FAQs available right now.</p>
              </div>
            )}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 p-1.5 pr-6 bg-white rounded-full border border-slate-200 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-sm text-slate-600 font-semibold">
                আরো প্রশ্ন? <Link href="/contact" className="text-indigo-600 hover:text-indigo-700 font-black underline underline-offset-2">যোগাযোগ করো</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
