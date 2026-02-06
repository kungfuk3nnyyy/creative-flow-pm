import Link from "next/link";
import {
  StatusBadge,
  getProjectStatusVariant,
} from "@/components/shared/status-badge";
import {
  PROJECT_TYPE_LABELS,
  PROJECT_STATUS_LABELS,
} from "@/lib/validations/project";
import type { ProjectListItem } from "@/hooks/use-projects";

interface ProjectTableProps {
  projects: ProjectListItem[];
}

export function ProjectTable({ projects }: ProjectTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-stone/10">
            <th className="text-left text-label text-slate px-4 py-3 font-medium">
              Name
            </th>
            <th className="text-left text-label text-slate px-4 py-3 font-medium hidden sm:table-cell">
              Type
            </th>
            <th className="text-left text-label text-slate px-4 py-3 font-medium">
              Status
            </th>
            <th className="text-left text-label text-slate px-4 py-3 font-medium hidden md:table-cell">
              Client
            </th>
            <th className="text-left text-label text-slate px-4 py-3 font-medium hidden lg:table-cell">
              Start Date
            </th>
            <th className="text-right text-label text-slate px-4 py-3 font-medium hidden md:table-cell">
              Milestones
            </th>
            <th className="text-right text-label text-slate px-4 py-3 font-medium hidden lg:table-cell">
              Expenses
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr
              key={project.id}
              className="border-b border-stone/5 hover:bg-linen/50 transition-colors"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/projects/${project.id}`}
                  className="text-sm font-medium text-ink hover:text-terracotta-500 transition-colors"
                >
                  {project.name}
                </Link>
                {project.description && (
                  <p className="text-xs text-stone mt-0.5 line-clamp-1 max-w-xs">
                    {project.description}
                  </p>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-slate hidden sm:table-cell">
                {PROJECT_TYPE_LABELS[project.type] ?? project.type}
              </td>
              <td className="px-4 py-3">
                <StatusBadge
                  variant={getProjectStatusVariant(project.status)}
                  label={
                    PROJECT_STATUS_LABELS[project.status] ?? project.status
                  }
                />
              </td>
              <td className="px-4 py-3 text-sm text-slate hidden md:table-cell">
                {project.clientName ?? "-"}
              </td>
              <td className="px-4 py-3 text-sm text-slate hidden lg:table-cell">
                {project.startDate
                  ? new Date(project.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "-"}
              </td>
              <td className="px-4 py-3 text-sm text-slate text-right hidden md:table-cell">
                {project._count.milestones}
              </td>
              <td className="px-4 py-3 text-sm text-slate text-right hidden lg:table-cell">
                {project._count.expenses}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
