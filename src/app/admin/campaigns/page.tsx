import { getSmsLogs } from '@/app/actions/admin-settings.actions';
import CampaignClient from './CampaignClient';

export const metadata = {
  title: 'SMS Campaigns | Admin Dashboard',
};

export default async function AdminCampaignsPage() {
  const logs = await getSmsLogs();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">SMS Campaigns</h1>
        <p className="text-gray-500 mt-2">Send bulk SMS to students and view delivery logs.</p>
      </div>

      <CampaignClient initialLogs={logs} />
    </div>
  );
}
