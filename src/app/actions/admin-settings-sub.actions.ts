'use server';

import { prisma } from '@/lib/prisma';
import { checkAdmin } from './admin-course.actions';
import { getSession } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

// ─── Profile & Security ──────────────────────────────────────────────

export async function updateAdminProfile(prevState: any, formData: FormData) {
  try {
    await checkAdmin();
    const session = await getSession();
    if (!session?.userId) {
      return { error: 'Unauthorized session.' };
    }

    const mobile = formData.get('mobile') as string;
    const currentPassword = formData.get('current_password') as string;
    const newPassword = formData.get('new_password') as string;
    const confirmPassword = formData.get('new_password_confirmation') as string;

    if (!mobile || !/^01[3-9]\d{8}$/.test(mobile)) {
      return { error: 'Enter a valid Bangladeshi mobile number (01XXXXXXXXX).' };
    }

    if (!currentPassword) {
      return { error: 'Current password is required.' };
    }

    // Retrieve user
    const userId = BigInt(session.userId);
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return { error: 'User not found.' };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return { error: 'Current password is incorrect.' };
    }

    // Check unique mobile
    const existingMobile = await prisma.users.findFirst({
      where: {
        mobile,
        NOT: { id: userId }
      }
    });
    if (existingMobile) {
      return { error: 'This mobile number is already in use.' };
    }

    const updates: Record<string, any> = { mobile };

    if (newPassword) {
      if (newPassword.length < 8) {
        return { error: 'New password must be at least 8 characters.' };
      }
      if (newPassword !== confirmPassword) {
        return { error: 'New password and confirmation do not match.' };
      }
      updates.password = await bcrypt.hash(newPassword, 12);
    }

    await prisma.users.update({
      where: { id: userId },
      data: updates
    });

    revalidatePath('/admin/settings');
    return { success: true, message: 'Profile and security settings updated successfully.' };
  } catch (error: any) {
    console.error('Error updating admin profile:', error);
    return { error: error.message || 'Failed to update profile.' };
  }
}

// ─── Database Sync / Migrations ───────────────────────────────────────

export async function runDbMigrations() {
  try {
    await checkAdmin();

    // Run prisma db push to sync migrations on the dev machine safely
    const { stdout, stderr } = await execAsync('npx prisma db push');
    const msg = stdout.trim() || stderr.trim() || 'Database is already up to date.';
    
    return { success: true, message: 'Database Sync Completed: ' + msg };
  } catch (error: any) {
    console.error('Error running migrations:', error);
    return { error: 'Database update failed: ' + (error.stderr || error.message) };
  }
}

// ─── Resources Logo/Favicon Uploads ───────────────────────────────────

export async function uploadResourceAction(key: string, prevState: any, formData: FormData) {
  try {
    await checkAdmin();

    const allowedKeys = ['bkash', 'nagad', 'rocket', 'upay', 'bank', 'logo', 'favicon', 'banner', 'app_screen'];
    if (!allowedKeys.includes(key)) {
      return { error: 'Invalid resource identifier.' };
    }

    const file = formData.get('file') as File;
    if (!file || file.size === 0) {
      return { error: 'Please select a file to upload.' };
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return { error: 'File size exceeds 10MB limit.' };
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'resources');
    await mkdir(uploadDir, { recursive: true });

    // Determine extension
    const originalName = file.name || '';
    const ext = originalName.split('.').pop() || 'webp';
    const fileName = `${key}.${ext}`;
    const filePath = join(uploadDir, fileName);

    // Save file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    const relativePath = `uploads/resources/${fileName}`;

    // Update settings in database
    await prisma.settings.upsert({
      where: { key: `resource_${key}` },
      update: { value: relativePath, updated_at: new Date() },
      create: { key: `resource_${key}`, value: relativePath, created_at: new Date(), updated_at: new Date() }
    });

    if (key === 'logo') {
      await prisma.settings.upsert({
        where: { key: 'site_logo' },
        update: { value: relativePath, updated_at: new Date() },
        create: { key: 'site_logo', value: relativePath, created_at: new Date(), updated_at: new Date() }
      });
    }

    revalidatePath('/admin/settings/resources');
    return { success: true, message: `${key.toUpperCase()} resource uploaded successfully.` };
  } catch (error: any) {
    console.error('Error uploading resource:', error);
    return { error: error.message || 'Failed to upload resource.' };
  }
}

// ─── SMS Balance & AI Tester ─────────────────────────────────────────

export async function checkSmsBalanceAction() {
  try {
    await checkAdmin();
    const smsApiKeySetting = await prisma.settings.findUnique({ where: { key: 'sms_api_key' } });
    const apiKey = smsApiKeySetting?.value;

    if (!apiKey) {
      return { error: 'SMS API key not configured.' };
    }

    const res = await fetch(`https://bulksmsbd.net/api/getBalanceApi?api_key=${apiKey}`);
    if (!res.ok) {
      return { error: 'Failed to connect to BulkSMS BD.' };
    }

    const data = await res.json();
    if (data && typeof data.balance !== 'undefined') {
      return { success: true, balance: data.balance };
    }

    return { error: data.message || 'Unable to fetch balance.' };
  } catch (err: any) {
    console.error('Error checking SMS balance:', err);
    return { error: 'Connection failed: ' + err.message };
  }
}

export async function testAiConnectionAction(provider: string, apiKey: string) {
  try {
    await checkAdmin();

    if (!apiKey) {
      return { error: 'Please enter an API key first.' };
    }

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      if (res.ok) {
        return { success: true, message: 'Connected successfully to OpenAI!' };
      }
      const data = await res.json();
      return { error: data.error?.message || 'Failed to connect to OpenAI.' };
    } else if (provider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (res.ok) {
        return { success: true, message: 'Connected successfully to Gemini!' };
      }
      const data = await res.json();
      return { error: data.error?.message || 'Failed to connect to Gemini.' };
    }

    return { error: 'Unknown provider.' };
  } catch (err: any) {
    console.error('Error testing AI key:', err);
    return { error: 'Connection failed: ' + err.message };
  }
}

