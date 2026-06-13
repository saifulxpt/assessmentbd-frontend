import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-utils';
import OrderClient from '@/components/OrderClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NSDA Assessment Preparation — AssessmentBD | Question Bank',
  description: 'NSDA TVET Trainee Assessment-এর জন্য সেরা Question Bank। MCQ, Written Question, উত্তর, ব্যাখ্যা ও Model Assessment — সব এক জায়গায়।',
};

export default async function OrderPage(props: { searchParams: Promise<{ course?: string; plan?: string }> }) {
  const searchParams = await props.searchParams;

  // 1. Identify which courses have questions to show them at the top
  const mcqCourses = await prisma.questions.findMany({
    where: { question_type: 'mcq' },
    select: { course_id: true },
    distinct: ['course_id']
  });
  const mcqIds = mcqCourses.map(q => q.course_id.toString());

  const coursesWithWritten = await prisma.course_units.findMany({
    where: {
      is_active: true,
      unit_written_qas: { some: {} }
    },
    select: { course_id: true },
    distinct: ['course_id']
  });
  const writtenIds = coursesWithWritten.map(cu => cu.course_id.toString());

  const coursesWithQuestions = Array.from(new Set([...mcqIds, ...writtenIds]));

  // 2. Fetch all active courses
  const dbCourses = await prisma.courses.findMany({
    where: { is_active: true }
  });

  const courses = dbCourses.map(course => ({
    id: course.id.toString(),
    title: course.title,
    has_questions: coursesWithQuestions.includes(course.id.toString())
  })).sort((a, b) => {
    // Sort by has_questions desc, then title asc (Bengali collation)
    if (a.has_questions && !b.has_questions) return -1;
    if (!a.has_questions && b.has_questions) return 1;
    return a.title.localeCompare(b.title, 'bn');
  });

  // 3. Get admin settings
  const settings = await prisma.settings.findMany();
  const settingsMap: Record<string, string> = {};
  for (const s of settings) {
    if (s.value) settingsMap[s.key] = s.value;
  }

  // 4. Check auth session
  const session = await getSession();
  let currentUser = null;
  if (session && session.userId) {
    const user = await prisma.users.findUnique({
      where: { id: BigInt(session.userId) },
      select: { id: true, name: true, mobile: true, wallet_balance: true }
    });
    if (user) {
      currentUser = {
        id: user.id.toString(),
        name: user.name,
        mobile: user.mobile,
        wallet_balance: user.wallet_balance.toString()
      };
    }
  }

  // Format pricing values
  const basicPrice = parseFloat(settingsMap['basic_plan_price'] || '99');
  const proPrice = parseFloat(settingsMap['pro_plan_price'] || '299');

  // Format support settings
  const whatsapp = settingsMap['site_whatsapp'] || '01778654560';
  const cleanWa = whatsapp.replace(/[^0-9]/g, "");
  const waNum = cleanWa.length === 11 && cleanWa.startsWith("01") ? `88${cleanWa}` : cleanWa;

  return (
    <OrderClient
      courses={courses}
      settings={settingsMap}
      currentUser={currentUser}
      basicPrice={basicPrice}
      proPrice={proPrice}
      waNum={waNum}
      selectedCourseId={searchParams.course || ''}
      selectedPlan={searchParams.plan || 'basic'}
    />
  );
}
