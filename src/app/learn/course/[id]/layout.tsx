'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function LearnLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { token, isAuthenticated, isLoading } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://server.assessmentbd.com/api'}/user/learn/course/${id}/units`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        const result = await res.json();
        if (result.success) {
          setCourse(result.data.course);
          setUnits(result.data.units);
        } else {
          router.push('/user/my-courses');
        }
      } catch (err) {
        console.error("Failed to fetch course units", err);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && isAuthenticated) {
      fetchCourseData();
    } else if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [token, isLoading, isAuthenticated, id, router]);

  if (loading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-gray-50">
      {/* Sidebar Menu */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <Link href="/user/my-courses" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center mb-2">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            Back to Courses
          </Link>
          <h2 className="font-bold text-gray-900 leading-tight">{course?.title}</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Course Content</h3>
          
          {units.map((unit, index) => {
            const isActive = pathname.includes(`/unit/${unit.id}`);
            return (
              <Link 
                key={unit.id} 
                href={`/learn/course/${id}/unit/${unit.id}`}
                className={`flex items-start p-3 rounded-lg border transition-all ${isActive ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}
              >
                <div className={`mt-0.5 mr-3 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                  {unit.type === 'video' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                  )}
                </div>
                <div>
                  <span className={`text-sm font-medium block ${isActive ? 'text-blue-900' : 'text-gray-700'}`}>
                    <span className="text-gray-400 text-xs mr-1">{index + 1}.</span> {unit.title}
                  </span>
                  <span className="text-xs text-gray-500 mt-1 capitalize">{unit.type}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
