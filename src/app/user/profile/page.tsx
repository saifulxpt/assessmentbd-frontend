'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, token, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      if (avatar) {
        formData.append('avatar', avatar);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://server.assessmentbd.com/api'}/user/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        updateUser(data.data);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8">
          
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' : 'bg-red-50 text-red-800 border-l-4 border-red-500'}`}>
              {message.text}
            </div>
          )}

          <div className="space-y-6 max-w-2xl">
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0 h-20 w-20 rounded-full overflow-hidden bg-gray-100 border border-gray-300">
                  {avatar ? (
                    <img src={URL.createObjectURL(avatar)} alt="New Avatar" className="h-full w-full object-cover" />
                  ) : user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    id="avatar"
                    accept="image/*"
                    onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar"
                    className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Change photo
                  </label>
                  <p className="mt-2 text-xs text-gray-500">JPG, GIF or PNG. Max 1MB.</p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address (Optional)</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="text"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
