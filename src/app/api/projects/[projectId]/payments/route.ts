import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/auth-utils";

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

  // Get all payments for this project's invoices
  const payments = await prisma.payment.findMany({
    where: {
      invoice: {
        projectId,
        organizationId: user.organizationId,
        deletedAt: null,
      },
    },
    orderBy: { paymentDate: "desc" },
    include: {
      invoice: {
        select: {
          id: true,
          invoiceNumber: true,
          clientName: true,
          totalCents: true,
          balanceDueCents: true,
          status: true,
        },
      },
    },
  });

  // Summary stats
  const totalReceived = payments.reduce((sum, p) => sum + p.amountCents, 0);

  return NextResponse.json({
    payments,
    summary: {
      totalReceived,
      paymentCount: payments.length,
    },
  });
}
