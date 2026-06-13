'use server';

import { prisma } from '@/lib/prisma';

function serializeData(data: any): any {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

export async function getPublicCourses() {
  const courses = await prisma.courses.findMany({
    where: { is_active: true },
    orderBy: { sort_order: 'asc' },
    include: {
      _count: {
        select: { course_units: true, exams: true }
      }
    }
  });
  
  return serializeData(courses);
}

export async function getCourseBySlug(slug: string) {
  const isNumeric = /^\d+$/.test(slug);
  
  const course = await prisma.courses.findFirst({
    where: isNumeric
      ? { id: BigInt(slug), is_active: true }
      : { slug, is_active: true },
    include: {
      course_units: {
        where: { is_active: true },
        orderBy: { sort_order: 'asc' },
        include: {
          _count: {
            select: { exams: true }
          }
        }
      },
      exams: {
        where: { is_active: true },
        orderBy: { id: 'asc' }
      },
      _count: {
        select: { subscriptions: true }
      }
    }
  });

  if (!course) {
    return null;
  }

  return serializeData(course);
}
