import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthOrThrow } from "@/lib/auth-utils";

/**
 * GET /api/search?q=<query>&limit=<number>
 *
 * Global search across projects, invoices, expenses, and vendors.
 * All queries are org-scoped.
 */
export async function GET(request: NextRequest) {
  const session = await getAuthOrThrow();
  const orgId = session.user.organizationId;
  const params = request.nextUrl.searchParams;
  const q = params.get("q")?.trim() ?? "";
  const limit = Math.min(parseInt(params.get("limit") ?? "5", 10), 20);

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const contains = q;

  const [projects, invoices, expenses, vendors] = await Promise.all([
    prisma.project.findMany({
      where: {
        organizationId: orgId,
        archivedAt: null,
        OR: [
          { name: { contains, mode: "insensitive" } },
          { clientName: { contains, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        clientName: true,
        status: true,
        type: true,
      },
      take: limit,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.invoice.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
        OR: [
          { invoiceNumber: { contains, mode: "insensitive" } },
          { clientName: { contains, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        invoiceNumber: true,
        clientName: true,
        status: true,
        totalCents: true,
        projectId: true,
      },
      take: limit,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.expense.findMany({
      where: {
        deletedAt: null,
        project: { organizationId: orgId },
        description: { contains, mode: "insensitive" },
      },
      select: {
        id: true,
        description: true,
        amountCents: true,
        status: true,
        projectId: true,
      },
      take: limit,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.vendor.findMany({
      where: {
        organizationId: orgId,
        OR: [
          { name: { contains, mode: "insensitive" } },
          { email: { contains, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        category: true,
        email: true,
      },
      take: limit,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const results = [
    ...projects.map((p) => ({
      type: "project" as const,
      id: p.id,
      title: p.name,
      subtitle: p.clientName ?? p.type,
      href: `/projects/${p.id}`,
      status: p.status,
    })),
    ...invoices.map((inv) => ({
      type: "invoice" as const,
      id: inv.id,
      title: inv.invoiceNumber,
      subtitle: inv.clientName,
      href: `/projects/${inv.projectId}/invoices`,
      status: inv.status,
    })),
    ...expenses.map((exp) => ({
      type: "expense" as const,
      id: exp.id,
      title: exp.description,
      subtitle: `$${(exp.amountCents / 100).toFixed(2)}`,
      href: `/projects/${exp.projectId}/expenses`,
      status: exp.status,
    })),
    ...vendors.map((v) => ({
      type: "vendor" as const,
      id: v.id,
      title: v.name,
      subtitle: v.category ?? v.email ?? "",
      href: `/vendors/${v.id}`,
    })),
  ];

  return NextResponse.json({ results });
}
