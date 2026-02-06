"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Calendar,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  toggleMilestoneCompleteAction,
  deleteMilestoneAction,
} from "@/actions/milestone.actions";
import { TaskList } from "../tasks/task-list";
import type { MilestoneItem } from "@/hooks/use-milestones";

interface MilestoneCardProps {
  milestone: MilestoneItem;
  index: number;
  total: number;
}

export function MilestoneCard({ milestone, index, total }: MilestoneCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: milestone.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCompleted = !!milestone.completedAt;
  const completedTasks = milestone.tasks.filter(
    (t) => t.status === "DONE",
  ).length;
  const totalTasks = milestone.tasks.length;

  function handleToggleComplete() {
    startTransition(async () => {
      await toggleMilestoneCompleteAction(milestone.id);
      router.refresh();
    });
  }

  function handleDelete() {
    if (totalTasks > 0) {
      const confirmed = window.confirm(
        `Delete "${milestone.name}" and its ${totalTasks} task(s)?`,
      );
      if (!confirmed) return;
    }
    startTransition(async () => {
      await deleteMilestoneAction(milestone.id);
      router.refresh();
    });
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-paper rounded-xl border border-stone/10 shadow-sm",
        isDragging && "shadow-md opacity-90 z-10",
        isCompleted && "opacity-75",
      )}
    >
      {/* Milestone Header */}
      <div className="flex items-center gap-3 p-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-stone hover:text-slate p-1 -ml-1 touch-none"
          aria-label="Reorder milestone"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Timeline Indicator */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleToggleComplete}
            disabled={isPending}
            className={cn(
              "transition-colors",
              isCompleted
                ? "text-sage-500 hover:text-sage-600"
                : "text-stone hover:text-terracotta-400",
            )}
            aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>
          {index < total - 1 && (
            <div className="w-px h-full bg-stone/20 mt-1" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                "text-sm font-medium text-ink truncate",
                isCompleted && "line-through text-slate",
              )}
            >
              {milestone.name}
            </h3>
            {totalTasks > 0 && (
              <span className="text-xs text-stone">
                {completedTasks}/{totalTasks} tasks
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            {milestone.dueDate && (
              <span className="inline-flex items-center gap-1 text-xs text-slate">
                <Calendar className="w-3 h-3" />
                {new Date(milestone.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
            {milestone.description && (
              <span className="text-xs text-stone truncate max-w-xs">
                {milestone.description}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-1.5 rounded-lg text-stone hover:text-error hover:bg-error-soft transition-colors"
            aria-label="Delete milestone"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg text-stone hover:text-ink hover:bg-linen transition-colors"
            aria-label={expanded ? "Collapse tasks" : "Expand tasks"}
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {totalTasks > 0 && (
        <div className="px-4 pb-2">
          <div className="h-1 bg-parchment rounded-full overflow-hidden">
            <div
              className="h-full bg-sage-400 rounded-full transition-all duration-300"
              style={{
                width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Expanded Tasks */}
      {expanded && (
        <div className="border-t border-stone/5 p-4">
          <TaskList
            tasks={milestone.tasks}
            milestoneId={milestone.id}
            projectId={milestone.projectId}
          />
        </div>
      )}
    </div>
  );
}
