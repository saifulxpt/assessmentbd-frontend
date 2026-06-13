import { getExamsByUnit } from '@/app/actions/admin-exam.actions';
import { prisma } from '@/lib/prisma';
import ExamListClient from './ExamListClient';
import Link from 'next/link';

export const metadata = {
  title: 'Exam Builder | Admin Dashboard',
};

// Helper to serialize BigInt
function serializeData(data: any): any {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

// Next.js 15 page props with Promise for searchParams
export default async function AdminExamBuilderPage(props: { searchParams: Promise<{ unit: string }> }) {
  const searchParams = await props.searchParams;
  const unitId = searchParams.unit;
  
  if (!unitId) {
    return <div className="p-6">Unit ID is required in URL.</div>;
  }

  const unit = await prisma.course_units.findUnique({
    where: { id: BigInt(unitId) },
    include: { courses: true }
  });

  if (!unit) {
    return <div className="p-6">Unit not found.</div>;
  }

  const serializedUnit = serializeData(unit);
  const exams = await getExamsByUnit(unitId);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-4">
        <Link href={`/admin/courses/${serializedUnit.course_id}/units`} className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Units
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Exam Builder</h1>
          <p className="text-gray-500 mt-2">Manage exams for unit: <span className="font-bold text-gray-800">{serializedUnit.title}</span></p>
        </div>
      </div>

      <ExamListClient initialExams={exams} unitId={unitId} courseId={serializedUnit.course_id} />
    </div>
  );
}
