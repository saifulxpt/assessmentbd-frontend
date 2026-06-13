import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import AdminLayout from '@/components/AdminLayout';

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session?.userId) {
    redirect('/login');
  }

  const user = await prisma.users.findUnique({
    where: { id: BigInt(session.userId) },
    select: { id: true, name: true, email: true, is_admin: true, admin_role: true, avatar: true }
  });

  if (!user || !user.is_admin) {
    redirect('/user/dashboard');
  }

  const adminUser = {
    id: Number(user.id),
    name: user.name,
    email: user.email ?? undefined,
    is_admin: user.is_admin ?? false,
    is_super_admin: user.admin_role === 'super_admin',
    avatar: user.avatar ?? undefined,
  };

  return (
    <AdminLayout adminUser={adminUser}>
      {children}
    </AdminLayout>
  );
}
