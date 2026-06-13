import { getSettings } from '@/app/actions/admin-settings.actions';
import SecuritySettingsClient from './SecuritySettingsClient';

export const metadata = {
  title: 'Security Settings | Admin Dashboard',
};

export default async function AdminSecuritySettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sd-ph">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1>Security Settings</h1>
            <p>Single-device login and anti-sharing configuration</p>
          </div>
          <a href="/admin/settings" className="btn-outline shrink-0">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back
          </a>
        </div>
      </div>

      <SecuritySettingsClient initialSettings={settings} />
    </div>
  );
}
