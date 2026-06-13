import { getExamForStudent } from '@/app/actions/learning.actions';
import ExamTakingClient from './ExamTakingClient';

export default async function ExamTakingPage(props: { params: Promise<{ id: string, exam_id: string }> }) {
  const params = await props.params;
  const data = await getExamForStudent(params.exam_id);

  if (!data || !data.exam) {
    return <div className="p-10 text-center text-slate-600 font-medium">Exam not found or you are not enrolled in this course.</div>;
  }

  const { exam, ongoingAttemptId, userPhone } = data;

  if (!exam.questions || exam.questions.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4">
        <div className="bg-yellow-50 text-yellow-800 p-6 rounded-xl border border-yellow-200 text-center">
          <svg className="w-12 h-12 mx-auto mb-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <h3 className="text-lg font-bold">No Questions Yet</h3>
          <p>The instructor has not added any questions to this exam.</p>
        </div>
      </div>
    );
  }

  return (
    <ExamTakingClient
      exam={{ ...exam, ongoingAttemptId }}
      courseId={params.id}
      userPhone={userPhone}
    />
  );
}
