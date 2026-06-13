import { getSettings } from '@/app/actions/admin-settings.actions';
import { existsSync } from 'fs';
import { join } from 'path';
import ResourcesSettingsClient from './ResourcesSettingsClient';

export const metadata = {
  title: 'Resources & Logos | Admin Dashboard',
};

const resourcesList = [
  { key: 'bkash',      label: 'bKash',                 color: '#E2136E' },
  { key: 'nagad',      label: 'Nagad',                 color: '#F05822' },
  { key: 'rocket',     label: 'Rocket (DBBL)',         color: '#8B1FA9' },
  { key: 'upay',       label: 'Upay',                  color: '#00B140' },
  { key: 'bank',       label: 'Bank Transfer',         color: '#1D4ED8' },
  { key: 'logo',       label: 'Site Logo',             color: '#0B57D0' },
  { key: 'favicon',    label: 'Favicon',               color: '#475569' },
  { key: 'banner',     label: 'Hero Banner',           color: '#7C3AED' },
  { key: 'app_screen', label: 'App Screenshot (Hero)', color: '#10B981' }
];

export default async function AdminResourcesSettingsPage() {
  const settings = await getSettings();

  const resourcesData = resourcesList.map((res) => {
    const settingVal = settings[`resource_${res.key}`] || null;
    let hasFile = false;
    
    if (settingVal) {
      const fullPath = join(process.cwd(), 'public', settingVal);
      hasFile = existsSync(fullPath);
    }

    return {
      key: res.key,
      label: res.label,
      color: res.color,
      currentValue: settingVal,
      hasFile
    };
  });

  return (
    <div className="space-y-6">
      {/* Usage Notice */}
      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
        <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <p className="text-[12.5px] text-emerald-700 font-medium leading-relaxed">
          Images uploaded here can be used in any view using the setting key. 
          Example: <code className="bg-emerald-100 px-1 rounded text-[11px] font-mono">resource_bkash</code>
        </p>
      </div>

      <ResourcesSettingsClient resources={resourcesData} />
    </div>
  );
}
