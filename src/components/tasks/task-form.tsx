"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTaskAction } from "@/actions/task.actions";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TASK_PRIORITY_LABELS } from "@/lib/validations/task";

const priorityOptions = Object.entries(TASK_PRIORITY_LABELS).map(
  ([value, label]) => ({ value, label }),
);

interface TaskFormProps {
  milestoneId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TaskForm({ milestoneId, onSuccess, onCancel }: TaskFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);

    const input = {
      milestoneId,
      title: formData.get("title") as string,
      priority: (formData.get("priority") as string) || "MEDIUM",
      dueDate: (formData.get("dueDate") as string) || undefined,
    };

    startTransition(async () => {
      const result = await createTaskAction(input);
      if (result.success) {
        onSuccess();
        router.refresh();
      } else {
        setError(result.error ?? "Failed to create task.");
      }
    });
  }

  return (
    <form
      action={handleSubmit}
      className="bg-linen/50 rounded-lg border border-stone/10 p-3 space-y-3"
    >
      {error && <p className="text-xs text-error">{error}</p>}

      <Input
        name="title"
        placeholder="Task title..."
        required
        autoFocus
        className="text-sm"
      />

      <div className="grid grid-cols-2 gap-2">
        <Select
          name="priority"
          options={priorityOptions}
          defaultValue="MEDIUM"
        />
        <Input name="dueDate" type="date" />
      </div>

      <div className="flex items-center gap-2 justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={isPending}>
          Add Task
        </Button>
      </div>
    </form>
  );
}
