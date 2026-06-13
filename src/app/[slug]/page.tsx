import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

async function getPageBySlug(slug: string) {
  const dbSlug = slug === 'refund-policy' ? 'refund' : slug;
  const page = await prisma.pages.findUnique({
    where: { slug: dbSlug }
  });
  
  if (!page || !page.is_active) return null;
  
  // Safe serialization of data (since ID is BigInt)
  return {
    id: page.id.toString(),
    slug: page.slug,
    title: page.title,
    content: page.content,
  };
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const page = await getPageBySlug(slug);
  if (!page) return { title: 'Page Not Found' };
  
  return {
    title: `${page.title} - AssessmentBD`,
  };
}

export default async function DynamicPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const page = await getPageBySlug(slug);
  
  if (!page) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Dark gradient header */}
      <div 
        style={{ background: 'linear-gradient(135deg,#0f172a 0%,#0948b3 60%,#0f172a 100%)' }} 
        className="py-10 md:py-14 relative overflow-hidden"
      >
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%)' }}
        />
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
            {page.title}
          </h1>
        </div>
      </div>

      {/* Body content */}
      <div className="max-w-4xl mx-auto px-4 py-12 prose prose-slate prose-lg">
        <div 
          className="max-w-none text-gray-700 leading-relaxed whitespace-pre-line" 
          dangerouslySetInnerHTML={{ __html: page.content || '' }} 
        />
      </div>
    </div>
  );
}
