import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ExpenseList } from "@/components/expenses/expense-list";

export default async function ExpensesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    notFound();
  }

  const { projectId } = await params;

  // Verify project access
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId: session.user.organizationId,
    },
    select: { id: true },
  });

  if (!project) {
    notFound();
  }

  // Fetch budget categories and vendors for the expense form
  const [budgetCategories, vendors] = await Promise.all([
    prisma.budgetCategory.findMany({
      where: { budget: { projectId } },
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.vendor.findMany({
      where: {
        organizationId: session.user.organizationId,
        isActive: true,
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mt-6">
      <ExpenseList
        projectId={projectId}
        currentUserId={session.user.id}
        currentUserRole={session.user.role}
        categories={budgetCategories}
        vendors={vendors}
      />
    </div>
  );
}
