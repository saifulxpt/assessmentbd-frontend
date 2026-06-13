'use client';

import { useState, useActionState, useEffect } from 'react';
import { sendBulkSms } from '@/app/actions/admin-settings.actions';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all flex items-center space-x-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
      <span>{pending ? 'Sending...' : 'Send Bulk SMS'}</span>
    </button>
  );
}

export default function CampaignClient({ initialLogs }: { initialLogs: any[] }) {
  const [state, formAction] = useActionState(sendBulkSms, null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (state?.success) {
      alert(`Successfully sent SMS to ${state.count} users!`);
      setMessage('');
    }
  }, [state]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* SMS Composer */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Compose Message</h3>
          </div>
          
          <form action={formAction} className="p-6">
            {state?.error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-4 border border-red-200">
                {state.error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
              <select name="type" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                <option value="all">All Registered Users</option>
                <option value="active">Active Users Only</option>
                <option value="inactive">Inactive/Banned Users</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message Body</label>
              <textarea 
                name="message" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Type your promotional message or announcement..."
              />
              <div className="mt-2 text-right text-xs text-gray-500">
                {message.length} characters ({Math.ceil(message.length / 160)} SMS)
              </div>
            </div>

            <SubmitButton />
          </form>
        </div>
      </div>

      {/* SMS Logs */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Recent Delivery Logs</h3>
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full font-medium">Last 100</span>
          </div>
          
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mobile</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Message Snippet</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {initialLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.mobile}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {log.message}
                    </td>
                  </tr>
                ))}
                {initialLogs.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                      No SMS logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
