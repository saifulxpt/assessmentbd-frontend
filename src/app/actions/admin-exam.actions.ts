'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from './admin-course.actions';
import { revalidatePath } from 'next/cache';

function serializeData(data: any): any {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

const examSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  duration_minutes: z.coerce.number().min(1).default(60),
  total_marks: z.coerce.number().min(1).default(100),
  pass_marks: z.coerce.number().min(0).default(50),
  is_active: z.boolean().default(true),
});

export async function getExamsByUnit(unitId: string) {
  await checkAdmin();
  const exams = await prisma.exams.findMany({
    where: { unit_id: BigInt(unitId) },
    include: {
      _count: {
        select: { questions: true }
      }
    }
  });
  return serializeData(exams);
}

export async function createExam(unitId: string, courseId: string, prevState: any, formData: FormData) {
  try {
    await checkAdmin();
    
    const data = Object.fromEntries(formData.entries());
    const processedData = {
      ...data,
      is_active: formData.get('is_active') === 'true',
    };

    const validated = examSchema.safeParse(processedData);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await prisma.exams.create({
      data: {
        ...validated.data,
        unit_id: BigInt(unitId),
        course_id: BigInt(courseId),
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    revalidatePath(`/admin/exams?unit=${unitId}`);
    return { success: true };
  } catch (error) {
    console.error('Error creating exam:', error);
    return { error: 'Failed to create exam.' };
  }
}

export async function deleteExam(examId: string, unitId: string) {
  try {
    await checkAdmin();
    await prisma.exams.delete({
      where: { id: BigInt(examId) },
    });
    revalidatePath(`/admin/exams?unit=${unitId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting exam:', error);
    throw new Error('Failed to delete exam');
  }
}

// ---- QUESTION BUILDER ACTIONS ----

const questionSchema = z.object({
  question_text: z.string().min(1, 'Question text is required'),
  marks: z.coerce.number().min(1).default(1),
  explanation: z.string().optional(),
  model_answer: z.string().optional(), // Used for written questions
  question_type: z.enum(['mcq', 'written']).default('mcq'),
});

export async function getQuestionsByExam(examId: string) {
  await checkAdmin();
  const questions = await prisma.questions.findMany({
    where: { exam_id: BigInt(examId) },
    orderBy: { sort_order: 'asc' },
    include: {
      question_options: true
    }
  });
  return serializeData(questions);
}

export async function createQuestion(examId: string, courseId: string, prevState: any, formData: FormData) {
  try {
    await checkAdmin();
    
    const data = Object.fromEntries(formData.entries());
    const validated = questionSchema.safeParse(data);
    
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    // Process options for MCQ
    const options = [];
    if (validated.data.question_type === 'mcq') {
      for (let i = 1; i <= 4; i++) {
        const optionText = formData.get(`option_${i}`) as string;
        const isCorrect = formData.get(`is_correct_${i}`) === 'true';
        if (optionText) {
          options.push({ option_text: optionText, is_correct: isCorrect });
        }
      }
      
      if (options.length < 2) {
        return { error: 'MCQ questions require at least 2 options.' };
      }
      if (!options.some(opt => opt.is_correct)) {
        return { error: 'Please mark at least one option as correct.' };
      }
    }

    await prisma.questions.create({
      data: {
        ...validated.data,
        exam_id: BigInt(examId),
        course_id: BigInt(courseId),
        created_at: new Date(),
        updated_at: new Date(),
        question_options: validated.data.question_type === 'mcq' ? {
          create: options
        } : undefined
      },
    });

    revalidatePath(`/admin/exams/${examId}/questions`);
    return { success: true };
  } catch (error) {
    console.error('Error creating question:', error);
    return { error: 'Failed to create question.' };
  }
}

export async function deleteQuestion(questionId: string, examId: string) {
  try {
    await checkAdmin();
    await prisma.questions.delete({
      where: { id: BigInt(questionId) },
    });
    revalidatePath(`/admin/exams/${examId}/questions`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting question:', error);
    throw new Error('Failed to delete question');
  }
}
