"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { transitionProjectStatusAction } from "@/actions/project.actions";
import { getValidNextStatuses, getTransitionLabel } from "@/lib/project-status";
import { Button } from "@/components/ui/button";
import type { ProjectStatus } from "@prisma/client";

interface ProjectStatusActionsProps {
  projectId: string;
  currentStatus: string;
}

export function ProjectStatusActions({
  projectId,
  currentStatus,
}: ProjectStatusActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const validNextStatuses = getValidNextStatuses(
    currentStatus as ProjectStatus,
  );

  if (validNextStatuses.length === 0) return null;

  function handleTransition(newStatus: ProjectStatus) {
    setError(null);
    startTransition(async () => {
      const result = await transitionProjectStatusAction(projectId, newStatus);
      if (!result.success) {
        setError(result.error ?? "Failed to update status.");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span className="text-xs text-error">{error}</span>
      )}
      {validNextStatuses.map((status) => {
        const isPositive =
          status === "ACTIVE" || status === "COMPLETED";
        return (
          <Button
            key={status}
            variant={isPositive ? "accent" : "secondary"}
            size="sm"
            loading={isPending}
            onClick={() => handleTransition(status)}
          >
            {getTransitionLabel(currentStatus as ProjectStatus, status)}
          </Button>
        );
      })}
    </div>
  );
}
