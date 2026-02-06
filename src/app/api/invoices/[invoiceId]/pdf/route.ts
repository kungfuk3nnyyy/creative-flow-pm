import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/auth-utils";
import { InvoicePDF, type InvoicePDFData } from "@/lib/pdf/invoice-pdf";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    throw error;
  }

  const { invoiceId } = await params;

  const [invoice, org] = await Promise.all([
    prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId: user.organizationId,
        deletedAt: null,
      },
      include: {
        lineItems: {
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
    prisma.organization.findUniqueOrThrow({
      where: { id: user.organizationId },
      select: {
        name: true,
        address: true,
        phone: true,
        email: true,
        website: true,
      },
    }),
  ]);

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  const data: InvoicePDFData = {
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
    paymentTerms: invoice.paymentTerms,
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail,
    clientAddress: invoice.clientAddress,
    orgName: org.name,
    orgAddress: org.address,
    orgPhone: org.phone,
    orgEmail: org.email,
    orgWebsite: org.website,
    lineItems: invoice.lineItems.map((li) => ({
      description: li.description,
      quantityThousandths: li.quantityThousandths,
      unitPriceCents: li.unitPriceCents,
      amountCents: li.amountCents,
    })),
    subtotalCents: invoice.subtotalCents,
    taxRateBasisPoints: invoice.taxRateBasisPoints,
    taxAmountCents: invoice.taxAmountCents,
    totalCents: invoice.totalCents,
    balanceDueCents: invoice.balanceDueCents,
    notes: invoice.notes,
  };

  const buffer = await renderToBuffer(React.createElement(InvoicePDF, { data }) as any);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.invoiceNumber}.pdf"`,
    },
  });
}
