'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function MyCoursesPage() {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://server.assessmentbd.com/api'}/user/courses`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        const data = await res.json();
        if (data.success) {
          setCourses(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch my courses", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [token]);

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4"></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="h-48 bg-gray-200 rounded-xl"></div><div className="h-48 bg-gray-200 rounded-xl"></div></div></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Courses</h1>
      
      {courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No courses yet</h3>
          <p className="text-gray-500 mb-6">You haven't enrolled in any courses. Browse our catalog to start learning!</p>
          <Link href="/courses" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course: any) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="h-40 relative bg-gray-200">
                {course.image_url ? (
                  <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                <div className="mt-auto pt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span>0% Complete</span>
                  </div>
                  <Link href={`/learn/course/${course.id}`} className="block w-full text-center bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold py-2 rounded-lg transition-colors">
                    Continue Course
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
