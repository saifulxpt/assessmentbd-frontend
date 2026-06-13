'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';

function serializeData(data: any): any {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

export async function getCourseContent(courseId: string) {
  const session = await getSession();
  if (!session || !session.userId) redirect('/login');

  const userId = BigInt(session.userId);
  const cId = BigInt(courseId);

  // Check enrollment: active and not expired
  const isEnrolled = await prisma.subscriptions.findFirst({
    where: {
      user_id: userId,
      course_id: cId,
      status: 'active',
      expires_at: { gt: new Date() }
    }
  });

  if (!isEnrolled) {
    redirect(`/courses/${courseId}`);
  }

  const course = await prisma.courses.findUnique({
    where: { id: cId },
    include: {
      course_units: {
        where: { is_active: true },
        orderBy: { sort_order: 'asc' },
        include: {
          exams: {
            where: { is_active: true },
            orderBy: { id: 'asc' },
            select: { id: true, title: true, duration_minutes: true, total_marks: true, pass_marks: true }
          },
          unit_written_qas: {
            orderBy: { sort_order: 'asc' }
          }
        }
      },
      exams: {
        where: { is_active: true },
        orderBy: { id: 'asc' },
        select: { id: true, title: true, duration_minutes: true, total_marks: true, pass_marks: true, unit_id: true }
      }
    }
  });

  // Get the user's attempt summaries for this course
  const allExamIds: bigint[] = [];
  if (course?.course_units) {
    for (const u of course.course_units) {
      for (const e of u.exams) allExamIds.push(BigInt(e.id));
    }
  }
  if (course?.exams) {
    for (const e of course.exams) allExamIds.push(BigInt(e.id));
  }

  const attemptAgg = allExamIds.length > 0
    ? await prisma.exam_attempts.groupBy({
        by: ['exam_id'],
        where: { user_id: userId, exam_id: { in: allExamIds }, status: 'completed' },
        _count: { id: true },
        _max: { percentage: true }
      })
    : [];

  const attemptCounts: Record<string, { cnt: number; best: number }> = {};
  for (const a of attemptAgg) {
    attemptCounts[a.exam_id.toString()] = {
      cnt: a._count.id,
      best: Number(a._max.percentage ?? 0)
    };
  }

  return serializeData({ course, attemptCounts });
}

export async function getExamForStudent(examId: string) {
  const session = await getSession();
  if (!session || !session.userId) redirect('/login');

  const userId = BigInt(session.userId);
  const eId = BigInt(examId);

  // Verify the user is enrolled in this exam's course
  const exam = await prisma.exams.findUnique({
    where: { id: eId },
    select: { id: true, course_id: true }
  });

  if (!exam) redirect('/user/dashboard');

  const isEnrolled = await prisma.subscriptions.findFirst({
    where: {
      user_id: userId,
      course_id: exam.course_id,
      status: 'active',
      expires_at: { gt: new Date() }
    }
  });

  if (!isEnrolled) redirect('/user/dashboard');

  // Check for existing ongoing attempt
  const ongoing = await prisma.exam_attempts.findFirst({
    where: { user_id: userId, exam_id: eId, status: 'ongoing' }
  });

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { mobile: true }
  });

  const fullExam = await prisma.exams.findUnique({
    where: { id: eId },
    include: {
      courses: { select: { id: true, title: true, slug: true } },
      questions: {
        where: {},
        orderBy: { sort_order: 'asc' },
        include: {
          // DO NOT include is_correct on the frontend
          question_options: {
            select: { id: true, option_text: true, question_id: true }
          }
        }
      }
    }
  });

  return serializeData({
    exam: fullExam,
    ongoingAttemptId: ongoing?.id ?? null,
    userPhone: user?.mobile || 'NSDA'
  });
}

