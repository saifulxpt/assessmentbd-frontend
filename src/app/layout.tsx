import type { Metadata } from "next";
import { Hind_Siliguri, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./providers";
import AuthNav from "@/components/AuthNav";
import Header from "@/components/Header";
import Script from "next/script";
import { prisma, getCachedSettings } from "@/lib/prisma";
import { getResourceUrl } from "@/lib/api";
import { headers } from "next/headers";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AssessmentBD | Competent With Confidence",
  description: "AssessmentBD — Competent With Confidence। AssessmentBD লেভেল অ্যাসেসমেন্ট পরীক্ষার জন্য বাংলাদেশের সেরা অনলাইন প্ল্যাটফর্ম।",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Query database settings for public pages (memoized per-request)
  const settingsMap = await getCachedSettings();


  // Parse Logo
  const rawLogo = settingsMap["site_logo"] || settingsMap["resource_logo"];
  const logoUrl = rawLogo ? getResourceUrl(rawLogo) : undefined;

  // Announcement Bar Settings
  const annEnabled = settingsMap["announcement_enabled"] === "1" && settingsMap["announcement_text"];
  const annText = settingsMap["announcement_text"] || "";
  const annBg = settingsMap["announcement_bg"] || "#0b57d0";
  const annSpeed = settingsMap["announcement_speed"] || "normal";
  const annDuration = { slow: "40s", normal: "25s", fast: "14s" }[annSpeed] || "25s";

  // Footer Settings
  const footerDesc = settingsMap["footer_description"] || "NSDA লেভেল অ্যাসেসমেন্ট পরীক্ষার জন্য বাংলাদেশের সবচেয়ে আধুনিক এবং কার্যকরী প্র্যাকটিস প্ল্যাটফর্ম।";
  const socialFb = settingsMap["social_facebook"] || "";
  const socialYt = settingsMap["social_youtube"] || "";
  const socialLi = settingsMap["social_linkedin"] || "";
  const siteWa = settingsMap["site_whatsapp"] || "";
  const sitePhone = settingsMap["site_phone"] || "+880 1603-409757";

  // Clean WhatsApp Number
  const cleanWa = siteWa.replace(/[^0-9]/g, "");
  const waFormatted = cleanWa.length === 11 && cleanWa.startsWith("01") ? `88${cleanWa}` : cleanWa;

  // Tawk.to settings (disabled in development to avoid console script crashes)
  const tawkEnabled = settingsMap["tawk_enabled"] === "1" && process.env.NODE_ENV !== "development";

  const tawkRawScript = settingsMap["tawk_raw_script"] || "";
  const tawkPropertyId = settingsMap["tawk_property_id"] || "";
  const tawkWidgetId = settingsMap["tawk_widget_id"] || "";

  // Get current pathname from request headers set by middleware
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  const isDashboardOrLearnOrAdmin = 
    pathname.startsWith('/user') || 
    pathname.startsWith('/learn') || 
    pathname.startsWith('/admin');

  const showHeaderFooter = !isDashboardOrLearnOrAdmin;

  return (
    <html lang="bn" className={`${hindSiliguri.variable} ${inter.variable} scroll-smooth`}>
      <head>
        {/* Dynamic style for header-announcement padding offset */}
        <style dangerouslySetInnerHTML={{ __html: `
          #main-content { padding-top: ${showHeaderFooter && annEnabled ? (64 + 36) : (showHeaderFooter ? 64 : 0)}px; }
          @media (min-width: 768px) { #main-content { padding-top: ${showHeaderFooter && annEnabled ? (80 + 36) : (showHeaderFooter ? 80 : 0)}px; } }
          
          @keyframes marquee-scroll {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-33.333%); }
          }
        ` }} />
      </head>
      <body 
        className="min-h-screen flex flex-col antialiased text-slate-800 bg-[#f8fafc]"
        style={{ fontFamily: 'var(--font-hind-siliguri), var(--font-inter), sans-serif' }}
      >
        <Providers>
          {showHeaderFooter && <Header logoUrl={logoUrl} authNav={<AuthNav />} />}

          {/* Announcement notice bar */}
          {showHeaderFooter && annEnabled && (
            <div 
              id="ann-bar" 
              className="fixed left-0 right-0 z-40 overflow-hidden flex items-center gap-3 px-4 top-16 md:top-20"
              style={{ background: annBg, height: "36px" }}
            >
              <span className="shrink-0 text-white opacity-90">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 11l19-9-9 19-2-8-8-2z"/>
                </svg>
              </span>
              <div className="flex-1 overflow-hidden whitespace-nowrap">
                <div className="inline-flex gap-16" style={{ animation: `marquee-scroll ${annDuration} linear infinite` }}>
                  <span className="text-white text-[13px] font-semibold tracking-wide shrink-0">{annText}</span>
                  <span className="text-white text-[13px] font-semibold tracking-wide shrink-0">{annText}</span>
                  <span className="text-white text-[13px] font-semibold tracking-wide shrink-0">{annText}</span>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-grow" id="main-content">
            {children}
          </main>

          {/* Footer Component */}
          {showHeaderFooter ? (
            <footer className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 pt-20 pb-12 mt-auto border-t-[6px] border-blue-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-12 gap-y-10 gap-x-6 md:gap-8 lg:gap-12 mb-16">
                
                {/* Brand Info */}
                <div className="col-span-2 md:col-span-6 lg:col-span-4">
                  <Link href="/" className="flex items-center gap-2 mb-6 group">
                    {logoUrl ? (
                      <div className="bg-white rounded-xl px-3 py-1.5 inline-flex items-center transition-transform duration-300 group-hover:scale-[1.02]">
                        <img src={logoUrl} alt="AssessmentBD" className="h-9 w-auto object-contain" style={{ maxWidth: "180px" }} />
                      </div>
                    ) : (
                      <>
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-2xl font-black tracking-tight text-white leading-none transition-colors duration-300 group-hover:text-blue-400">
                            AssessmentBD
                          </span>
                          <p className="text-[10px] font-medium text-slate-400 mt-0.5">Competent With Confidence</p>
                        </div>
                      </>
                    )}
                  </Link>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium pr-4">
                    {footerDesc} দিনশেষে আপনার হাতের কাজটাই আসল। কিন্তু ওইটুকু থিওরি বা MCQ-এর জন্য কেন আপনার অ্যাসেসমেন্ট আটকে থাকবে?
                  </p>
                  
                  {/* Social Handles */}
                  <div className="flex gap-3">
                    {socialFb && (
                      <a href={socialFb} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-300 hover:bg-[#1877F2] hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 border border-slate-700/50 shadow-sm" title="Facebook">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                        </svg>
                      </a>
                    )}
                    {socialYt && (
                      <a href={socialYt} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-300 hover:bg-[#FF0000] hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 border border-slate-700/50 shadow-sm" title="YouTube">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58a2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
                        </svg>
                      </a>
                    )}
                    {socialLi && (
                      <a href={socialLi} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-300 hover:bg-[#0A66C2] hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 border border-slate-700/50 shadow-sm" title="LinkedIn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>
                        </svg>
                      </a>
                    )}
                    {siteWa && (
                      <a href={`https://wa.me/${waFormatted}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-300 hover:bg-[#25D366] hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 border border-slate-700/50 shadow-sm" title="WhatsApp">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>

                {/* Quick Links */}
                <div className="col-span-1 md:col-span-3 lg:col-span-3 lg:col-start-6">
                  <h3 className="text-white font-bold text-lg mb-6 tracking-wide relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-12 after:h-[2px] after:bg-blue-600">Quick Links</h3>
                  <ul className="space-y-4 text-slate-400 text-sm font-medium">
                    <li>
                      <Link href="/" className="hover:text-blue-400 transition-all duration-300 flex items-center gap-2 hover:translate-x-1.5 group">
                        <svg className="text-slate-500 group-hover:text-blue-400 transition-colors duration-300" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg> 
                        <span>Home</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/courses" className="hover:text-blue-400 transition-all duration-300 flex items-center gap-2 hover:translate-x-1.5 group">
                        <svg className="text-slate-500 group-hover:text-blue-400 transition-colors duration-300" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                        <span>Courses</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/about" className="hover:text-blue-400 transition-all duration-300 flex items-center gap-2 hover:translate-x-1.5 group">
                        <svg className="text-slate-500 group-hover:text-blue-400 transition-colors duration-300" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg> 
                        <span>About Us</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/pricing" className="hover:text-blue-400 transition-all duration-300 flex items-center gap-2 hover:translate-x-1.5 group">
                        <svg className="text-slate-500 group-hover:text-blue-400 transition-colors duration-300" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg> 
                        <span>Packages</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog" className="hover:text-blue-400 transition-all duration-300 flex items-center gap-2 hover:translate-x-1.5 group">
                        <svg className="text-slate-500 group-hover:text-blue-400 transition-colors duration-300" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg> 
                        <span>Blog</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/notice" className="hover:text-blue-400 transition-all duration-300 flex items-center gap-2 hover:translate-x-1.5 group">
                        <svg className="text-slate-500 group-hover:text-blue-400 transition-colors duration-300" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg> 
                        <span>Notice</span>
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Important Links */}
                <div className="col-span-1 md:col-span-3 lg:col-span-3">
                  <h3 className="text-white font-bold text-lg mb-6 tracking-wide relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-12 after:h-[2px] after:bg-blue-600">Important</h3>
                  <ul className="space-y-4 text-slate-400 text-sm font-medium">
                    <li>
                      <Link href="/contact" className="hover:text-blue-400 transition-all duration-300 flex items-center gap-2 hover:translate-x-1.5 group">
                        <svg className="text-slate-500 group-hover:text-blue-400 transition-colors duration-300" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg> 
                        <span>Contact Us</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms" className="hover:text-blue-400 transition-all duration-300 flex items-center gap-2 hover:translate-x-1.5 group">
                        <svg className="text-slate-500 group-hover:text-blue-400 transition-colors duration-300" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg> 
                        <span>Terms & Conditions</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/privacy" className="hover:text-blue-400 transition-all duration-300 flex items-center gap-2 hover:translate-x-1.5 group">
                        <svg className="text-slate-500 group-hover:text-blue-400 transition-colors duration-300" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg> 
                        <span>Privacy Policy</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/refund-policy" className="hover:text-blue-400 transition-all duration-300 flex items-center gap-2 hover:translate-x-1.5 group">
                        <svg className="text-slate-500 group-hover:text-blue-400 transition-colors duration-300" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg> 
                        <span>Refund Policy</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/faq" className="hover:text-blue-400 transition-all duration-300 flex items-center gap-2 hover:translate-x-1.5 group">
                        <svg className="text-slate-500 group-hover:text-blue-400 transition-colors duration-300" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg> 
                        <span>FAQ</span>
                      </Link>
                    </li>
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
        ) : null}

          {/* Dynamic script loading for Tawk.to */}
          {tawkEnabled && (
            <>
              {tawkRawScript ? (
                <div dangerouslySetInnerHTML={{ __html: tawkRawScript }} />
              ) : (
                tawkPropertyId && tawkWidgetId && (
                  <Script
                    id="tawk-widget"
                    strategy="lazyOnload"
                    dangerouslySetInnerHTML={{
                      __html: `
                        var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
                        (function(){
                        var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                        s1.async=true;
                        s1.src='https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}';
                        s1.charset='UTF-8';
                        s0.parentNode.insertBefore(s1,s0);
                        })();
                      `
                    }}
                  />
                )
              )}
            </>
          )}
        </Providers>
      </body>
    </html>
  );
}
