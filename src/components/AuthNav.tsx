import Link from 'next/link';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { logoutAction } from '@/app/actions/auth.actions';

export default async function AuthNav() {
  const session = await getSession();

  if (session && session.userId) {
    const user = await prisma.users.findUnique({
      where: { id: BigInt(session.userId) },
      select: { name: true, is_admin: true }
    });

    if (user) {
      return (
        <div className="flex items-center space-x-4">
          <Link 
            href={user.is_admin ? "/admin/dashboard" : "/user/dashboard"}
            prefetch={false}
            className="text-sm font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 px-5 py-2.5 rounded-xl transition"
          >
            Dashboard
          </Link>
          <form action={logoutAction}>
            <button 
              type="submit"
              className="text-sm font-bold text-red-600 hover:text-red-800 px-3 py-2 rounded-xl hover:bg-red-50 transition cursor-pointer"
            >
              Logout
            </button>
          </form>
        </div>
      );
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <Link 
        href="/login" 
        prefetch={false}
        className="text-sm font-bold text-white hero-gradient hover:opacity-90 px-6 py-3 rounded-xl shadow-md shadow-blue-500/20 transition transform active:scale-95"
      >
        লগইন / শুরু করুন
      </Link>
    </div>
  );
}
