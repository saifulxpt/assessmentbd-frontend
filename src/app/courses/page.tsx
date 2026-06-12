import { getCourses } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'All Courses - AssessmentBD',
  description: 'Browse our comprehensive list of courses and exams.',
};

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">All Courses</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course: any) => (
            <div key={course.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <Link href={`/courses/${course.slug}`}>
                <div className="relative h-48 w-full bg-gray-200">
                  {course.image_url ? (
                    <img
                      src={course.image_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 line-clamp-2">{course.title}</h3>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-green-600 font-bold text-lg">
                      {course.price > 0 ? `৳${course.price}` : 'Free'}
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                      {course.duration ? `${course.duration} hrs` : 'Self-paced'}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
          
          {courses.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-12">
              No courses found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
