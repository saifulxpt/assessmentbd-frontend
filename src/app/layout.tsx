import type { Metadata } from "next";
import { Hind_Siliguri, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NSDA Assessment Preparation — AssessmentBD",
  description: "NSDA TVET Trainee Assessment-এর জন্য সেরা Question Bank।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={`${hindSiliguri.variable} ${inter.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col font-sans bg-white text-slate-900 antialiased">
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="container mx-auto px-4 max-w-7xl h-20 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">AssessmentBD</Link>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button className="text-gray-600 hover:text-blue-600 focus:outline-none">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Home</Link>
              <Link href="/courses" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Courses</Link>
              <Link href="/blog" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Blog</Link>
              <Link href="/about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">About Us</Link>
              <Link href="/contact" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Contact</Link>
              
              <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-gray-200">
                <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Log in</Link>
                <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                  Sign up
                </Link>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow pt-20">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-16 border-t border-gray-800">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="col-span-1 md:col-span-1">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <span className="text-2xl font-bold text-white tracking-tight">AssessmentBD</span>
                </div>
                <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                  Your ultimate platform for online learning, exam preparation, and skill development in Bangladesh.
                </p>
              </div>
              
              <div>
                <h4 className="text-white font-semibold text-lg mb-6">Quick Links</h4>
                <ul className="space-y-4 text-sm">
                  <li><Link href="/courses" className="hover:text-white transition-colors">All Courses</Link></li>
                  <li><Link href="/blog" className="hover:text-white transition-colors">Latest News</Link></li>
                  <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-semibold text-lg mb-6">Legal</h4>
                <ul className="space-y-4 text-sm">
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
                  <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
