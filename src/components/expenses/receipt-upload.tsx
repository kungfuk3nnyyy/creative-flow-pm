"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, X, FileText, Image } from "lucide-react";
import {
  uploadExpenseReceiptAction,
  deleteExpenseReceiptAction,
} from "@/actions/expense.actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
}

interface ReceiptUploadProps {
  expenseId: string;
  attachments: Attachment[];
  canEdit: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ReceiptUpload({
  expenseId,
  attachments,
  canEdit,
}: ReceiptUploadProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const file = files[0];
    const formData = new FormData();
    formData.set("expenseId", expenseId);
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadExpenseReceiptAction(formData);
      if (!result.success) {
        setError(result.error ?? "Upload failed.");
      } else {
        router.refresh();
      }
    });
  }

  function handleDelete(attachmentId: string, name: string) {
    if (!window.confirm(`Delete "${name}"?`)) return;
    startTransition(async () => {
      const result = await deleteExpenseReceiptAction(attachmentId);
      if (!result.success) {
        setError(result.error ?? "Delete failed.");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-xs text-error">{error}</p>
      )}

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((att) => {
            const Icon = att.mimeType.startsWith("image/") ? Image : FileText;
            return (
              <div
                key={att.id}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-linen rounded-lg text-xs group"
              >
                <Icon className="w-3 h-3 text-slate shrink-0" />
                <span className="text-ink truncate max-w-[120px]">{att.name}</span>
                <span className="text-stone">({formatSize(att.sizeBytes)})</span>
                {canEdit && (
                  <button
                    onClick={() => handleDelete(att.id, att.name)}
                    disabled={isPending}
                    className="p-0.5 text-stone hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                    aria-label={`Remove ${att.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {canEdit && (
        <label
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs",
            "text-slate hover:text-ink hover:bg-linen transition-colors cursor-pointer",
            isPending && "opacity-60 pointer-events-none",
          )}
        >
          <Paperclip className="w-3.5 h-3.5" />
          Attach receipt
          <input
            type="file"
            className="sr-only"
            onChange={(e) => handleUpload(e.target.files)}
            disabled={isPending}
          />
        </label>
      )}
    </div>
  );
}
