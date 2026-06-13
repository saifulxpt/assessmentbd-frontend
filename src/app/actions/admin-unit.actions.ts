'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from './admin-course.actions';
import { revalidatePath } from 'next/cache';

// Helper to serialize BigInt
function serializeData(data: any): any {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

const unitSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  sort_order: z.coerce.number().default(0),
  is_active: z.boolean().default(true),
});

export async function getUnitsByCourse(courseId: string) {
  await checkAdmin();
  const units = await prisma.course_units.findMany({
    where: { course_id: BigInt(courseId) },
    orderBy: { sort_order: 'asc' },
    include: {
      _count: {
        select: { exams: true, unit_written_qas: true }
      }
    }
  });
  return serializeData(units);
}

export async function createUnit(courseId: string, prevState: any, formData: FormData) {
  try {
    await checkAdmin();
    
    const data = Object.fromEntries(formData.entries());
    const processedData = {
      ...data,
      is_active: formData.get('is_active') === 'true',
    };

    const validated = unitSchema.safeParse(processedData);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await prisma.course_units.create({
      data: {
        ...validated.data,
        course_id: BigInt(courseId),
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    revalidatePath(`/admin/courses/${courseId}/units`);
    return { success: true };
  } catch (error) {
    console.error('Error creating unit:', error);
    return { error: 'Failed to create unit.' };
  }
}

export async function deleteUnit(courseId: string, unitId: string) {
  try {
    await checkAdmin();
    await prisma.course_units.delete({
      where: { id: BigInt(unitId) },
    });
    revalidatePath(`/admin/courses/${courseId}/units`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting unit:', error);
    throw new Error('Failed to delete unit');
  }
}
