import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/auth-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> },
) {
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

  const { vendorId } = await params;

  const vendor = await prisma.vendor.findFirst({
    where: {
      id: vendorId,
      organizationId: user.organizationId,
    },
    include: {
      projects: {
        include: {
          project: {
            select: { id: true, name: true, status: true, type: true },
          },
        },
      },
      _count: {
        select: { expenses: true, projects: true },
      },
    },
  });

  if (!vendor) {
    return NextResponse.json(
      { error: "Vendor not found." },
      { status: 404 },
    );
  }

  return NextResponse.json(vendor);
}
