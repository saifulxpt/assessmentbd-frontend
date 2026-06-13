import { getCourseContent } from '@/app/actions/learning.actions';
import Link from 'next/link';

export const metadata = {
  title: 'Learning Engine - AssessmentBD',
};

// Next.js 15+ Server Component Layout
export default async function LearnLayout(props: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { children } = props;
  const params = await props.params;
  const data = await getCourseContent(params.id);
  const course = data?.course;

  if (!course) {
    return <div className="p-10 text-center">Course not found or you are not enrolled.</div>;
  }

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-gray-50">
      {/* Sidebar Menu */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 shadow-sm z-10 learn-sidebar">
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <Link href="/user/dashboard" className="text-sm font-bold text-blue-700 hover:text-blue-900 flex items-center mb-3">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            Back to Dashboard
          </Link>
          <h2 className="font-extrabold text-gray-900 leading-tight text-lg">{course.title}</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {course.course_units.map((unit: any, index: number) => (
            <div key={unit.id} className="space-y-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 flex items-center">
                <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mr-2 text-[10px]">{index + 1}</span>
                {unit.title}
              </h3>
              
              {unit.exams && unit.exams.length > 0 ? (
                unit.exams.map((exam: any) => (
                  <Link 
                    key={exam.id} 
                    href={`/learn/course/${course.id}/exam/${exam.id}`}
                    className="flex items-start p-3 rounded-xl border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-all group"
                  >
                    <div className="mt-0.5 mr-3 flex-shrink-0 text-purple-500 bg-purple-50 p-1.5 rounded-lg group-hover:bg-purple-100 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 block leading-tight">
                        {exam.title}
                      </span>
                      <span className="text-[11px] text-gray-500 font-medium mt-1 inline-flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {exam.duration_minutes} min • {exam.total_marks} Marks
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-gray-400 italic bg-gray-50 rounded-lg">No exams available yet.</div>
              )}
            </div>
          ))}
          
          {course.course_units.length === 0 && (
             <div className="p-4 text-center text-gray-500 text-sm">Course content is empty.</div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 relative">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5 pointer-events-none"></div>
        {children}
      </div>
    </div>
  );
}
