import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getResourceUrl } from "@/lib/api";

export const metadata = {
  title: "Notice Board — NSDA Training & Circular | AssessmentBD",
  description: "NSDA Assessment training, recruitment notice, exam circular এবং skill development সংক্রান্ত সর্বশেষ আপডেট দেখুন। সরকারি ও বেসরকারি প্রতিষ্ঠানের নিয়োগ ও প্রশিক্ষণ বিজ্ঞপ্তি।",
};

export default async function NoticePage(props: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";
  const category = searchParams.category || "";
  const page = parseInt(searchParams.page || "1", 10);
  const take = 10;
  const skip = (page - 1) * take;

  // Filter clauses
  const whereClause: any = { status: "published" };
  if (category) {
    whereClause.category = category;
  }
  if (q) {
    whereClause.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { tags: { contains: q } }
    ];
  }

  // Fetch notices & total count
  const [noticesRaw, total] = await prisma.$transaction([
    prisma.notices.findMany({
      where: whereClause,
      orderBy: { published_at: "desc" },
      skip,
      take
    }),
    prisma.notices.count({ where: whereClause })
  ]);

  // Fetch unique categories
  const categoriesRaw = await prisma.notices.findMany({
    where: { status: "published", category: { not: null } },
    select: { category: true },
    distinct: ["category"]
  });
  const categories = categoriesRaw.map(c => c.category as string).filter(Boolean);

  // Serialize BigInt and date
  const notices = JSON.parse(
    JSON.stringify(noticesRaw, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );

  const totalPages = Math.ceil(total / take);
  const startItem = skip + 1;
  const endItem = Math.min(skip + take, total);

  // Style tags helper
  const activeStyle = { background: "#2563eb", color: "#fff", boxShadow: "0 2px 10px rgba(37,99,235,.35)" };
  const inactiveStyle = { background: "#f1f5f9", color: "#475569" };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Header */}
      <div 
        style={{ background: "linear-gradient(135deg,#0f172a 0%,#0948b3 60%,#0f172a 100%)" }} 
        className="py-10 md:py-14 relative overflow-hidden"
      >
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%)" }}
        />
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <span 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4 border" 
            style={{ background: "rgba(59,130,246,.15)", color: "#93c5fd", borderColor: "rgba(59,130,246,.3)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            সর্বশেষ নোটিশ
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
            NSDA Training & <span style={{ color: "#60a5fa" }}>Circular Board</span>
          </h1>
          <p className="text-base font-medium mb-6 text-slate-400">
            সরকারি ও বেসরকারি প্রশিক্ষণ, নিয়োগ বিজ্ঞপ্তি এবং Assessment পরীক্ষার সর্বশেষ আপডেট।
          </p>
          
          <form method="GET" action="/notice" className="max-w-lg mx-auto">
            <div className="flex gap-2 rounded-2xl p-1.5" style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)" }}>
              <input 
                type="text" 
                name="q" 
                defaultValue={q} 
                placeholder="নোটিশ খুঁজুন..."
                className="flex-1 bg-transparent text-white outline-none px-3 text-sm font-medium placeholder-white/50"
              />
              {category && <input type="hidden" name="category" value={category} />}
              <button type="submit" className="px-4 py-2 rounded-xl text-sm font-bold text-white transition cursor-pointer" style={{ background: "#2563eb" }}>
                খুঁজুন
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        
        {/* Categories Bar */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link 
              href="/notice"
              style={!category ? activeStyle : inactiveStyle}
              className="px-4 py-2 rounded-full text-sm font-bold transition-all"
            >
              সব নোটিশ
            </Link>
            {categories.map((cat) => (
              <Link 
                key={cat}
                href={`/notice?category=${encodeURIComponent(cat)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                style={category === cat ? activeStyle : inactiveStyle}
                className="px-4 py-2 rounded-full text-sm font-bold transition-all"
              >
                {cat}
              </Link>
            ))}
          </div>
        )}

        {notices.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "#eff6ff" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="1.5">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">কোনো নোটিশ পাওয়া যায়নি</h3>
            <Link href="/notice" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600">
              সব নোটিশ দেখুন
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5 max-w-2xl mx-auto">
              <p className="text-[12px] font-semibold text-slate-400">
                মোট <span className="font-black text-slate-700">{total}</span> নোটিশ 
                {q && <span className="text-slate-400"> — &quot;{q}&quot;</span>}
              </p>
              <p className="text-[11px] text-slate-400">
                {startItem}–{endItem} / {total}
              </p>
            </div>

            {/* Circular list */}
            <div className="max-w-2xl mx-auto space-y-5">
              {notices.map((notice: any) => {
                const noticeUrl = `/notice/${notice.slug}`;
                const noticeImage = notice.image ? getResourceUrl(notice.image) : null;
                const sourceFirst = notice.source ? notice.source.substring(0, 1) : "N";

                return (
                  <div key={notice.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                    
                    {/* Header bar */}
                    <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-black text-white text-sm bg-blue-600">
                        {sourceFirst}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">
                          {notice.source || "AssessmentBD Notice"}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">
                          {notice.published_at ? new Date(notice.published_at).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" }) : ""} · 
                          <span className="inline-flex items-center gap-1 ml-1.5">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg> 
                            {notice.views || 0}
                          </span>
                        </p>
                      </div>
                      {notice.category && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0 bg-blue-50 text-blue-600">
                          {notice.category}
                        </span>
                      )}
                    </div>

                    {/* Content / Title */}
                    <div className="px-4 pb-3">
                      <Link href={noticeUrl} className="font-bold text-slate-900 hover:text-blue-600 transition-colors leading-snug text-[15px] block">
                        {notice.title}
                      </Link>
                      {notice.description && (
                        <p className="text-slate-500 text-sm font-medium leading-relaxed mt-1.5 line-clamp-3">
                          {notice.description.replace(/<[^>]*>?/gm, "").substring(0, 180)}...
                        </p>
                      )}
                    </div>

                    {/* Main Image */}
                    {noticeImage && (
                      <Link href={noticeUrl} className="block border-t border-slate-50">
                        <img src={noticeImage} alt={notice.title} className="w-full object-contain max-h-[500px] bg-slate-50" />
                      </Link>
                    )}

                    {/* Share & actions */}
                    <div className="flex items-center gap-1 px-3 py-2 border-t border-slate-100 bg-slate-50/50">
                      <Link href={noticeUrl} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition flex-1 justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        বিস্তারিত পড়ুন
                      </Link>
                      <a 
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://assessmentbd.com" + noticeUrl)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition flex-1 justify-center"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                        </svg>
                        Facebook
                      </a>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-10 max-w-2xl mx-auto border-t border-slate-200 pt-6">
                <div>
                  {page === 1 ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-[12px] font-bold text-slate-300 bg-white select-none">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg> Previous
                    </span>
                  ) : (
                    <Link href={`/notice?page=${page - 1}${category ? `&category=${encodeURIComponent(category)}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-[12px] font-bold text-slate-700 bg-white hover:border-blue-400 hover:text-blue-700 transition shadow-sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg> Previous
                    </Link>
                  )}
                </div>
                <span className="text-[12px] font-semibold text-slate-500">Page <strong className="text-slate-800">{page}</strong> of {totalPages}</span>
                <div>
                  {page >= totalPages ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-[12px] font-bold text-slate-300 bg-white select-none">
                      Next <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </span>
                  ) : (
                    <Link href={`/notice?page=${page + 1}${category ? `&category=${encodeURIComponent(category)}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-bold text-[12px] bg-blue-600 hover:bg-blue-700 transition shadow-sm">
                      Next <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
