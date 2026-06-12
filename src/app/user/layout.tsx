'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const navigation = [
    { name: 'Dashboard', href: '/user/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'My Courses', href: '/user/my-courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { name: 'Profile Settings', href: '/user/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex flex-col items-center text-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-blue-50" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-3xl mb-4 border-4 border-white shadow-sm">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-800">{user?.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{user?.phone}</p>
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold uppercase tracking-wide">
                  Student
                </span>
              </div>
            </div>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                    </svg>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Dashboard Content */}
          <main className="flex-1">
            {children}
          </main>
          
        </div>
      </div>
    </div>
  );
}
