import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getResourceUrl } from "@/lib/api";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const notice = await prisma.notices.findUnique({
    where: { slug: params.slug }
  });

  if (!notice) return { title: "Notice Not Found" };

  return {
    title: `${notice.title} | AssessmentBD`,
    description: notice.seo_description || notice.description?.replace(/<[^>]*>?/gm, "").substring(0, 155),
    keywords: notice.seo_keywords || "nsda notice, circular training, assessment preparation"
  };
}

export default async function NoticeDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const slug = params.slug;

  const notice = await prisma.notices.findUnique({
    where: { slug }
  });

  if (!notice || notice.status !== "published") {
    notFound();
  }

  // Increment views in database
  await prisma.notices.update({
    where: { id: notice.id },
    data: { views: { increment: 1 } }
  });

  // Fetch related notices
  const relatedRaw = await prisma.notices.findMany({
    where: { 
      status: "published",
      id: { not: notice.id }
    },
    orderBy: { published_at: "desc" },
    take: 4
  });

  // Serialize BigInt and date
  const serializedNotice = JSON.parse(
    JSON.stringify(notice, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );

  const related = JSON.parse(
    JSON.stringify(relatedRaw, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );

  const tagsArray = serializedNotice.tags 
    ? serializedNotice.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
    : [];

  const noticeImage = serializedNotice.image ? getResourceUrl(serializedNotice.image) : null;
  const absoluteUrl = `https://assessmentbd.com/notice/${serializedNotice.slug}`;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-slate-500 font-semibold overflow-x-auto whitespace-nowrap hide-scrollbar">
            <Link href="/" className="hover:text-blue-600 transition-colors">হোম</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
            <Link href="/notice" className="hover:text-blue-600 transition-colors">Notice Board</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
            <span className="text-slate-800 truncate max-w-xs">{serializedNotice.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {serializedNotice.category && (
              <Link 
                href={`/notice?category=${encodeURIComponent(serializedNotice.category)}`}
                className="px-3 py-1.5 text-white text-xs font-bold rounded-full bg-blue-600"
              >
                {serializedNotice.category}
              </Link>
            )}
            {tagsArray.map((tag: string) => (
              <span key={tag} className="px-3 py-1.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-4">{serializedNotice.title}</h1>

          {serializedNotice.source && (
            <div className="flex items-center gap-2 mb-4 px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-50 text-blue-800 border border-blue-200">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              {serializedNotice.source}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-semibold pb-5 border-b border-slate-200">
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {serializedNotice.published_at ? new Date(serializedNotice.published_at).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" }) : ""}
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {serializedNotice.views} views
            </span>
          </div>
        </header>

        {/* Notice Image */}
        {noticeImage && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-xl border border-slate-100">
            <img src={noticeImage} alt={serializedNotice.title} className="w-full object-contain max-h-[600px] bg-slate-50" />
          </div>
        )}

        {/* Emergency disclaimer warning */}
        <div className="mb-6 px-4 py-3.5 rounded-xl text-sm flex items-start gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <p className="leading-relaxed font-medium">
            <strong className="font-bold">জরুরি সতর্কীকরণ:</strong> এই notice বা circular-টি অন্যান্য মাধ্যম (WhatsApp, Facebook ইত্যাদি) থেকে সংগৃহীত। এর শতভাগ সত্যতা সম্পর্কে AssessmentBD কোনো গ্যারান্টি দেয় না। এই নোটিশের সূত্র ধরে কারো সাথে কোনো আর্থিক লেনদেন বা ব্যক্তিগত তথ্য শেয়ার করে কেউ প্রতারিত হলে AssessmentBD কোনো দায়ভার গ্রহণ করবে না। যেকোনো সিদ্ধান্ত বা পদক্ষেপ নেওয়ার আগে নিজ দায়িত্বে মূল উৎস থেকে তথ্যটি যাচাই করুন।
          </p>
        </div>

        {/* Description body */}
        {serializedNotice.description && (
          <div className="mb-10 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              বিস্তারিত বিবরণ
            </h2>
            <div className="text-slate-600 leading-relaxed whitespace-pre-line text-[15px]">{serializedNotice.description}</div>
          </div>
        )}

        {/* Social Share widget */}
        <div className="rounded-2xl p-6 mb-10 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <p className="font-bold text-slate-700 mb-4 text-[15px]">এই Notice শেয়ার করুন</p>
          <div className="flex flex-wrap gap-3">
            <a 
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absoluteUrl)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1877F2] text-white rounded-xl text-sm font-bold hover:opacity-90 transition cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              Facebook
            </a>
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(serializedNotice.title + " — " + absoluteUrl)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white rounded-xl text-sm font-bold hover:opacity-90 transition cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              WhatsApp
            </a>
          </div>
        </div>

        {/* Start Assessment CTA Box */}
        <div className="rounded-2xl p-6 mb-10 text-center bg-gradient-to-r from-blue-900 to-blue-700 border border-blue-600">
          <p className="text-white font-bold text-lg mb-2">NSDA Assessment-এর लिखित পরীক্ষার প্রস্তুতি নিন</p>
          <p className="text-blue-200 text-sm font-medium mb-4">AssessmentBD-তে আপনার ট্রেড অনুযায়ী মক টেস্ট দিয়ে যাচাই করুন কতটুকু প্রস্তুত</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-2.5 bg-white font-bold text-sm rounded-xl transition hover:bg-blue-50 text-blue-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
            এখনই শুরু করুন
          </Link>
        </div>

        {/* Related Notices list */}
        {related.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-5 flex items-center gap-3">
              <span className="w-1 h-6 rounded-full inline-block bg-blue-600"></span>
              আরো Notice
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((r: any) => {
                const rImage = r.image ? getResourceUrl(r.image) : null;
                return (
                  <Link 
                    key={r.id}
                    href={`/notice/${r.slug}`}
                    className="group bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-blue-50 flex items-center justify-center">
                      {rImage ? (
                        <img src={rImage} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#bfdbfe" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                      )}
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <h3 className="font-bold text-slate-800 text-[13px] group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">{r.title}</h3>
                      <p className="text-[11px] text-slate-400 font-semibold mt-1.5">{r.published_at ? new Date(r.published_at).toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" }) : ""}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
