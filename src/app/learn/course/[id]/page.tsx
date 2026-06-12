'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LearnCoursePage({ params }: { params: { id: string } }) {
  const { token, isAuthenticated, isLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://server.assessmentbd.com/api'}/user/learn/course/${params.id}/units`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        const result = await res.json();
        if (result.success) {
          setData(result.data);
          // Redirect to first unit if available
          if (result.data.units && result.data.units.length > 0) {
            router.replace(`/learn/course/${params.id}/unit/${result.data.units[0].id}`);
          }
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
  }, [token, isLoading, isAuthenticated, params.id, router]);

  if (loading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!data || !data.units || data.units.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">No content available</h1>
          <p className="text-gray-600 mb-8">This course currently has no units or videos available.</p>
          <Link href="/user/my-courses" className="text-blue-600 hover:underline">Return to My Courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="ml-4 text-gray-600 font-medium">Loading course content...</p>
    </div>
  );
}
