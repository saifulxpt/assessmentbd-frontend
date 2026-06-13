'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSession, clearSession, getSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';

const loginSchema = z.object({
  mobile: z.string().min(11, 'Mobile number must be exactly 11 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  password_confirmation: z.string()
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

export async function loginAction(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  
  const validated = loginSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { mobile, password } = validated.data;

  try {
    const user = await prisma.users.findUnique({
      where: { mobile },
    });

    if (!user) {
      return { error: 'Invalid credentials. User not found.' };
    }

    if (!user.is_active) {
      return { error: 'Your account has been deactivated.' };
    }

    // Verify password against bcrypt hash from Laravel
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { error: 'Invalid password.' };
    }

    // Create session cookie
    await createSession(
      user.id.toString(), 
      user.is_admin ? (user.admin_role || 'admin') : 'student'
    );

  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An unexpected error occurred during login.' };
  }

  redirect('/user/dashboard');
}

export async function registerAction(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  
  const validated = registerSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { name, mobile, password } = validated.data;

  try {
    const existingUser = await prisma.users.findUnique({
      where: { mobile },
    });

    if (existingUser) {
      return { error: 'Mobile number is already registered.' };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.users.create({
      data: {
        name,
        mobile,
        password: hashedPassword,
        is_active: true,
        is_verified: false,
        wallet_balance: 0,
        is_admin: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Create session cookie
    await createSession(newUser.id.toString(), 'student');

  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'An unexpected error occurred during registration.' };
  }

  redirect('/user/dashboard');
}

export async function logoutAction() {
  await clearSession();
  redirect('/login');
}

export async function getCurrentUserAction() {
  const session = await getSession();
  if (!session || !session.userId) return null;

  try {
    const user = await prisma.users.findUnique({
      where: { id: BigInt(session.userId) },
    });

    if (!user || !user.is_active) return null;

    return {
      id: Number(user.id),
      name: user.name,
      email: user.email,
      phone: user.mobile || '',
      role: user.is_admin ? (user.admin_role || 'admin') : 'student',
      avatar: user.avatar,
    };
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}
