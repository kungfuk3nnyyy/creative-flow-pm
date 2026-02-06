"use client";

import { useDraggable } from "@dnd-kit/core";
import { Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from "@/lib/validations/task";
import type { TaskItem } from "@/hooks/use-milestones";

interface KanbanCardProps {
  task: TaskItem;
  isOverlay?: boolean;
}

export function KanbanCard({ task, isOverlay }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-paper rounded-lg border border-stone/10 p-3 cursor-grab active:cursor-grabbing shadow-sm",
        "hover:shadow-md hover:border-stone/20 transition-all",
        isDragging && "opacity-50",
        isOverlay && "shadow-lg rotate-2",
      )}
    >
      <p
        className={cn(
          "text-sm text-ink font-medium",
          task.status === "DONE" && "line-through text-slate",
        )}
      >
        {task.title}
      </p>

      <div className="flex items-center gap-2 mt-2">
        <span
          className={cn(
            "text-xs font-medium",
            TASK_PRIORITY_COLORS[task.priority],
          )}
        >
          {TASK_PRIORITY_LABELS[task.priority]}
        </span>

        {task.dueDate && (
          <span className="inline-flex items-center gap-0.5 text-xs text-stone">
            <Calendar className="w-3 h-3" />
            {new Date(task.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>

      {task.assignee && (
        <div className="flex items-center gap-1.5 mt-2">
          <div className="w-5 h-5 rounded-full bg-linen flex items-center justify-center">
            <User className="w-3 h-3 text-stone" />
          </div>
          <span className="text-xs text-slate">{task.assignee.name}</span>
        </div>
      )}
    </div>
  );
}
