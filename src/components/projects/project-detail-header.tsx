"use client";

import Link from "next/link";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import {
  StatusBadge,
  getProjectStatusVariant,
} from "@/components/shared/status-badge";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_TYPE_LABELS,
} from "@/lib/validations/project";
import { ProjectStatusActions } from "./project-status-actions";

interface ProjectDetailHeaderProps {
  project: {
    id: string;
    name: string;
    type: string;
    status: string;
    clientName: string | null;
    _count: {
      milestones: number;
      expenses: number;
      invoices: number;
      files: number;
      comments: number;
    };
  };
}

export function ProjectDetailHeader({ project }: ProjectDetailHeaderProps) {
  const basePath = `/projects/${project.id}`;

  const tabs = [
    { label: "Overview", href: basePath },
    { label: "Milestones", href: `${basePath}/milestones`, count: project._count.milestones },
    { label: "Budget", href: `${basePath}/budget` },
    { label: "Expenses", href: `${basePath}/expenses`, count: project._count.expenses },
    { label: "Invoices", href: `${basePath}/invoices`, count: project._count.invoices },
    { label: "Payments", href: `${basePath}/payments` },
    { label: "Files", href: `${basePath}/files`, count: project._count.files },
    { label: "Activity", href: `${basePath}/activity`, count: project._count.comments },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Projects
        </Link>
      </div>

      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-h2 text-ink">{project.name}</h1>
            <StatusBadge
              variant={getProjectStatusVariant(project.status)}
              label={
                PROJECT_STATUS_LABELS[project.status] ?? project.status
              }
            />
          </div>
          <p className="text-body-sm text-slate">
            {PROJECT_TYPE_LABELS[project.type] ?? project.type}
            {project.clientName && (
              <span className="ml-2">
                for {project.clientName}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ProjectStatusActions
            projectId={project.id}
            currentStatus={project.status}
          />
          <button
            className="p-2 rounded-lg text-stone hover:bg-linen hover:text-ink transition-colors"
            aria-label="More actions"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <Tabs tabs={tabs} className="mt-6" />
    </div>
  );
}
