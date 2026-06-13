import { getQuestionsByExam } from '@/app/actions/admin-exam.actions';
import { prisma } from '@/lib/prisma';
import QuestionListClient from './QuestionListClient';
import Link from 'next/link';

export const metadata = {
  title: 'Question Builder | Admin Dashboard',
};

function serializeData(data: any): any {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

// Next.js 15 page props
export default async function AdminQuestionBuilderPage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ courseId: string }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const examId = params.id;
  const courseId = searchParams.courseId;
  
  if (!examId || !courseId) {
    return <div className="p-6">Exam ID and Course ID are required.</div>;
  }

  const exam = await prisma.exams.findUnique({
    where: { id: BigInt(examId) },
  });

  if (!exam) {
    return <div className="p-6">Exam not found.</div>;
  }

  const serializedExam = serializeData(exam);
  const questions = await getQuestionsByExam(examId);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-4">
        <Link href={`/admin/exams?unit=${serializedExam.unit_id}`} className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Exams
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Question Builder</h1>
          <p className="text-gray-500 mt-2">Manage questions for exam: <span className="font-bold text-gray-800">{serializedExam.title}</span></p>
        </div>
      </div>

      <QuestionListClient initialQuestions={questions} examId={examId} courseId={courseId} />
    </div>
  );
}
