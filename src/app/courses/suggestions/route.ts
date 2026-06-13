import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (q.trim().length < 2) {
    return NextResponse.json([]);
  }

  try {
    const courses = await prisma.courses.findMany({
      where: {
        is_active: true,
        OR: [
          { title: { contains: q } },
          { sector: { contains: q } },
          { category: { contains: q } },
          { occupation: { contains: q } }
        ]
      },
      take: 8,
      select: {
        id: true,
        title: true,
        slug: true,
        sector: true,
        category: true
      }
    });

    const serialized = JSON.parse(
      JSON.stringify(courses, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return NextResponse.json(serialized);
  } catch (err) {
    console.error("Suggestions API error:", err);
    return NextResponse.json([]);
  }
}
