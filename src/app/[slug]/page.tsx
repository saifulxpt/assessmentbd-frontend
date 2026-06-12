import { getPageContent } from '@/lib/api';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = await getPageContent(params.slug);
  if (!page) return { title: 'Page Not Found' };
  
  return {
    title: \`\${page.title} - AssessmentBD\`,
  };
}

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  // Try to fetch page content from backend
  const page = await getPageContent(params.slug);
  
  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-3xl md:text-5xl font-bold mb-8 text-gray-900 border-b pb-6">
            {page.title}
          </h1>
          <div 
            className="prose prose-lg prose-blue max-w-none text-gray-700" 
            dangerouslySetInnerHTML={{ __html: page.content || '' }} 
          />
        </div>
      </div>
    </div>
  );
}
