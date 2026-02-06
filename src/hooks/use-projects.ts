"use client";

import { useQuery } from "@tanstack/react-query";
import type { ProjectFilterInput } from "@/lib/validations/project";

interface ProjectListItem {
  id: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  clientName: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    milestones: number;
    expenses: number;
    invoices: number;
  };
}

interface ProjectsResponse {
  projects: ProjectListItem[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

function buildQueryString(filters: Partial<ProjectFilterInput>): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });
  return params.toString();
}

export function useProjects(filters: Partial<ProjectFilterInput> = {}) {
  return useQuery<ProjectsResponse>({
    queryKey: ["projects", filters],
    queryFn: async () => {
      const qs = buildQueryString(filters);
      const res = await fetch(`/api/projects?${qs}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to fetch projects.");
      }
      return res.json();
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useProject(projectId: string) {
  return useQuery<ProjectListItem>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to fetch project.");
      }
      return res.json();
    },
    enabled: !!projectId,
    staleTime: 30 * 1000,
  });
}

export type { ProjectListItem, ProjectsResponse };
