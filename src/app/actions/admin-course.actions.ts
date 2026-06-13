'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

// Helper to serialize BigInt
function serializeData(data: any): any {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

export async function checkAdmin() {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
    throw new Error('Unauthorized');
  }
  return session;
}

const courseSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  level: z.string().min(1, 'Level is required'),
  category: z.string().optional(),
  sector: z.string().optional(),
  occupation: z.string().optional(),
  description: z.string().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_keywords: z.string().optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  featured_label: z.string().optional(),
  sort_order: z.coerce.number().default(0),
});

export async function getCourses() {
  await checkAdmin();
  const courses = await prisma.courses.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      _count: {
        select: { course_units: true, exams: true, subscriptions: true }
      }
    }
  });
  return serializeData(courses);
}

export async function getCourseById(id: string) {
  await checkAdmin();
  const course = await prisma.courses.findUnique({
    where: { id: BigInt(id) },
  });
  return serializeData(course);
}

export async function createCourse(prevState: any, formData: FormData) {
  try {
    await checkAdmin();
    
    const data = Object.fromEntries(formData.entries());
    const processedData = {
      ...data,
      is_active: formData.get('is_active') === 'true',
      is_featured: formData.get('is_featured') === 'true',
    };

    const validated = courseSchema.safeParse(processedData);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const slug = validated.data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    await prisma.courses.create({
      data: {
        ...validated.data,
        slug: `${slug}-${Date.now()}`, // Ensure uniqueness
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    revalidatePath('/admin/courses/builder');
    return { success: true };
  } catch (error) {
    console.error('Error creating course:', error);
    return { error: 'Failed to create course.' };
  }
}

export async function updateCourse(id: string, prevState: any, formData: FormData) {
  try {
    await checkAdmin();
    
    const data = Object.fromEntries(formData.entries());
    const processedData = {
      ...data,
      is_active: formData.get('is_active') === 'true',
      is_featured: formData.get('is_featured') === 'true',
    };

    const validated = courseSchema.safeParse(processedData);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await prisma.courses.update({
      where: { id: BigInt(id) },
      data: {
        ...validated.data,
        updated_at: new Date(),
      },
    });

    revalidatePath('/admin/courses/builder');
    return { success: true };
  } catch (error) {
    console.error('Error updating course:', error);
    return { error: 'Failed to update course.' };
  }
}

export async function deleteCourse(id: string) {
  try {
    await checkAdmin();
    await prisma.courses.delete({
      where: { id: BigInt(id) },
    });
    revalidatePath('/admin/courses/builder');
    return { success: true };
  } catch (error) {
    console.error('Error deleting course:', error);
    throw new Error('Failed to delete course');
  }
}
