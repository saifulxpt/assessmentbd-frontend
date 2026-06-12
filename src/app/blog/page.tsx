import { getBlogs } from '@/lib/api';
import Link from 'next/link';

export const metadata = {
  title: 'Blog - AssessmentBD',
  description: 'Read the latest news and articles from AssessmentBD.',
};

export default async function BlogPage() {
  const blogData = await getBlogs();
  const blogs = blogData?.data || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Our Blog</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog: any) => (
            <div key={blog.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <Link href={`/blog/${blog.slug}`} className="flex-shrink-0">
                <div className="relative h-56 w-full bg-gray-200">
                  {blog.image_url ? (
                    <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>
              </Link>
              <div className="p-6 flex flex-col flex-grow">
                <p className="text-sm text-gray-500 mb-2">
                  {new Date(blog.published_at).toLocaleDateString()}
                </p>
                <Link href={`/blog/${blog.slug}`}>
                  <h3 className="text-xl font-bold mb-3 text-gray-800 hover:text-blue-600 transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                </Link>
                <div className="text-gray-600 mb-4 line-clamp-3 flex-grow" dangerouslySetInnerHTML={{ __html: blog.content?.substring(0, 150) + '...' || '' }} />
                <Link href={`/blog/${blog.slug}`} className="text-blue-600 font-semibold hover:text-blue-800 mt-auto inline-block">
                  Read More →
                </Link>
              </div>
            </div>
          ))}
          
          {blogs.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-12">
              No blog posts found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
