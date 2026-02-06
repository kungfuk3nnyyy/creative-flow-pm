import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/auth-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
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

  const { projectId } = await params;

  // Verify project belongs to organization
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId: user.organizationId },
    select: { id: true },
  });

  if (!project) {
    return NextResponse.json(
      { error: "Project not found." },
      { status: 404 },
    );
  }

  const milestones = await prisma.milestone.findMany({
    where: { projectId },
    orderBy: { sortOrder: "asc" },
    include: {
      tasks: {
        orderBy: { sortOrder: "asc" },
        include: {
          assignee: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      },
      _count: {
        select: { tasks: true },
      },
    },
  });

  return NextResponse.json({ milestones });
}
