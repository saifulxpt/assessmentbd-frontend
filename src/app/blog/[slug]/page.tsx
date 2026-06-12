import { getBlogBySlug } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const blog = await getBlogBySlug(params.slug);
  if (!blog) return { title: 'Blog Not Found' };
  
  return {
    title: \`\${blog.title} - AssessmentBD\`,
    description: blog.content?.replace(/<[^>]*>?/gm, '').substring(0, 160) || 'Blog details',
  };
}

export default async function BlogDetailsPage({ params }: { params: { slug: string } }) {
  const blog = await getBlogBySlug(params.slug);
  
  if (!blog) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 max-w-4xl py-12">
          <Link href="/blog" className="text-blue-600 hover:underline mb-6 inline-block">
            ← Back to Blog
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">
            {blog.title}
          </h1>
          <div className="flex items-center text-gray-500 mb-8">
            <span>{new Date(blog.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          
          {blog.image_url && (
            <div className="w-full h-auto mb-10 rounded-xl overflow-hidden shadow-lg">
              <img src={blog.image_url} alt={blog.title} className="w-full h-auto object-cover" />
            </div>
          )}
        </div>
      </div>

      {/* Blog Content */}
      <div className="container mx-auto px-4 max-w-4xl mt-10">
        <article className="prose prose-lg prose-blue max-w-none text-gray-700 bg-white p-8 md:p-12 rounded-xl shadow-sm" dangerouslySetInnerHTML={{ __html: blog.content || '' }} />
      </div>
    </div>
  );
}