// Creates (or resumes) an exam attempt — called when user confirms start
export async function startExamAttempt(examId: string): Promise<{ attemptId: string } | { error: string }> {
  const session = await getSession();
  if (!session || !session.userId) return { error: 'Not logged in' };

  const userId = BigInt(session.userId);
  const eId = BigInt(examId);

  const exam = await prisma.exams.findUnique({ where: { id: eId } });
  if (!exam) return { error: 'Exam not found' };

  // Check enrollment
  const isEnrolled = await prisma.subscriptions.findFirst({
    where: {
      user_id: userId,
      course_id: exam.course_id,
      status: 'active',
      expires_at: { gt: new Date() }
    }
  });
  if (!isEnrolled) return { error: 'Not enrolled in this course' };

  // Resume or create attempt
  const existing = await prisma.exam_attempts.findFirst({
    where: { user_id: userId, exam_id: eId, status: 'ongoing' }
  });

  if (existing) return { attemptId: existing.id.toString() };

  const attempt = await prisma.exam_attempts.create({
    data: {
      user_id: userId,
      exam_id: eId,
      status: 'ongoing',
      total_marks: exam.total_marks,
      started_at: new Date()
    }
  });

  return { attemptId: attempt.id.toString() };
}

// Submit exam — mirrors Laravel ExamController::submit() exactly
export async function submitExam(
  examId: string,
  attemptId: string,
  userAnswers: Record<string, string>,
  tabSwitches: number = 0
): Promise<{ success: boolean; attemptId: string } | { error: string }> {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { error: 'Not logged in' };

    const userId = BigInt(session.userId);
    const eId = BigInt(examId);
    const aId = BigInt(attemptId);

    // Verify ownership of the ongoing attempt
    const attempt = await prisma.exam_attempts.findFirst({
      where: { id: aId, user_id: userId, exam_id: eId, status: 'ongoing' }
    });
    if (!attempt) return { error: 'Attempt not found or already submitted' };

    // Time limit enforcement (5-minute grace period)
    const exam = await prisma.exams.findUnique({
      where: { id: eId },
      include: {
        questions: { include: { question_options: true } }
      }
    });
    if (!exam) return { error: 'Exam not found' };

    if (exam.duration_minutes > 0 && attempt.started_at) {
      const maxEnd = new Date(attempt.started_at.getTime() + (exam.duration_minutes + 5) * 60 * 1000);
      if (new Date() > maxEnd) {
        await prisma.exam_attempts.update({
          where: { id: aId },
          data: { status: 'completed', completed_at: new Date(), score: 0, percentage: 0, tab_switches: tabSwitches }
        });
        return { success: true, attemptId: aId.toString() };
      }
    }

    // Grade MCQ questions
    let totalScore = 0;
    let correctMcqCount = 0;
    const mcqQuestions = exam.questions.filter(q => q.question_type === 'mcq');
    const totalPossibleMarks = mcqQuestions.reduce((sum, q) => sum + (q.marks ?? 1), 0);

    // Delete previous answers (prevent duplicates on resubmit)
    await prisma.exam_answers.deleteMany({ where: { attempt_id: aId } });

    const answersToCreate: any[] = [];
    for (const question of mcqQuestions) {
      const selectedIdStr = userAnswers[question.id.toString()] ?? null;
      const selectedId = selectedIdStr ? BigInt(selectedIdStr) : null;
      let isCorrect = false;
      let marksObtained = 0;

      if (selectedId) {
        const option = question.question_options.find(o => o.id === selectedId);
        isCorrect = option?.is_correct ?? false;
        marksObtained = isCorrect ? (question.marks ?? 1) : 0;
        if (isCorrect) {
          totalScore += marksObtained;
          correctMcqCount++;
        }
      }

      answersToCreate.push({
        attempt_id: aId,
        question_id: question.id,
        selected_option_id: selectedId,
        is_correct: isCorrect,
        marks_obtained: marksObtained
      });
    }

    await prisma.exam_answers.createMany({ data: answersToCreate });

    let percentage = 0;
    if (totalPossibleMarks > 0) {
      percentage = Math.round((totalScore / totalPossibleMarks) * 100 * 100) / 100;
    } else if (mcqQuestions.length > 0) {
      percentage = Math.round((correctMcqCount / mcqQuestions.length) * 100 * 100) / 100;
    }

    await prisma.exam_attempts.update({
      where: { id: aId },
      data: {
        score: totalScore,
        percentage,
        status: 'completed',
        completed_at: new Date(),
        tab_switches: tabSwitches
      }
    });

    return { success: true, attemptId: aId.toString() };
  } catch (error) {
    console.error('Failed to submit exam:', error);
    return { error: 'An error occurred while grading your exam.' };
  }
}
