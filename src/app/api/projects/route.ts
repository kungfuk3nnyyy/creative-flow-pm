import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/auth-utils";
import { projectFilterSchema } from "@/lib/validations/project";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = projectFilterSchema.safeParse(searchParams);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid filters." },
      { status: 400 },
    );
  }

  const { search, status, type, sortBy, sortOrder, page, perPage } =
    parsed.data;

  // Build where clause - always scoped to organization
  const where: Prisma.ProjectWhereInput = {
    organizationId: user.organizationId,
  };

  if (status) {
    where.status = status;
  }

  if (type) {
    where.type = type;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { clientName: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Build orderBy
  const orderBy: Prisma.ProjectOrderByWithRelationInput = {
    [sortBy]: sortOrder,
  };

  const skip = (page - 1) * perPage;

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy,
      skip,
      take: perPage,
      include: {
        _count: {
          select: {
            milestones: true,
            expenses: true,
            invoices: true,
          },
        },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return NextResponse.json({
    projects,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  });
}
