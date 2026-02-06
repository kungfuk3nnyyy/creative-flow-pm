"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { KanbanCard } from "./kanban-card";
import type { TaskItem } from "@/hooks/use-milestones";

interface KanbanColumnProps {
  id: string;
  label: string;
  tasks: TaskItem[];
  count: number;
}

export function KanbanColumn({ id, label, tasks, count }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "bg-parchment/50 rounded-xl p-3 min-h-[200px] transition-colors",
        isOver && "bg-terracotta-50/50 ring-2 ring-terracotta-200",
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-slate uppercase tracking-wide">
          {label}
        </h3>
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-paper text-xs text-stone font-medium">
          {count}
        </span>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}

        {tasks.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-xs text-stone">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
}
