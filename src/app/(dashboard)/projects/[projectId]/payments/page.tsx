"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { PaymentHistory } from "@/components/payments/payment-history";
import { ArAgingView } from "@/components/payments/ar-aging-view";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "payments", label: "Payments" },
  { key: "aging", label: "AR Aging" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function PaymentsPage() {
  const params = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>("payments");

  return (
    <div className="mt-6 space-y-6">
      <div className="border-b border-stone/10">
        <nav className="flex gap-0 -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.key
                  ? "border-terracotta-400 text-ink"
                  : "border-transparent text-slate hover:text-ink hover:border-stone/20",
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "payments" && (
        <PaymentHistory
          projectId={params.projectId}
          canRecord={true}
        />
      )}

      {activeTab === "aging" && (
        <ArAgingView projectId={params.projectId} />
      )}
    </div>
  );
}
