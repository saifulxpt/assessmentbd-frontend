'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { checkAdmin } from './admin-course.actions';

export async function approveSubAction(formData: FormData) {
  await checkAdmin();
  const id = BigInt(formData.get('id') as string);
  const sub = await prisma.subscriptions.findUnique({ where: { id }, select: { plan: true } });
  if (!sub) return;
  const durationDays = sub.plan === 'pro' ? 90 : 30;
  const expires = new Date();
  expires.setDate(expires.getDate() + durationDays);
  await prisma.subscriptions.update({
    where: { id },
    data: { status: 'active', expires_at: expires },
  });
  revalidatePath('/admin/subscriptions');
  revalidatePath('/admin/dashboard');
}

export async function rejectSubAction(formData: FormData) {
  await checkAdmin();
  const id = BigInt(formData.get('id') as string);
  await prisma.subscriptions.update({
    where: { id },
    data: { status: 'rejected' },
  });
  revalidatePath('/admin/subscriptions');
  revalidatePath('/admin/dashboard');
}
