"use client";

import { useState } from "react";
import { Plus, ListTodo } from "lucide-react";
import { TaskItem } from "./task-item";
import { TaskForm } from "./task-form";
import { Button } from "@/components/ui/button";
import type { TaskItem as TaskType } from "@/hooks/use-milestones";

interface TaskListProps {
  tasks: TaskType[];
  milestoneId: string;
  projectId: string;
}

export function TaskList({ tasks, milestoneId, projectId }: TaskListProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-2">
      {tasks.length === 0 && !showForm && (
        <div className="text-center py-4">
          <ListTodo className="w-5 h-5 text-stone mx-auto mb-2" />
          <p className="text-xs text-stone mb-2">No tasks yet</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </Button>
        </div>
      )}

      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} projectId={projectId} />
      ))}

      {tasks.length > 0 && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-stone hover:text-ink hover:bg-linen transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add task
        </button>
      )}

      {showForm && (
        <TaskForm
          milestoneId={milestoneId}
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
