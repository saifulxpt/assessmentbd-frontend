'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({ active_courses: 0, exams_attempted: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://server.assessmentbd.com/api'}/user/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  if (loading) {
    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-gray-200 rounded w-3/4"></div><div className="space-y-2"><div className="h-4 bg-gray-200 rounded"></div><div className="h-4 bg-gray-200 rounded w-5/6"></div></div></div></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome back, {user?.name}! 👋</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Courses</p>
            <p className="text-2xl font-bold text-gray-900">{stats.active_courses}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Exams Attempted</p>
            <p className="text-2xl font-bold text-gray-900">{stats.exams_attempted}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/user/my-courses" className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold py-2 px-6 rounded-lg transition-colors">
            Continue Learning
          </Link>
          <Link href="/courses" className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2 px-6 rounded-lg transition-colors">
            Browse New Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
