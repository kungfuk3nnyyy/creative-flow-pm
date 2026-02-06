"use client";

import { useParams } from "next/navigation";
import { BudgetEditor } from "@/components/budget/budget-editor";

export default function BudgetPage() {
  const params = useParams<{ projectId: string }>();

  return (
    <div className="mt-6">
      <BudgetEditor projectId={params.projectId} />
    </div>
  );
}
