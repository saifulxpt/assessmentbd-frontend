"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header({
  authNav,
  logoUrl
}: {
  authNav: React.ReactNode;
  logoUrl?: string;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-slate-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" prefetch={false} className="flex items-center gap-2 group">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="AssessmentBD"
                className="h-10 md:h-14 w-auto object-contain group-hover:opacity-90 transition-opacity"
                style={{ maxWidth: "220px" }}
                width="220"
                height="56"
              />
            ) : (
              <>
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <span className="text-xl md:text-2xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors leading-none">
                    AssessmentBD
                  </span>
                  <p className="text-[9px] font-semibold text-slate-400 tracking-wider hidden md:block">
                    Competent With Confidence
                  </p>
                </div>
              </>
            )}
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" prefetch={false} className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/courses" prefetch={false} className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
              Courses
            </Link>
            <Link href="/pricing" prefetch={false} className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
              Packages
            </Link>
            <Link href="/about" prefetch={false} className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
              About Us
            </Link>
            <Link href="/contact" prefetch={false} className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Auth Buttons Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {authNav}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/70"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Drawer Panel */}
          <div className="relative w-[285px] max-w-sm bg-white h-full shadow-2xl flex flex-col ml-auto z-10">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <Link href="/" prefetch={false} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                {logoUrl ? (
                  <img src={logoUrl} alt="AssessmentBD" className="h-8 w-auto object-contain" />
                ) : (
                  <span className="font-black text-slate-900 text-[17px]">AssessmentBD</span>
                )}
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Nav List */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
              <Link
                href="/"
                prefetch={false}
                className="block px-3.5 py-3 rounded-xl font-bold text-[15px] text-slate-700 hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/courses"
                prefetch={false}
                className="block px-3.5 py-3 rounded-xl font-bold text-[15px] text-slate-700 hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Courses
              </Link>
              <Link
                href="/pricing"
                prefetch={false}
                className="block px-3.5 py-3 rounded-xl font-bold text-[15px] text-slate-700 hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Packages
              </Link>
              <Link
                href="/about"
                prefetch={false}
                className="block px-3.5 py-3 rounded-xl font-bold text-[15px] text-slate-700 hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                prefetch={false}
                className="block px-3.5 py-3 rounded-xl font-bold text-[15px] text-slate-700 hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>

              <div className="mt-4 pt-4 border-t border-slate-100">
                {authNav}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
