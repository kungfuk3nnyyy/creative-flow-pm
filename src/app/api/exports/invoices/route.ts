import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/auth-utils";
import { generateCsv, csvResponse, type CsvColumn } from "@/lib/csv";
import { formatDate } from "@/lib/utils";

interface InvoiceRow {
  invoiceNumber: string;
  clientName: string;
  projectName: string;
  issueDate: Date;
  dueDate: Date;
  subtotal: number;
  tax: number;
  total: number;
  balanceDue: number;
  status: string;
  paymentTerms: string;
}

const columns: CsvColumn<InvoiceRow>[] = [
  { header: "Invoice #", value: (r) => r.invoiceNumber },
  { header: "Client", value: (r) => r.clientName },
  { header: "Project", value: (r) => r.projectName },
  { header: "Issue Date", value: (r) => formatDate(r.issueDate) },
  { header: "Due Date", value: (r) => formatDate(r.dueDate) },
  { header: "Subtotal (KSh)", value: (r) => (r.subtotal / 100).toFixed(2) },
  { header: "Tax (KSh)", value: (r) => (r.tax / 100).toFixed(2) },
  { header: "Total (KSh)", value: (r) => (r.total / 100).toFixed(2) },
  { header: "Balance Due (KSh)", value: (r) => (r.balanceDue / 100).toFixed(2) },
  { header: "Status", value: (r) => r.status },
  { header: "Payment Terms", value: (r) => r.paymentTerms },
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

  const invoices = await prisma.invoice.findMany({
    where: {
      organizationId: user.organizationId,
      deletedAt: null,
      ...(status && { status: status as any }),
    },
    include: {
      project: { select: { name: true } },
    },
    orderBy: { issueDate: "desc" },
  });

  const rows: InvoiceRow[] = invoices.map((inv) => ({
    invoiceNumber: inv.invoiceNumber,
    clientName: inv.clientName,
    projectName: inv.project.name,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    subtotal: inv.subtotalCents,
    tax: inv.taxAmountCents,
    total: inv.totalCents,
    balanceDue: inv.balanceDueCents,
    status: inv.status,
    paymentTerms: inv.paymentTerms,
  }));

  const csv = generateCsv(columns, rows);
  const today = new Date().toISOString().slice(0, 10);
  return csvResponse(csv, `invoices-${today}.csv`);
}
