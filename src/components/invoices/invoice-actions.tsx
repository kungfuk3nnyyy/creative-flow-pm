"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Trash2, Ban, Download } from "lucide-react";
import {
  sendInvoiceAction,
  deleteInvoiceAction,
  writeOffInvoiceAction,
} from "@/actions/invoice.actions";
import { Button } from "@/components/ui/button";

interface InvoiceActionsProps {
  invoiceId: string;
  status: string;
  isAdmin: boolean;
}

export function InvoiceActions({ invoiceId, status, isAdmin }: InvoiceActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSend() {
    startTransition(async () => {
      const result = await sendInvoiceAction(invoiceId);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error ?? "Failed.");
      }
    });
  }

  function handleDelete() {
    if (!window.confirm("Delete this draft invoice?")) return;
    startTransition(async () => {
      const result = await deleteInvoiceAction(invoiceId);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error ?? "Failed.");
      }
    });
  }

  function handleWriteOff() {
    if (!window.confirm("Write off this invoice? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await writeOffInvoiceAction(invoiceId);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error ?? "Failed.");
      }
    });
  }

  return (
    <div className="space-y-1">
      {error && <p className="text-xs text-error">{error}</p>}

      <div className="flex items-center gap-2">
        <a
          href={`/api/invoices/${invoiceId}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-paper border border-stone/20 text-ink hover:bg-linen transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          PDF
        </a>

        {status === "DRAFT" && (
          <>
            <Button size="sm" variant="accent" loading={isPending} onClick={handleSend}>
              <Send className="w-3.5 h-3.5" />
              Send
            </Button>
            <Button size="sm" variant="danger" loading={isPending} onClick={handleDelete}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </>
        )}

        {status === "OVERDUE" && isAdmin && (
          <Button size="sm" variant="ghost" loading={isPending} onClick={handleWriteOff}>
            <Ban className="w-3.5 h-3.5" />
            Write Off
          </Button>
        )}
      </div>
    </div>
  );
}
