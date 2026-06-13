import { getSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import SettingsProfileClient from './SettingsProfileClient';

export const metadata = {
  title: 'Settings | Admin Dashboard',
};

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session?.userId) {
    redirect('/login');
  }

  const user = await prisma.users.findUnique({
    where: { id: BigInt(session.userId) },
    select: { mobile: true }
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="sd-ph">
        <div>
          <h1>Settings</h1>
          <p>Logo, password and other system configurations</p>
        </div>
      </div>

      <SettingsProfileClient initialMobile={user.mobile || ''} />
    </div>
  );
}
