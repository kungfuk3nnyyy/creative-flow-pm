import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectForm } from "@/components/projects/project-form";

export default function NewProjectPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="New Project"
        description="Set up a new creative project with client details and schedule."
        actions={
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-slate hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
        }
      />

      <ProjectForm />
    </div>
  );
}
