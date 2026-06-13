'use client';

import { useActionState, useEffect } from 'react';
import { saveSettings } from '@/app/actions/admin-settings.actions';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-3 text-sm font-medium text-white bg-black rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-all flex items-center space-x-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
      </svg>
      <span>{pending ? 'Saving Changes...' : 'Save All Settings'}</span>
    </button>
  );
}

export default function SettingsClient({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [state, formAction] = useActionState(saveSettings, null);

  useEffect(() => {
    if (state?.success) {
      alert('Settings saved successfully!');
    }
  }, [state]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <form action={formAction} className="p-8">
        
        {state?.error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm mb-6 border border-red-200">
            {state.error}
          </div>
        )}

        {/* Section 1: API Keys */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">API Integrations</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMS Gateway API Key</label>
              <input 
                name="sms_api_key" 
                defaultValue={initialSettings['sms_api_key'] || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm" 
                placeholder="Enter your bulk SMS provider API Key"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">bKash Payment Gateway Key</label>
              <input 
                name="bkash_api_key" 
                defaultValue={initialSettings['bkash_api_key'] || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm" 
                placeholder="bKash app key"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">bKash App Secret</label>
              <input 
                name="bkash_app_secret" 
                type="password"
                defaultValue={initialSettings['bkash_app_secret'] || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm" 
              />
            </div>
          </div>
        </div>

        {/* Section 2: Global Configuration */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Global Configurations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone Number</label>
              <input 
                name="support_phone" 
                defaultValue={initialSettings['support_phone'] || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <input 
                name="support_email" 
                type="email"
                defaultValue={initialSettings['support_email'] || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Notice (Displays at top of dashboard)</label>
              <textarea 
                name="global_notice" 
                rows={2}
                defaultValue={initialSettings['global_notice'] || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Important announcement..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
