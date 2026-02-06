"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { List, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMilestones } from "@/hooks/use-milestones";
import { MilestoneList } from "@/components/milestones/milestone-list";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { Spinner } from "@/components/shared/spinner";

type ViewMode = "timeline" | "kanban";

export default function MilestonesPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const { data, isLoading } = useMilestones(projectId);

  // Flatten all tasks across milestones for kanban view
  const allTasks = data?.milestones.flatMap((m) => m.tasks) ?? [];

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-h4 text-ink">
          {viewMode === "timeline" ? "Milestones" : "Task Board"}
        </h2>

        <div className="flex items-center gap-1 bg-parchment rounded-xl p-1">
          <button
            onClick={() => setViewMode("timeline")}
            className={cn(
              "p-2 rounded-lg transition-colors text-sm",
              viewMode === "timeline"
                ? "bg-paper text-ink shadow-sm"
                : "text-stone hover:text-ink",
            )}
            aria-label="Timeline view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={cn(
              "p-2 rounded-lg transition-colors text-sm",
              viewMode === "kanban"
                ? "bg-paper text-ink shadow-sm"
                : "text-stone hover:text-ink",
            )}
            aria-label="Kanban view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && viewMode === "timeline" && (
        <MilestoneList projectId={projectId} />
      )}

      {!isLoading && viewMode === "kanban" && (
        <KanbanBoard tasks={allTasks} projectId={projectId} />
      )}
    </div>
  );
}
