"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useMilestones, type MilestoneItem } from "@/hooks/use-milestones";
import { reorderMilestonesAction } from "@/actions/milestone.actions";
import { MilestoneCard } from "./milestone-card";
import { MilestoneForm } from "./milestone-form";
import { Spinner } from "@/components/shared/spinner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface MilestoneListProps {
  projectId: string;
}

export function MilestoneList({ projectId }: MilestoneListProps) {
  const router = useRouter();
  const { data, isLoading, error } = useMilestones(projectId);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [optimisticOrder, setOptimisticOrder] = useState<MilestoneItem[] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const milestones = optimisticOrder ?? data?.milestones ?? [];

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = milestones.findIndex((m) => m.id === active.id);
    const newIndex = milestones.findIndex((m) => m.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(milestones, oldIndex, newIndex);
    setOptimisticOrder(newOrder);

    startTransition(async () => {
      await reorderMilestonesAction({
        projectId,
        milestoneIds: newOrder.map((m) => m.id),
      });
      setOptimisticOrder(null);
      router.refresh();
    });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-soft border border-error/20 rounded-xl p-4 text-sm text-error">
        {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate">
          {milestones.length} milestone{milestones.length !== 1 ? "s" : ""}
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="w-4 h-4" />
          Add Milestone
        </Button>
      </div>

      {showForm && (
        <MilestoneForm
          projectId={projectId}
          onSuccess={() => {
            setShowForm(false);
            router.refresh();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {milestones.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={milestones.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className={`space-y-3 ${isPending ? "opacity-70" : ""}`}>
              {milestones.map((milestone, index) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  index={index}
                  total={milestones.length}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
