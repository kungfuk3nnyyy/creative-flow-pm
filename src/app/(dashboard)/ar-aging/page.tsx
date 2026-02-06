"use client";

import { PageHeader } from "@/components/shared/page-header";
import { ArAgingView } from "@/components/payments/ar-aging-view";

export default function ArAgingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts Receivable"
        description="Organization-wide AR aging across all projects."
      />
      <ArAgingView />
    </div>
  );
}
