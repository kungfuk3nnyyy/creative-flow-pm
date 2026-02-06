import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/auth-utils";
import { generateCsv, csvResponse, type CsvColumn } from "@/lib/csv";
import { formatDate } from "@/lib/utils";

interface ExpenseRow {
  description: string;
  amount: number;
  status: string;
  date: Date;
  projectName: string;
  categoryName: string | null;
  vendorName: string | null;
  submitterName: string;
}

const columns: CsvColumn<ExpenseRow>[] = [
  { header: "Date", value: (r) => formatDate(r.date) },
  { header: "Description", value: (r) => r.description },
  { header: "Amount (KSh)", value: (r) => (r.amount / 100).toFixed(2) },
  { header: "Status", value: (r) => r.status },
  { header: "Project", value: (r) => r.projectName },
  { header: "Category", value: (r) => r.categoryName },
  { header: "Vendor", value: (r) => r.vendorName },
  { header: "Submitted By", value: (r) => r.submitterName },
];

export async function GET(req: NextRequest) {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.statusCode,
        headers: { "Content-Type": "application/json" },
      });
    }
    throw error;
  }

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") || undefined;
  const projectId = searchParams.get("projectId") || undefined;

  const expenses = await prisma.expense.findMany({
    where: {
      organizationId: user.organizationId,
      deletedAt: null,
      ...(status && { status: status as any }),
      ...(projectId && { projectId }),
    },
    include: {
      project: { select: { name: true } },
      budgetCategory: { select: { name: true } },
      vendor: { select: { name: true } },
      submittedBy: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });

  const rows: ExpenseRow[] = expenses.map((e) => ({
    description: e.description,
    amount: e.amountCents,
    status: e.status,
    date: e.date,
    projectName: e.project.name,
    categoryName: e.budgetCategory?.name ?? null,
    vendorName: e.vendor?.name ?? null,
    submitterName: e.submittedBy.name,
  }));

  const csv = generateCsv(columns, rows);
  const today = new Date().toISOString().slice(0, 10);
  return csvResponse(csv, `expenses-${today}.csv`);
}
