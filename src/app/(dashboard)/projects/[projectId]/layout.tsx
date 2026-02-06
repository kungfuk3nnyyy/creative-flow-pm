import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProjectDetailHeader } from "@/components/projects/project-detail-header";

export default async function ProjectDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    notFound();
  }

  const { projectId } = await params;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId: session.user.organizationId,
    },
    include: {
      _count: {
        select: {
          milestones: true,
          expenses: true,
          invoices: true,
          files: true,
          comments: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ProjectDetailHeader project={project} />
      {children}
    </div>
  );
}
