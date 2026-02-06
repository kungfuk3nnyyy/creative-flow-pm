"use client";

import { useQuery } from "@tanstack/react-query";
import type { VendorFilterInput } from "@/lib/validations/vendor";

interface VendorListItem {
  id: string;
  name: string;
  category: string;
  email: string | null;
  phone: string | null;
  contactName: string | null;
  rating: number | null;
  isActive: boolean;
  _count: {
    projects: number;
    expenses: number;
  };
}

interface VendorsResponse {
  vendors: VendorListItem[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

function buildQueryString(filters: Partial<VendorFilterInput>): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });
  return params.toString();
}

export function useVendors(filters: Partial<VendorFilterInput> = {}) {
  return useQuery<VendorsResponse>({
    queryKey: ["vendors", filters],
    queryFn: async () => {
      const qs = buildQueryString(filters);
      const res = await fetch(`/api/vendors?${qs}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to fetch vendors.");
      }
      return res.json();
    },
    staleTime: 30 * 1000,
  });
}

export type { VendorListItem, VendorsResponse };
