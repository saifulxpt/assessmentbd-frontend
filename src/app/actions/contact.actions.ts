'use server';

import { prisma } from '@/lib/prisma';

export async function submitContactMessage(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string || null;
  const message = formData.get('message') as string;

  if (!name || !message) {
    return { error: 'নাম এবং মেসেজ অবশ্যই দিতে হবে।' };
  }

  try {
    await prisma.contact_messages.create({
      data: {
        name,
        phone,
        message,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    return { success: 'আপনার মেসেজ সফলভাবে পাঠানো হয়েছে। ধন্যবাদ!' };
  } catch (error) {
    console.error('Failed to submit contact message:', error);
    return { error: 'একটি সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।' };
  }
}
