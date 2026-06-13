'use server';

import { prisma } from '@/lib/prisma';
import { checkAdmin } from './admin-course.actions';
import { revalidatePath } from 'next/cache';

function serializeData(data: any): any {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

// ---- SETTINGS ACTIONS ----

export async function getSettings() {
  await checkAdmin();
  const settingsArray = await prisma.settings.findMany();
  
  // Convert array of {key, value} to a key-value object
  const settingsObj: Record<string, string> = {};
  settingsArray.forEach(s => {
    settingsObj[s.key] = s.value || '';
  });
  
  return settingsObj;
}

export async function saveSettings(prevState: any, formData: FormData) {
  try {
    await checkAdmin();
    
    const updates = [];
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        updates.push(
          prisma.settings.upsert({
            where: { key },
            update: { value, updated_at: new Date() },
            create: { key, value, created_at: new Date(), updated_at: new Date() }
          })
        );
      }
    }

    // Execute all upserts in a transaction
    await prisma.$transaction(updates);

    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error) {
    console.error('Error saving settings:', error);
    return { error: 'Failed to save settings.' };
  }
}

// ---- CAMPAIGN / SMS LOGS ACTIONS ----

export async function getSmsLogs() {
  await checkAdmin();
  const logs = await prisma.sms_logs.findMany({
    orderBy: { created_at: 'desc' },
    take: 100, // Show latest 100 logs
  });
  return serializeData(logs);
}

export async function sendBulkSms(prevState: any, formData: FormData) {
  try {
    await checkAdmin();
    
    const message = formData.get('message') as string;
    const type = formData.get('type') as string; // 'all', 'active', 'inactive'

    if (!message || message.length < 5) {
      return { error: 'Message must be at least 5 characters.' };
    }

    // Determine target users
    let whereClause = {};
    if (type === 'active') whereClause = { is_active: true };
    if (type === 'inactive') whereClause = { is_active: false };

    const users = await prisma.users.findMany({
      where: whereClause,
      select: { mobile: true }
    });

    if (users.length === 0) {
      return { error: 'No users found matching the criteria.' };
    }

    // Filter out users without a mobile number
    const usersWithMobile = users.filter((u): u is { mobile: string } => !!u.mobile);

    // Get SMS API Key from settings
    const settings = await getSettings();
    const smsApiKey = settings['sms_api_key'];

    if (!smsApiKey) {
      return { error: 'SMS API Key is not configured in Settings.' };
    }

    // Here we would typically call the external SMS gateway API using fetch()
    // For now, we simulate the API call and just log it in the database.
    console.log(`Sending SMS to ${users.length} users using API key: ${smsApiKey}`);

    const logEntries = usersWithMobile.map(u => ({
      mobile: u.mobile,
      message: message,
      type: 'notification' as const,
      status: 'sent' as const,
      created_at: new Date(),
    }));

    await prisma.sms_logs.createMany({
      data: logEntries
    });

    revalidatePath('/admin/campaigns');
    return { success: true, count: users.length };
  } catch (error) {
    console.error('Error sending bulk SMS:', error);
    return { error: 'Failed to send bulk SMS.' };
  }
}
