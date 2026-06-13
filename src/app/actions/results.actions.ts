'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';

function serializeData(data: any): any {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

export async function getMyResults() {
  const session = await getSession();
  if (!session || !session.userId) redirect('/login');

  const userId = BigInt(session.userId);

  const attempts = await prisma.exam_attempts.findMany({
    where: { user_id: userId, status: 'completed' },
    include: {
      exams: {
        select: {
          title: true,
          total_marks: true,
          pass_marks: true,
          courses: { select: { title: true } }
        }
      }
    },
    orderBy: { completed_at: 'desc' }
  });

  return serializeData(attempts);
}

export async function getExamAttemptResult(attemptId: string) {
  const session = await getSession();
  if (!session || !session.userId) redirect('/login');

  const userId = BigInt(session.userId);

  const attempt = await prisma.exam_attempts.findFirst({
    where: { id: BigInt(attemptId), user_id: userId },
    include: {
      exams: {
        include: {
          courses: { select: { id: true, title: true, slug: true } }
        }
      },
      exam_answers: {
        include: {
          questions: {
            include: {
              question_options: true
            }
          },
          question_options: true
        }
      }
    }
  });

  if (!attempt) return null;
  return serializeData(attempt);
}

export async function getExamHistory(search?: string, page = 1) {
  const session = await getSession();
  if (!session || !session.userId) redirect('/login');

  const userId = BigInt(session.userId);
  const take = 20;
  const skip = (page - 1) * take;

  const where: any = {
    user_id: userId,
    status: 'completed',
  };

  if (search) {
    where.exams = {
      title: { contains: search }
    };
  }

  const [attempts, total] = await Promise.all([
    prisma.exam_attempts.findMany({
      where,
      include: {
        exams: {
          include: {
            courses: { select: { title: true } }
          }
        }
      },
      orderBy: { completed_at: 'desc' },
      take,
      skip,
    }),
    prisma.exam_attempts.count({ where })
  ]);

  return serializeData({ attempts, total, page, totalPages: Math.ceil(total / take) });
}
