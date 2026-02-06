"use client";

import { useQuery } from "@tanstack/react-query";

interface TeamMemberInfo {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
}

interface TeamItem {
  id: string;
  name: string;
  description: string | null;
  members: { user: TeamMemberInfo }[];
  _count: {
    members: number;
    projects: number;
  };
}

interface TeamsResponse {
  teams: TeamItem[];
  orgMembers: TeamMemberInfo[];
}

export function useTeams() {
  return useQuery<TeamsResponse>({
    queryKey: ["teams"],
    queryFn: async () => {
      const res = await fetch("/api/teams");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to fetch teams.");
      }
      return res.json();
    },
    staleTime: 30 * 1000,
  });
}

export type { TeamItem, TeamMemberInfo };
