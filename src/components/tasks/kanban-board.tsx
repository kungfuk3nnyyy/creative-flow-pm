"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { moveTaskAction } from "@/actions/task.actions";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { TASK_STATUS_LABELS } from "@/lib/validations/task";
import type { TaskItem } from "@/hooks/use-milestones";

const COLUMNS = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const;

interface KanbanBoardProps {
  tasks: TaskItem[];
  projectId: string;
}

export function KanbanBoard({ tasks, projectId }: KanbanBoardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  // Group tasks by status
  const columnTasks: Record<string, TaskItem[]> = {
    TODO: [],
    IN_PROGRESS: [],
    REVIEW: [],
    DONE: [],
  };

  tasks.forEach((task) => {
    if (columnTasks[task.status]) {
      columnTasks[task.status].push(task);
    }
  });

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Determine target column - over could be a column ID or a task ID
    let newStatus: string;
    if (COLUMNS.includes(over.id as typeof COLUMNS[number])) {
      newStatus = over.id as string;
    } else {
      // Dropped on a task - find its status
      const overTask = tasks.find((t) => t.id === over.id);
      if (!overTask) return;
      newStatus = overTask.status;
    }

    if (task.status === newStatus) return;

    startTransition(async () => {
      await moveTaskAction({ taskId, newStatus });
      router.refresh();
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 ${isPending ? "opacity-70" : ""}`}
      >
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            id={status}
            label={TASK_STATUS_LABELS[status]}
            tasks={columnTasks[status]}
            count={columnTasks[status].length}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && <KanbanCard task={activeTask} isOverlay />}
      </DragOverlay>
    </DndContext>
  );
}
