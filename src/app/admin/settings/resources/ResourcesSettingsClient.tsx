'use client';

import { useActionState, useState, useEffect } from 'react';
import { uploadResourceAction } from '@/app/actions/admin-settings-sub.actions';

interface ResourceItem {
  key: string;
  label: string;
  color: string;
  currentValue: string | null;
  hasFile: boolean;
}

// Sub-component for each resource card to handle its own form states separately
function ResourceCard({ item }: { item: ResourceItem }) {
  const uploadActionWithKey = uploadResourceAction.bind(null, item.key);
  const [state, formAction, isPending] = useActionState(uploadActionWithKey, null);
  const [fileName, setFileName] = useState('Choose file');

  useEffect(() => {
    if (state?.success) {
      setFileName('Choose file');
    }
  }, [state]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : 'Choose file');
  };

  return (
    <div className="sd-card p-5 flex flex-col gap-4">
      {/* Preview */}
      <div 
        className="w-full h-24 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100"
        style={{ backgroundColor: '#f8fafc' }}
      >
        {item.hasFile && item.currentValue ? (
          <img 
            src={`/${item.currentValue}?v=${Date.now()}`} 
            alt={item.label}
            className="max-h-full max-w-full object-contain p-2" 
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 opacity-30">
            <svg className="w-7 h-7" style={{ color: item.color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            <span className="text-[10px] font-bold text-slate-400">Upload</span>
          </div>
        )}
      </div>

      {/* Label & Status */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-bold text-slate-800">{item.label}</p>
          <p className="text-[10px] font-medium text-slate-400 mt-0.5">resource_{item.key}</p>
        </div>
        {item.hasFile ? (
          <span className="badge-active text-[10px]">Uploaded</span>
        ) : (
          <span className="badge-inactive text-[10px]">Empty</span>
        )}
      </div>

      {/* Upload Form */}
      <form action={formAction} className="flex gap-2 items-center mt-auto">
        <label className="flex-1 cursor-pointer">
          <input 
            type="file" 
            name="file" 
            required 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange} 
          />
          <div className="file-label w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-550 font-semibold truncate text-center hover:bg-slate-100 transition">
            {fileName}
          </div>
        </label>
        <button 
          type="submit"
          disabled={isPending}
          className="shrink-0 h-9 w-9 flex items-center justify-center rounded-xl text-white transition hover:scale-105 disabled:opacity-50"
          style={{ backgroundColor: item.color }}
          title={isPending ? 'Uploading...' : 'Upload'}
        >
          {isPending ? (
            <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
          ) : (
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
          )}
        </button>
      </form>

      {state?.error && (
        <p className="text-rose-500 text-[11px] font-medium -mt-2">{state.error}</p>
      )}

      {state?.success && (
        <p className="text-emerald-600 text-[11px] font-medium -mt-2">{state.message}</p>
      )}
    </div>
  );
}

export default function ResourcesSettingsClient({ resources }: { resources: ResourceItem[] }) {
  return (
    <div className="space-y-6">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {resources.map((item) => (
          <ResourceCard key={item.key} item={item} />
        ))}
      </div>

      {/* Usage Reference */}
      <div className="sd-card p-5 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          <h3 className="text-[14px] font-bold text-slate-800">Usage examples in view</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm sd-table">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-100">
                <th className="py-2.5 px-4 font-bold text-slate-600">Resource</th>
                <th className="py-2.5 px-4 font-bold text-slate-600">Setting Key</th>
                <th className="py-2.5 px-4 font-bold text-slate-600">Code Snippet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {resources.map((item) => (
                <tr key={item.key}>
                  <td className="font-bold text-slate-700 py-3 px-4">{item.label}</td>
                  <td className="font-mono text-[11px] text-emerald-600 py-3 px-4">resource_{item.key}</td>
                  <td className="font-mono text-[10px] text-slate-500 py-3 px-4">
                    {"{settings['resource_" + item.key + "']}"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
