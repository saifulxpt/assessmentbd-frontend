import { getUnitsByCourse } from '@/app/actions/admin-unit.actions';
import { getCourseById } from '@/app/actions/admin-course.actions';
import UnitListClient from './UnitListClient';
import Link from 'next/link';

export const metadata = {
  title: 'Unit Builder | Admin Dashboard',
};

// Next.js 15+ dynamic params
export default async function AdminUnitBuilderPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const course = await getCourseById(params.id);
  
  if (!course) {
    return <div className="p-6">Course not found.</div>;
  }

  const units = await getUnitsByCourse(params.id);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-4">
        <Link href="/admin/courses/builder" className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Courses
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Unit Builder</h1>
          <p className="text-gray-500 mt-2">Manage units (chapters) for: <span className="font-bold text-gray-800">{course.title}</span></p>
        </div>
      </div>

      <UnitListClient initialUnits={units} courseId={params.id} />
    </div>
  );
}
