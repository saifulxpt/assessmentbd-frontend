import { getCourseBySlug } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const course = await getCourseBySlug(params.slug);
  if (!course) return { title: 'Course Not Found' };
  
  return {
    title: \`\${course.title} - AssessmentBD\`,
    description: course.description?.replace(/<[^>]*>?/gm, '').substring(0, 160) || 'Course details',
  };
}

export default async function CourseDetailsPage({ params }: { params: { slug: string } }) {
  const course = await getCourseBySlug(params.slug);
  
  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
            <div className="text-lg text-blue-100 mb-6 line-clamp-3" dangerouslySetInnerHTML={{ __html: course.description || '' }} />
            
            <div className="flex items-center space-x-4 mb-8">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                {course.total_lessons || 0} Lessons
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                {course.duration || 'Self-paced'}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <button className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-3 px-8 rounded-lg shadow-lg transition-colors">
                Enroll Now - {course.price > 0 ? \`৳\${course.price}\` : 'Free'}
              </button>
            </div>
          </div>
          
          <div className="hidden md:block">
            {course.image_url ? (
               <img src={course.image_url} alt={course.title} className="w-full rounded-xl shadow-2xl" />
            ) : (
               <div className="w-full h-64 bg-white/10 rounded-xl flex items-center justify-center">No Image</div>
            )}
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">About This Course</h2>
            <div className="prose max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: course.description || 'No description available.' }} />
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Course Curriculum</h2>
            <div className="space-y-4">
              {course.units && course.units.length > 0 ? (
                course.units.map((unit: any, index: number) => (
                  <div key={unit.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-800">{unit.title}</span>
                    </div>
                    <span className="text-sm text-gray-500">{unit.type === 'video' ? 'Video' : 'Exam'}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No units available for this course yet.</p>
              )}
            </div>
          </section>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-blue-600">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Course Features</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Full Lifetime Access
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Access on Mobile & Desktop
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Certificate of Completion
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
