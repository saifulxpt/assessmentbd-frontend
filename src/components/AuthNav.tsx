'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AuthNav() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-10 w-20 animate-pulse bg-gray-200 rounded-lg"></div>;
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/user/dashboard" className="flex items-center space-x-2 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
          {user.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-medium text-gray-700 hidden sm:block">{user.name}</span>
        </Link>
        <button 
          onClick={logout}
          className="text-gray-500 hover:text-red-600 text-sm font-medium transition-colors"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <>
      <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Log in</Link>
      <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm ml-4">
        Sign up
      </Link>
    </>
  );
}
