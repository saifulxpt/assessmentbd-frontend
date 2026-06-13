import { getCourses } from '@/app/actions/admin-course.actions';
import CourseListClient from './CourseListClient';

export const metadata = {
  title: 'Course Builder | Admin Dashboard',
};

export default async function AdminCourseBuilderPage() {
  const courses = await getCourses();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Course Builder</h1>
          <p className="text-gray-500 mt-2">Manage your assessment courses natively in Next.js</p>
        </div>
      </div>

      <CourseListClient initialCourses={courses} />
    </div>
  );
}
