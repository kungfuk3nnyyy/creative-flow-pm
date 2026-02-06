"use client";

import { useQuery } from "@tanstack/react-query";

interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  completedAt: string | null;
  sortOrder: number;
  assignee: {
    id: string;
    name: string;
    avatarUrl: string | null;
  } | null;
}

interface MilestoneItem {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  dueDate: string | null;
  completedAt: string | null;
  tasks: TaskItem[];
  _count: {
    tasks: number;
  };
}

interface MilestonesResponse {
  milestones: MilestoneItem[];
}

export function useMilestones(projectId: string) {
  return useQuery<MilestonesResponse>({
    queryKey: ["milestones", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/milestones`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to fetch milestones.");
      }
      return res.json();
    },
    enabled: !!projectId,
    staleTime: 15 * 1000,
  });
}

export type { MilestoneItem, TaskItem };
