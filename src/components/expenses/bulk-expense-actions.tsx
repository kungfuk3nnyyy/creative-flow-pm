"use client";

import { useState, useTransition } from "react";
import { CheckCheck, Loader2 } from "lucide-react";
import { bulkApproveExpensesAction } from "@/actions/bulk.actions";
import { toast } from "@/stores/toast-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BulkExpenseActionsProps {
  selectedIds: string[];
  onComplete: () => void;
}

export function BulkExpenseActions({
  selectedIds,
  onComplete,
}: BulkExpenseActionsProps) {
  const [isPending, startTransition] = useTransition();

  if (selectedIds.length === 0) return null;

  function handleBulkApprove() {
    startTransition(async () => {
      const result = await bulkApproveExpensesAction(selectedIds);
      if (result.processed > 0) {
        toast.success(
          `Approved ${result.processed} expense${result.processed !== 1 ? "s" : ""}${
            result.failed > 0 ? ` (${result.failed} failed)` : ""
          }`,
        );
      }
      if (result.errors.length > 0 && result.processed === 0) {
        toast.error(result.errors[0]);
      }
      onComplete();
    });
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl",
        "bg-terracotta-50 border border-terracotta-100",
      )}
    >
      <span className="text-sm text-ink font-medium">
        {selectedIds.length} expense{selectedIds.length !== 1 ? "s" : ""} selected
      </span>
      <Button
        variant="accent"
        size="sm"
        onClick={handleBulkApprove}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
        ) : (
          <CheckCheck className="w-4 h-4 mr-1.5" />
        )}
        Approve Selected
      </Button>
    </div>
  );
}
