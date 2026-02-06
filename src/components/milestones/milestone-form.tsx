"use client";

import { useState, useTransition } from "react";
import { createMilestoneAction } from "@/actions/milestone.actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface MilestoneFormProps {
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MilestoneForm({
  projectId,
  onSuccess,
  onCancel,
}: MilestoneFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);

    const input = {
      projectId,
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
      dueDate: (formData.get("dueDate") as string) || undefined,
    };

    startTransition(async () => {
      const result = await createMilestoneAction(input);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error ?? "Failed to create milestone.");
      }
    });
  }

  return (
    <form
      action={handleSubmit}
      className="bg-paper rounded-xl border border-terracotta-200 p-4 space-y-4"
    >
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}

      <Input
        label="Milestone Name"
        name="name"
        placeholder="e.g., Design Phase"
        required
        autoFocus
      />

      <Textarea
        label="Description"
        name="description"
        placeholder="Optional description..."
        rows={2}
      />

      <Input
        label="Due Date"
        name="dueDate"
        type="date"
      />

      <div className="flex items-center gap-2 justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" variant="accent" size="sm" loading={isPending}>
          Add Milestone
        </Button>
      </div>
    </form>
  );
}
