'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AdminSubscriptionsPage() {
  const { token } = useAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchSubscriptions = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://server.assessmentbd.com/api'}/admin/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const result = await res.json();
      if (result.success) {
        setSubscriptions(result.data.data); // data.data because it's paginated
      }
    } catch (err) {
      console.error("Failed to fetch subscriptions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [token]);

  const updateStatus = async (id: number, status: 'active' | 'rejected') => {
    setActionLoading(id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://server.assessmentbd.com/api'}/admin/subscriptions/${id}/status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const result = await res.json();
      if (result.success) {
        // Refresh the list
        fetchSubscriptions();
      } else {
        alert(result.message || 'Action failed');
      }
    } catch (err) {
      alert('Network error occurred.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Details</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions.map((sub: any) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{sub.user.name}</div>
                    <div className="text-sm text-gray-500">{sub.user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{sub.course.title}</div>
                    <div className="text-sm font-medium text-indigo-600">৳{sub.amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize font-medium">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sub.payment_method === 'bkash' ? 'bg-pink-100 text-pink-800' : 'bg-orange-100 text-orange-800'}`}>
                        {sub.payment_method}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Sender: <span className="font-mono">{sub.sender_number}</span></div>
                    <div className="text-sm text-gray-500">TrxID: <span className="font-mono">{sub.transaction_id}</span></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${sub.status === 'active' ? 'bg-green-100 text-green-800' : 
                        sub.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {sub.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {sub.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => updateStatus(sub.id, 'active')}
                          disabled={actionLoading === sub.id}
                          className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded shadow-sm disabled:opacity-50 transition-colors"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => updateStatus(sub.id, 'rejected')}
                          disabled={actionLoading === sub.id}
                          className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded shadow-sm disabled:opacity-50 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {subscriptions.length === 0 && (
          <div className="p-8 text-center text-gray-500">No subscriptions found.</div>
        )}
      </div>
    </div>
  );
}
