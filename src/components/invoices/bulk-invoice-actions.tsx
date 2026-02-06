"use client";

import { useTransition } from "react";
import { Send, Loader2 } from "lucide-react";
import { bulkSendInvoicesAction } from "@/actions/bulk.actions";
import { toast } from "@/stores/toast-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BulkInvoiceActionsProps {
  selectedIds: string[];
  onComplete: () => void;
}

export function BulkInvoiceActions({
  selectedIds,
  onComplete,
}: BulkInvoiceActionsProps) {
  const [isPending, startTransition] = useTransition();

  if (selectedIds.length === 0) return null;

  function handleBulkSend() {
    startTransition(async () => {
      const result = await bulkSendInvoicesAction(selectedIds);
      if (result.processed > 0) {
        toast.success(
          `Sent ${result.processed} invoice${result.processed !== 1 ? "s" : ""}${
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
        {selectedIds.length} invoice{selectedIds.length !== 1 ? "s" : ""} selected
      </span>
      <Button
        variant="accent"
        size="sm"
        onClick={handleBulkSend}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
        ) : (
          <Send className="w-4 h-4 mr-1.5" />
        )}
        Send Selected
      </Button>
    </div>
  );
}
