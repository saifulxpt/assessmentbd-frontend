"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getResourceUrl } from "@/lib/api";

export default function CoursesClient({
  courses,
  featured,
  sectors,
  total,
  page,
  take,
  q: initialQ,
  sector: initialSector,
  subscribedCourseIds,
  isLoggedIn
}: {
  courses: any[];
  featured: any[];
  sectors: string[];
  total: number;
  page: number;
  take: number;
  q: string;
  sector: string;
  subscribedCourseIds: string[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQ);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(!!initialQ || !!initialSector || page > 1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle Autocomplete Live Search Suggestions
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/courses/suggestions?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setOpen(data.length > 0);
        }
      } catch (err) {
        console.error("Suggestions fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  const handleBlur = () => {
    // Delay hiding so clicking suggestions registers first
    setTimeout(() => setOpen(false), 200);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/courses?q=${encodeURIComponent(query)}${initialSector ? `&sector=${encodeURIComponent(initialSector)}` : ""}`);
  };

  const totalPages = Math.ceil(total / take);
  const startItem = (page - 1) * take + 1;
  const endItem = Math.min(page * take, total);

  // Active state style options
  const activeStyle = { background: "#0b57d0", color: "#fff", boxShadow: "0 2px 10px rgba(11,87,208,.3)" };
  const inactiveStyle = { background: "#f1f5f9", color: "#475569" };

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* Hero Header */}
      <div 
        style={{ background: "linear-gradient(135deg,#0f172a 0%,#0948b3 60%,#0f172a 100%)" }} 
        className="py-10 md:py-14 relative"
      >
        <div 
          className="absolute inset-0 opacity-10 overflow-hidden" 
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%)" }}
        />
        
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <span 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4 border" 
            style={{ background: "rgba(59,130,246,.15)", color: "#93c5fd", borderColor: "rgba(59,130,246,.3)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            NSDA অফিসিয়াল কোর্স তালিকা
          </span>

          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
            NSDA কোর্স <span style={{ color: "#60a5fa" }}>তালিকা</span>
          </h1>
          <p className="text-base font-medium mb-6 text-slate-400">
            সরকার অনুমোদিত <strong className="text-white">{total}+</strong> কোর্স — Level 1 থেকে Level 6 পর্যন্ত। নিজের occupation খুঁজুন, assessment প্রস্তুতি নিন।
          </p>

          {/* Search suggestions wrapper */}
          <div className="relative max-w-lg mx-auto">
            <form onSubmit={handleSearchSubmit}>
              <div className="flex gap-2 rounded-2xl p-1.5 border border-white/20 bg-white/10">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onBlur={handleBlur}
                  autoComplete="off"
                  spellCheck="false"
                  placeholder="IT Support Service Level 3, Welding..."
                  className="flex-1 bg-transparent text-white outline-none px-3 text-sm font-medium placeholder-white/50"
                />
                {initialQ && (
                  <Link 
                    href={`/courses${initialSector ? `?sector=${encodeURIComponent(initialSector)}` : ""}`}
                    className="flex items-center px-2 text-white/60 hover:text-white transition text-lg"
                  >
                    ✕
                  </Link>
                )}
                <button type="submit" className="px-4 py-2 rounded-xl text-sm font-bold text-white transition cursor-pointer bg-blue-600">
                  খুঁজুন
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {open && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 text-left top-full">
                  {suggestions.map((s) => (
                    <Link
                      key={s.id}
                      href={`/courses/${s.slug}`}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition border-b border-slate-50 last:border-0 block"
                    >
                      <svg className="shrink-0 text-slate-300" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-800 truncate">{s.title}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate">{s.sector}</p>
                      </div>
                      <svg className="shrink-0 text-slate-300" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  ))}
                </div>
              )}
            </form>

            {initialQ && (
              <p className="text-blue-300 text-[11px] font-medium mt-2 text-left">
                &quot;<span className="text-white font-semibold">{initialQ}</span>&quot; — <span className="text-white font-bold">{total}</span>টি ফলাফল
              </p>
            )}
          </div>

        </div>
      </div>

      {/* FEATURED / FEATURED CARDS */}
      {featured && featured.length > 0 && (
        <div className="bg-white border-b border-slate-100 py-10">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-between mb-7">
              <h2 className="text-[20px] font-black text-slate-900 tracking-tight leading-tight">কোর্স সমূহ</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {featured.map((fc) => {
                const fcSubscribed = subscribedCourseIds.includes(fc.id);
                const isUpdating = !fc.hasQuestions;

                let btnUrl = `/courses/${fc.slug}`;
                if (fc.hasQuestions) {
                  btnUrl = `/order?course=${fc.id}`;
                }

                const thumbUrl = fc.thumbnail ? getResourceUrl(fc.thumbnail) : null;

                return (
                  <div 
                    key={fc.id} 
                    className={`relative rounded-2xl border-2 overflow-hidden group flex flex-col transition-all hover:shadow-lg hover:border-blue-300 bg-white ${
                      fc.featured_label ? "border-amber-200" : "border-slate-200"
                    }`}
                  >
                    {/* Thumbnail click to details */}
                    <Link href={`/courses/${fc.slug}`} className="block w-full aspect-video bg-slate-100 flex items-center justify-center relative overflow-hidden">
                      {thumbUrl ? (
                        <img src={thumbUrl} alt={fc.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 w-full h-full flex items-center justify-center text-white font-black text-4xl bg-gradient-to-br from-blue-600 to-blue-800">
                          {fc.title.substring(0, 1).toUpperCase()}
                        </div>
                      )}

                      {fc.featured_label && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-sm bg-amber-500 text-white">
                            {fc.featured_label}
                          </span>
                        </div>
                      )}

                      <div className="absolute top-3 right-3 z-10">
                        <span className="text-[11px] font-black px-3 py-1.5 rounded-lg shadow-sm bg-white/95 text-slate-800 backdrop-blur-md">
                          {fc.level}
                        </span>
                      </div>
                    </Link>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="mb-5">
                        <Link href={`/courses/${fc.slug}`} className="block text-[16px] font-black text-slate-900 leading-snug line-clamp-2 break-words group-hover:text-blue-600 transition-colors">
                          {fc.title}
                        </Link>
                      </div>

                      <div className="space-y-3 mb-6 flex-grow">
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                          <p className="flex-1 min-w-0 text-[13px] font-bold text-slate-700 leading-snug">MCQ প্রশ্ন ব্যাংক এবং উত্তর</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                          <p className="flex-1 min-w-0 text-[13px] font-bold text-slate-700 leading-snug">Written প্রশ্ন ব্যাংক উত্তর ও ব্যাখ্যা</p>
                        </div>
                      </div>

                      {/* CTA */}
                      {fcSubscribed ? (
                        <Link href={`/learn/course/${fc.id}`} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[13px] font-black bg-green-600 hover:bg-green-700 text-white transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          ড্যাশবোর্ডে যান
                        </Link>
                      ) : isUpdating ? (
                        <Link href={`/courses/${fc.slug}`} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[13px] font-black text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                          আপডেটিং চলছে
                        </Link>
                      ) : (
                        <Link href={btnUrl} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[13px] font-black text-white transition-colors hover:opacity-90 bg-gradient-to-r from-blue-700 to-blue-900">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                          এখনই কিনুন
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* Course List Wrapper */}
      <div>
        {/* Toggle see more buttons */}
        {!showAll && (
          <div className="text-center py-12">
            <button 
              onClick={() => setShowAll(true)} 
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-[14px] font-black text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl cursor-pointer bg-gradient-to-r from-blue-600 to-blue-800"
            >
              সব কোর্স দেখুন ({total})
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
        )}

        {showAll && (
          <div className="max-w-4xl mx-auto px-4 pb-8 pt-4">
            
            {courses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center shadow-sm">
                <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 bg-slate-100">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
                <p className="text-[16px] font-black text-slate-700 mb-1">কোনো কোর্স পাওয়া যায়নি</p>
                <p className="text-[12px] text-slate-400 mb-5">অন্য কীওয়ার্ড দিয়ে চেষ্টা করুন</p>
                <Link href="/courses" className="inline-flex px-5 py-2.5 rounded-xl text-white text-[13px] font-bold bg-blue-600">সব কোর্স দেখুন</Link>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[12px] font-semibold text-slate-400">
                    মোট <span className="font-black text-slate-700">{total}</span> কোর্স
                    {initialSector && <span className="text-slate-400"> — &quot;{initialSector}&quot;</span>}
                  </p>
                  <p className="text-[11px] text-slate-400 hidden sm:block">
                    {startItem}–{endItem} / {total}
                  </p>
                </div>

                {/* Table for Desktop */}
                <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-10">#</th>
                        <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">কোর্স</th>
                        <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-48">সেক্টর</th>
                        <th className="px-3 py-3 w-24"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {courses.map((c, i) => {
                        const index = startItem + i;
                        return (
                          <tr key={c.id} className="hover:bg-slate-50/60 transition-colors group">
                            <td className="px-4 py-3.5 text-[11px] font-semibold text-slate-300 tabular-nums">{index}</td>
                            <td className="px-4 py-3.5">
                              <Link href={`/courses/${c.slug}`} className="text-[13px] font-semibold text-slate-800 group-hover:text-blue-700 transition-colors leading-snug hover:underline underline-offset-2">
                                {c.title}
                              </Link>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="text-[11px] text-slate-400 font-medium">{c.sector || c.category}</span>
                            </td>
                            <td className="px-3 py-3.5 text-right">
                              <Link href={`/courses/${c.slug}`} className="text-[11px] font-bold px-3 py-1.5 rounded-lg text-white hover:opacity-85 transition bg-blue-600">
                                দেখুন
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* List for Mobile */}
                <div className="md:hidden bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
                  {courses.map((c) => (
                    <Link key={c.id} href={`/courses/${c.slug}`} className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-blue-50/60 active:bg-blue-100/60 transition-colors cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-800 leading-snug">{c.title}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">{c.sector || c.category}</p>
                      </div>
                      <svg className="shrink-0 text-slate-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  ))}
                </div>

                {/* Table Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 gap-3">
                    <div>
                      {page === 1 ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-[12px] font-bold text-slate-300 bg-white select-none">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg> আগের পেজ
                        </span>
                      ) : (
                        <Link href={`/courses?page=${page - 1}${initialSector ? `&sector=${encodeURIComponent(initialSector)}` : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}`} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-[12px] font-bold text-slate-700 bg-white hover:border-blue-400 hover:text-blue-700 transition shadow-sm">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg> আগের পেজ
                        </Link>
                      )}
                    </div>
                    <span className="text-[12px] font-semibold text-slate-500">পেজ <strong className="text-slate-800">{page}</strong> / {totalPages}</span>
                    <div>
                      {page >= totalPages ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-[12px] font-bold text-slate-300 bg-white select-none">
                          পরের পেজ <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </span>
                      ) : (
                        <Link href={`/courses?page=${page + 1}${initialSector ? `&sector=${encodeURIComponent(initialSector)}` : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}`} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-bold text-[12px] bg-blue-600 hover:bg-blue-700 transition shadow-sm">
                          পরের পেজ <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        )}
      </div>

      {/* SEO Sector Filter List footer */}
      <div className="border-t border-slate-100 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-[14px] font-black text-slate-700 mb-2">আপনি কি ফাইনাল অ্যাসেসমেন্টের জন্য সত্যিই প্রস্তুত?</h2>
            <p className="text-[12px] text-slate-500 leading-relaxed font-medium">প্র্যাকটিক্যাল কাজে হয়তো আপনি সেরা, কিন্তু MCQ বা Written অ্যাসেসমেন্টের জন্য আপনার প্রস্তুতি কেমন? রিঅ্যাসেসমেন্ট ফি দেওয়ার ঝুঁকি না নিয়ে, ফাইনাল অ্যাসেসমেন্টে বসার আগেই AssessmentBD-এ নিজেকে একবার যাচাই করে নিন। আপনার কাঙ্ক্ষিত Occupation বেছে নিয়ে আজই নিজেকে যাচাই করুন!</p>
          </div>
          <div>
            <h2 className="text-[14px] font-black text-slate-700 mb-3">সেক্টর অনুযায়ী ফিল্টার করুন</h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/courses"
                style={!initialSector ? activeStyle : inactiveStyle}
                className="px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all hover:opacity-90"
              >
                সব কোর্স
              </Link>
              {sectors.map((s) => (
                <Link
                  key={s}
                  href={`/courses?sector=${encodeURIComponent(s)}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                  style={initialSector === s ? activeStyle : inactiveStyle}
                  className="px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all hover:opacity-90"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
