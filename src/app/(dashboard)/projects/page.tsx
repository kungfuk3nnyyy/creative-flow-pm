import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ProjectsList } from "@/components/projects/projects-list";

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Projects"
        description="Manage your creative projects, budgets, and milestones."
        actions={
          <Link href="/projects/new">
            <Button variant="accent">New Project</Button>
          </Link>
        }
      />

      <ProjectsList />
    </div>
  );
}
