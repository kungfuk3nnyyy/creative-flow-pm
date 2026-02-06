"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  Calendar,
  Trash2,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { moveTaskAction, deleteTaskAction } from "@/actions/task.actions";
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from "@/lib/validations/task";
import type { TaskItem as TaskType } from "@/hooks/use-milestones";

interface TaskItemProps {
  task: TaskType;
  projectId: string;
}

export function TaskItem({ task, projectId }: TaskItemProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isDone = task.status === "DONE";

  function handleToggle() {
    startTransition(async () => {
      await moveTaskAction({
        taskId: task.id,
        newStatus: isDone ? "TODO" : "DONE",
      });
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteTaskAction(task.id);
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-3 py-2.5 rounded-lg group hover:bg-linen/50 transition-colors",
        isPending && "opacity-60",
      )}
    >
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={cn(
          "mt-0.5 transition-colors shrink-0",
          isDone
            ? "text-sage-500 hover:text-sage-600"
            : "text-stone hover:text-terracotta-400",
        )}
        aria-label={isDone ? "Mark incomplete" : "Mark complete"}
      >
        {isDone ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <Circle className="w-4 h-4" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm text-ink",
            isDone && "line-through text-slate",
          )}
        >
          {task.title}
        </p>

        <div className="flex items-center gap-3 mt-1">
          <span
            className={cn(
              "text-xs font-medium",
              TASK_PRIORITY_COLORS[task.priority],
            )}
          >
            {TASK_PRIORITY_LABELS[task.priority]}
          </span>

          {task.dueDate && (
            <span className="inline-flex items-center gap-1 text-xs text-stone">
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}

          {task.assignee && (
            <span className="inline-flex items-center gap-1 text-xs text-slate">
              <User className="w-3 h-3" />
              {task.assignee.name}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-1 rounded text-stone opacity-0 group-hover:opacity-100 hover:text-error hover:bg-error-soft transition-all"
        aria-label="Delete task"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
