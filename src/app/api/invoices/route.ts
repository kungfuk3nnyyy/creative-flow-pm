import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/auth-utils";
import { invoiceFilterSchema } from "@/lib/validations/invoice";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    throw error;
  }

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = invoiceFilterSchema.safeParse(searchParams);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid filters." }, { status: 400 });
  }

  const { status, search, page, pageSize } = parsed.data;
  const projectId = request.nextUrl.searchParams.get("projectId") || undefined;

  const where: Prisma.InvoiceWhereInput = {
    organizationId: user.organizationId,
    deletedAt: null,
    ...(projectId && { projectId }),
    ...(status && { status }),
    ...(search && {
      OR: [
        { invoiceNumber: { contains: search, mode: "insensitive" as const } },
        { clientName: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        project: { select: { id: true, name: true } },
        lineItems: {
          select: {
            id: true,
            description: true,
            quantityThousandths: true,
            unitPriceCents: true,
            amountCents: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: "asc" },
        },
        _count: { select: { payments: true } },
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  return NextResponse.json({
    invoices,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}
