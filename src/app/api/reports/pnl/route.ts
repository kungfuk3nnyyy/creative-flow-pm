import { NextRequest, NextResponse } from "next/server";
import { requireRole, AuthError } from "@/lib/auth-utils";
import { generatePnlReport } from "@/lib/services/pnl.service";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  let user;
  try {
    user = await requireRole(UserRole.MANAGER);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    throw error;
  }

  const params = request.nextUrl.searchParams;
  const startStr = params.get("startDate");
  const endStr = params.get("endDate");
  const basis = (params.get("basis") ?? "accrual") as "cash" | "accrual";
  const projectId = params.get("projectId") ?? undefined;

  if (!startStr || !endStr) {
    return NextResponse.json(
      { error: "startDate and endDate are required." },
      { status: 400 },
    );
  }

  const startDate = new Date(startStr);
  const endDate = new Date(endStr);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return NextResponse.json(
      { error: "Invalid date format." },
      { status: 400 },
    );
  }

  // Set end date to end of day
  endDate.setHours(23, 59, 59, 999);

  const report = await generatePnlReport({
    organizationId: user.organizationId,
    startDate,
    endDate,
    projectId,
    basis,
  });

  return NextResponse.json({ report });
}
