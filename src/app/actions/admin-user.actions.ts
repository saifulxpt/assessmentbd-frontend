'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from './admin-course.actions';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

function serializeData(data: any): any {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

export async function getUsers(query?: string) {
  await checkAdmin();
  
  const whereClause = query ? {
    OR: [
      { name: { contains: query, mode: 'insensitive' as any } },
      { mobile: { contains: query } }
    ]
  } : {};

  const users = await prisma.users.findMany({
    where: whereClause,
    orderBy: { created_at: 'desc' },
    take: 50, // Limit to 50 for performance
  });
  
  return serializeData(users);
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  try {
    await checkAdmin();
    await prisma.users.update({
      where: { id: BigInt(userId) },
      data: { is_active: !currentStatus },
    });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw new Error('Failed to update user status');
  }
}

// Form-action versions (accept FormData directly for Server Component <form action={...}>)
export async function toggleUserAction(formData: FormData) {
  'use server';
  const userId = formData.get('userId') as string;
  await checkAdmin();
  const user = await prisma.users.findUnique({ where: { id: BigInt(userId) }, select: { is_active: true } });
  if (!user) return;
  await prisma.users.update({ where: { id: BigInt(userId) }, data: { is_active: !user.is_active } });
  revalidatePath('/admin/users');
}

export async function deleteUserAction(formData: FormData) {
  'use server';
  const userId = formData.get('userId') as string;
  await checkAdmin();
  await prisma.users.delete({ where: { id: BigInt(userId) } });
  revalidatePath('/admin/users');
}


export async function updateWalletBalance(userId: string, amount: number) {
  try {
    await checkAdmin();
    await prisma.users.update({
      where: { id: BigInt(userId) },
      data: { 
        wallet_balance: {
          increment: amount
        }
      },
    });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Error updating wallet:', error);
    throw new Error('Failed to update wallet balance');
  }
}

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function forceResetPassword(userId: string, prevState: any, formData: FormData) {
  try {
    await checkAdmin();
    
    const password = formData.get('password') as string;
    const validated = passwordSchema.safeParse({ password });
    
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const hashedPassword = await bcrypt.hash(validated.data.password, 12);

    await prisma.users.update({
      where: { id: BigInt(userId) },
      data: { password: hashedPassword },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { error: 'Failed to reset password.' };
  }
}
