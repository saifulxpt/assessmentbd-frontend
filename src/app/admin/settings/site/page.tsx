import { getSettings } from '@/app/actions/admin-settings.actions';
import SiteSettingsClient from './SiteSettingsClient';

export const metadata = {
  title: 'Site Content Settings | Admin Dashboard',
};

export default async function AdminSiteSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sd-ph">
        <div>
          <h1>Site Content</h1>
          <p>Change homepage, contact info, social links, and SEO here</p>
        </div>
      </div>

      <SiteSettingsClient initialSettings={settings} />
    </div>
  );
}
