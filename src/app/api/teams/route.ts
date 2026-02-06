import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/auth-utils";

export async function GET() {
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

  const teams = await prisma.team.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { name: "asc" },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true, role: true },
          },
        },
      },
      _count: {
        select: {
          members: true,
          projects: true,
        },
      },
    },
  });

  // Also fetch org members for the "add member" flow
  const orgMembers = await prisma.user.findMany({
    where: { organizationId: user.organizationId, isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, avatarUrl: true, role: true },
  });

  return NextResponse.json({ teams, orgMembers });
}
