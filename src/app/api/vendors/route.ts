import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/auth-utils";
import { vendorFilterSchema } from "@/lib/validations/vendor";
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
  const parsed = vendorFilterSchema.safeParse(searchParams);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid filters." },
      { status: 400 },
    );
  }

  const { search, category, page, perPage } = parsed.data;

  const where: Prisma.VendorWhereInput = {
    organizationId: user.organizationId,
  };

  if (category) {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { contactName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * perPage;

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take: perPage,
      include: {
        _count: {
          select: { projects: true, expenses: true },
        },
      },
    }),
    prisma.vendor.count({ where }),
  ]);

  return NextResponse.json({
    vendors,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  });
}
