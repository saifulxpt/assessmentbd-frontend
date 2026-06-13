"use client";

import { useState } from "react";
import Link from "next/link";

export default function FaqClient({
  faqsList,
  sections
}: {
  faqsList: any[];
  sections: string[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Filter FAQs based on active tab and search query
  const filteredFaqs = faqsList.filter((faq, idx) => {
    const matchesTab = activeTab === "all" || faq.section === activeTab;
    const cleanSearch = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !cleanSearch ||
      faq.q.toLowerCase().includes(cleanSearch) ||
      faq.a.toLowerCase().includes(cleanSearch);
    return matchesTab && matchesSearch;
  });

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section with Search */}
      <div 
        className="relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #0f172a 100%)" }}
      >
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ backgroundImage: "radial-gradient(circle at 15% 60%, rgba(59, 130, 246, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)" }}
        />
        
        <div className="max-w-4xl mx-auto px-4 py-14 md:py-20 text-center relative z-10">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            কীভাবে আমরা আপনাকে সাহায্য করতে পারি?
          </h1>
          <p className="text-slate-300 text-[14px] md:text-base font-medium max-w-2xl mx-auto leading-relaxed mb-6">
            AssessmentBD সম্পর্কে আপনার যেকোনো প্রশ্নের উত্তর এখানে সহজে খুঁজে নিন।
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl shadow-xl flex items-center p-1.5 border border-slate-200">
              <span className="pl-4 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </span>
              <input 
                type="text" 
                placeholder="আপনার প্রশ্নটি এখানে খুঁজুন..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setOpenFaqIndex(null);
                }}
                className="w-full pl-3 pr-4 py-3 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none font-medium text-sm md:text-base"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 relative z-20">
        <div className="max-w-4xl mx-auto px-4">
          
          {faqsList.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <p className="text-slate-500 font-bold text-lg">কোনো প্রশ্ন পাওয়া যায়নি।</p>
            </div>
          ) : (
            <>
              {/* Category Filter Navigation */}
              <div className="mb-10 overflow-x-auto no-scrollbar flex items-center gap-2 pb-3 border-b border-slate-200/60 -mx-4 px-4 md:mx-0 md:px-0">
                <button 
                  onClick={() => {
                    setActiveTab("all");
                    setOpenFaqIndex(null);
                  }}
                  className={`px-5 py-2.5 rounded-full font-bold text-xs md:text-sm whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                    activeTab === "all" 
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10" 
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  সব প্রশ্ন
                </button>
                {sections.map((sec) => (
                  <button 
                    key={sec}
                    onClick={() => {
                      setActiveTab(sec);
                      setOpenFaqIndex(null);
                    }}
                    className={`px-5 py-2.5 rounded-full font-bold text-xs md:text-sm whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                      activeTab === sec 
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10" 
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>

              {/* FAQ Accordion Cards */}
              <div className="space-y-4">
                {filteredFaqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div 
                      key={index}
                      className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 ${
                        isOpen ? "ring-2 ring-blue-500/10 border-blue-400 shadow-md" : "border-slate-200"
                      }`}
                    >
                      <button 
                        onClick={() => toggleFaq(index)} 
                        className="w-full flex items-center justify-between p-5 text-left gap-4 focus:outline-none cursor-pointer"
                      >
                        <span 
                          className={`font-bold text-slate-800 text-[14px] md:text-[16px] leading-snug pr-4 transition-colors duration-200 ${
                            isOpen ? "text-blue-600" : ""
                          }`}
                        >
                          {faq.q}
                        </span>
                        <span 
                          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isOpen ? "bg-blue-50 text-blue-600 rotate-180" : "bg-slate-50 text-slate-400 border border-slate-200"
                          }`}
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </span>
                      </button>
                      
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1">
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100/80">
                            <p className="text-slate-600 text-[13px] md:text-[15px] leading-relaxed font-medium whitespace-pre-line">
                              {faq.a}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Empty Search Results State */}
                {filteredFaqs.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-400">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    </div>
                    <h3 className="text-slate-800 font-bold text-lg mb-1">কোনো তথ্য খুঁজে পাওয়া যায়নি!</h3>
                    <p className="text-slate-400 text-sm font-medium">আপনার অনুসন্ধান শব্দের বানান চেক করুন অথবা অন্য কী-ওয়ার্ড দিয়ে চেষ্টা করুন।</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Still have questions CTA */}
          <div className="mt-20 bg-white rounded-3xl p-8 md:p-10 border border-slate-200/80 text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>
            
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-blue-600 mb-5 relative z-10 border border-blue-100 shadow-sm" style={{ background: "linear-gradient(135deg, #eff6ff, #ffffff)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2 relative z-10">আরো কোনো প্রশ্ন আছে?</h3>
            <p className="text-slate-500 text-sm md:text-base font-medium mb-8 max-w-lg mx-auto relative z-10">
              আপনার কাঙ্খিত প্রশ্নের উত্তর যদি এখানে না পেয়ে থাকেন, তবে নির্দ্বিধায় আমাদের মেসেজ পাঠান।
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 relative z-10 hover:-translate-y-0.5" 
              style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", boxShadow: "0 8px 20px rgba(37, 99, 235, 0.25)" }}
            >
              আমাদের সাথে যোগাযোগ করুন
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          </div>

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
