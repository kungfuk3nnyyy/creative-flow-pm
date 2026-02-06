import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/auth-utils";
import { expenseFilterSchema } from "@/lib/validations/expense";
import type { Prisma } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    throw error;
  }

  const { projectId } = await params;

  // Verify project belongs to org
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId: user.organizationId },
    select: { id: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = expenseFilterSchema.safeParse(searchParams);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid filters." }, { status: 400 });
  }

  const { status, budgetCategoryId, vendorId, search, page, pageSize } = parsed.data;

  const where: Prisma.ExpenseWhereInput = {
    projectId,
    organizationId: user.organizationId,
    deletedAt: null,
    ...(status && { status }),
    ...(budgetCategoryId && { budgetCategoryId }),
    ...(vendorId && { vendorId }),
    ...(search && {
      description: { contains: search, mode: "insensitive" as const },
    }),
  };

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        submittedBy: { select: { id: true, name: true, avatarUrl: true } },
        approvedBy: { select: { id: true, name: true } },
        budgetCategory: { select: { id: true, name: true } },
        vendor: { select: { id: true, name: true } },
        attachments: {
          select: { id: true, name: true, mimeType: true, sizeBytes: true },
        },
      },
    }),
    prisma.expense.count({ where }),
  ]);

  return NextResponse.json({
    expenses,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}
