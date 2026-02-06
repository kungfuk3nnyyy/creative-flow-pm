import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { InvoiceList } from "@/components/invoices/invoice-list";

export default async function InvoicesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    notFound();
  }

  const { projectId } = await params;

  // Verify project access and get client info for the form default
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId: session.user.organizationId,
    },
    select: {
      id: true,
      clientName: true,
      clientEmail: true,
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="mt-6">
      <InvoiceList
        projectId={projectId}
        currentUserRole={session.user.role}
        defaultClientName={project.clientName ?? undefined}
        defaultClientEmail={project.clientEmail ?? undefined}
      />
    </div>
  );
}
