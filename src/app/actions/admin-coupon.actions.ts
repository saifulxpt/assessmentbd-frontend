'use server';

import { prisma } from '@/lib/prisma';
import { checkAdmin } from './admin-course.actions';
import { revalidatePath } from 'next/cache';

// Helper to convert inputs
function cleanInput(val: string | null): number | null {
  if (val === null || val === undefined || val.trim() === '') return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}

export async function createCouponAction(prevState: any, formData: FormData) {
  try {
    await checkAdmin();

    const code = (formData.get('code') as string || '').toUpperCase().trim();
    const discount_type = formData.get('discount_type') as string;
    const discount_value = Number(formData.get('discount_value') || 0);
    const max_uses = Number(formData.get('max_uses') || 0);
    const max_uses_per_user = Number(formData.get('max_uses_per_user') || 0);
    const first_purchase_only = formData.get('first_purchase_only') === '1';
    const expires_at_str = formData.get('expires_at') as string;
    const course_id_str = formData.get('course_id') as string;
    const plan_restriction = formData.get('plan_restriction') as string || 'all';

    if (!code) {
      return { error: 'Coupon code is required.' };
    }

    // Check duplicate
    const duplicate = await prisma.coupons.findUnique({ where: { code } });
    if (duplicate) {
      return { error: 'This coupon code already exists.' };
    }

    if (discount_value <= 0) {
      return { error: 'Discount value must be greater than zero.' };
    }

    if (discount_type === 'percent' && discount_value > 100) {
      return { error: 'Percentage discount cannot exceed 100%.' };
    }

    const course_id = cleanInput(course_id_str);
    const expires_at = expires_at_str ? new Date(expires_at_str) : null;

    await prisma.coupons.create({
      data: {
        code,
        discount_type: discount_type === 'percent' ? 'percent' : 'flat',
        discount_value,
        max_uses,
        max_uses_per_user,
        first_purchase_only,
        course_id: course_id ? BigInt(course_id) : null,
        plan_restriction,
        expires_at,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    revalidatePath('/admin/settings/coupon');
    return { success: true, message: 'Coupon created successfully.' };
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    return { error: error.message || 'Failed to create coupon.' };
  }
}

export async function updateCouponAction(prevState: any, formData: FormData) {
  try {
    await checkAdmin();

    const id = Number(formData.get('id'));
    const discount_type = formData.get('discount_type') as string;
    const discount_value = Number(formData.get('discount_value') || 0);
    const max_uses = Number(formData.get('max_uses') || 0);
    const max_uses_per_user = Number(formData.get('max_uses_per_user') || 0);
    const first_purchase_only = formData.get('first_purchase_only') === '1';
    const expires_at_str = formData.get('expires_at') as string;
    const course_id_str = formData.get('course_id') as string;
    const plan_restriction = formData.get('plan_restriction') as string || 'all';

    if (!id) {
      return { error: 'Coupon ID is missing.' };
    }

    if (discount_value <= 0) {
      return { error: 'Discount value must be greater than zero.' };
    }

    if (discount_type === 'percent' && discount_value > 100) {
      return { error: 'Percentage discount cannot exceed 100%.' };
    }

    const course_id = cleanInput(course_id_str);
    const expires_at = expires_at_str ? new Date(expires_at_str) : null;

    await prisma.coupons.update({
      where: { id: BigInt(id) },
      data: {
        discount_type: discount_type === 'percent' ? 'percent' : 'flat',
        discount_value,
        max_uses,
        max_uses_per_user,
        first_purchase_only,
        course_id: course_id ? BigInt(course_id) : null,
        plan_restriction,
        expires_at,
        updated_at: new Date()
      }
    });

    revalidatePath('/admin/settings/coupon');
    return { success: true, message: 'Coupon updated successfully.' };
  } catch (error: any) {
    console.error('Error updating coupon:', error);
    return { error: error.message || 'Failed to update coupon.' };
  }
}

export async function toggleCouponAction(couponId: number) {
  try {
    await checkAdmin();

    const coupon = await prisma.coupons.findUnique({ where: { id: BigInt(couponId) } });
    if (!coupon) {
      throw new Error('Coupon not found.');
    }

    await prisma.coupons.update({
      where: { id: BigInt(couponId) },
      data: {
        is_active: !coupon.is_active,
        updated_at: new Date()
      }
    });

    revalidatePath('/admin/settings/coupon');
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling coupon:', error);
    throw error;
  }
}

export async function deleteCouponAction(couponId: number) {
  try {
    await checkAdmin();

    await prisma.coupons.delete({
      where: { id: BigInt(couponId) }
    });

    revalidatePath('/admin/settings/coupon');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
}
