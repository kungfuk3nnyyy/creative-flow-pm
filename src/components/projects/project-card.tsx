import Link from "next/link";
import { Calendar, Milestone, Receipt, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  StatusBadge,
  getProjectStatusVariant,
} from "@/components/shared/status-badge";
import {
  PROJECT_TYPE_LABELS,
  PROJECT_STATUS_LABELS,
} from "@/lib/validations/project";
import type { ProjectListItem } from "@/hooks/use-projects";

interface ProjectCardProps {
  project: ProjectListItem;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block bg-paper rounded-2xl border border-stone/10 shadow-sm hover:shadow-md hover:border-stone/20 transition-all duration-150 group"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-h4 text-ink truncate group-hover:text-terracotta-500 transition-colors">
              {project.name}
            </h3>
            <p className="text-caption text-slate mt-0.5">
              {PROJECT_TYPE_LABELS[project.type] ?? project.type}
            </p>
          </div>
          <StatusBadge
            variant={getProjectStatusVariant(project.status)}
            label={PROJECT_STATUS_LABELS[project.status] ?? project.status}
          />
        </div>

        {project.description && (
          <p className="text-body-sm text-slate line-clamp-2 mb-4">
            {project.description}
          </p>
        )}

        {project.clientName && (
          <p className="text-caption text-stone mb-4">
            Client: {project.clientName}
          </p>
        )}

        <div className="flex items-center gap-4 text-caption text-stone">
          {project.startDate && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(project.startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}

          <span className={cn("inline-flex items-center gap-1", project._count.milestones > 0 && "text-slate")}>
            <Milestone className="w-3.5 h-3.5" />
            {project._count.milestones}
          </span>

          <span className={cn("inline-flex items-center gap-1", project._count.expenses > 0 && "text-slate")}>
            <Receipt className="w-3.5 h-3.5" />
            {project._count.expenses}
          </span>

          <span className={cn("inline-flex items-center gap-1", project._count.invoices > 0 && "text-slate")}>
            <FileText className="w-3.5 h-3.5" />
            {project._count.invoices}
          </span>
        </div>
      </div>
    </Link>
  );
}
