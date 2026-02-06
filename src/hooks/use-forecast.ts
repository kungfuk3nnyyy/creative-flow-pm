"use client";

import { useQuery } from "@tanstack/react-query";
import type { CashFlowForecast } from "@/lib/financial/forecast";

interface ForecastResponse {
  forecast: CashFlowForecast;
}

export function useForecast(params: {
  weeks?: number;
  startingBalance?: number;
}) {
  return useQuery<ForecastResponse>({
    queryKey: ["forecast", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.weeks) searchParams.set("weeks", String(params.weeks));
      if (params.startingBalance !== undefined) {
        searchParams.set("startingBalance", String(params.startingBalance));
      }

      const res = await fetch(`/api/reports/forecast?${searchParams.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to fetch forecast.");
      }
      return res.json();
    },
    staleTime: 60 * 1000,
  });
}
