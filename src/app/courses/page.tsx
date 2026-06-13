import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";
import CoursesClient from "@/components/CoursesClient";

export const metadata = {
  title: "NSDA কোর্স লিস্ট — সব অকুপেশন ও লেভেল | AssessmentBD",
  description: "NSDA এর সকল অকুপেশন ও লেভেল ১–৬ এর কোর্স। IT Support Service Level 3, Welding Level 2, Graphic Design Level 4 সহ ৩৪৫+ কোর্স। NSDA assessment প্রস্তুতি নিন।",
  keywords: "nsda course list, nsda level 1 2 3 4 5 6, nsda occupation list, nsda assessment bangladesh"
};

export default async function CoursesPage(props: {
  searchParams: Promise<{ q?: string; sector?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";
  const sector = searchParams.sector || "";
  const page = parseInt(searchParams.page || "1", 10);
  const take = 15;
  const skip = (page - 1) * take;

  const session = await getSession();
  let subscribedCourseIds: string[] = [];
  if (session && session.userId) {
    const subs = await prisma.subscriptions.findMany({
      where: {
        user_id: BigInt(session.userId),
        status: "active",
        expires_at: { gt: new Date() }
      },
      select: { course_id: true }
    });
    subscribedCourseIds = subs.map(s => s.course_id.toString());
  }

  // Where filter
  const whereClause: any = { is_active: true };
  if (sector) {
    whereClause.sector = sector;
  }
  if (q) {
    whereClause.OR = [
      { title: { contains: q } },
      { sector: { contains: q } },
      { occupation: { contains: q } }
    ];
  }

  // Query courses and count
  const [coursesRaw, total] = await prisma.$transaction([
    prisma.courses.findMany({
      where: whereClause,
      orderBy: { sort_order: "asc" },
      skip,
      take,
      include: {
        _count: {
          select: { course_units: true, exams: true }
        }
      }
    }),
    prisma.courses.count({ where: whereClause })
  ]);

  // Query featured courses
  let featuredRaw: any[] = [];
  if (!q && !sector && page === 1) {
    featuredRaw = await prisma.courses.findMany({
      where: { is_active: true, is_featured: true },
      orderBy: { sort_order: "asc" },
      include: {
        _count: {
          select: { course_units: true, exams: true }
        }
      }
    });
  }

  // Determine if featured courses have questions
  const featuredWithQuestions = await Promise.all(
    featuredRaw.map(async (course) => {
      const hasQuestions = (await prisma.questions.count({
        where: { course_id: course.id }
      })) > 0 || (await prisma.unit_written_qas.count({
        where: { course_units: { course_id: course.id } }
      })) > 0;
      return { ...course, hasQuestions };
    })
  );

  // Fetch unique sectors list
  const sectorsRaw = await prisma.courses.findMany({
    where: { is_active: true, sector: { not: null } },
    select: { sector: true },
    distinct: ["sector"]
  });
  const sectors = sectorsRaw.map(s => s.sector as string).filter(Boolean);

  // Serialize BigInt data to strings
  const courses = JSON.parse(
    JSON.stringify(coursesRaw, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );

  const featured = JSON.parse(
    JSON.stringify(featuredWithQuestions, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );

  return (
    <CoursesClient
      courses={courses}
      featured={featured}
      sectors={sectors}
      total={total}
      page={page}
      take={take}
      q={q}
      sector={sector}
      subscribedCourseIds={subscribedCourseIds}
      isLoggedIn={!!session}
    />
  );
}
