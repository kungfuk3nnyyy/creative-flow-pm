"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle, XCircle, Trash2 } from "lucide-react";
import {
  submitExpenseAction,
  approveExpenseAction,
  rejectExpenseAction,
  deleteExpenseAction,
} from "@/actions/expense.actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExpenseActionsProps {
  expenseId: string;
  status: string;
  isSubmitter: boolean;
  isManager: boolean;
}

export function ExpenseActions({
  expenseId,
  status,
  isSubmitter,
  isManager,
}: ExpenseActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    startTransition(async () => {
      const result = await submitExpenseAction({ expenseId });
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error ?? "Failed.");
      }
    });
  }

  function handleApprove() {
    startTransition(async () => {
      const result = await approveExpenseAction({ expenseId });
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error ?? "Failed.");
      }
    });
  }

  function handleReject() {
    if (!rejectionReason.trim()) return;
    startTransition(async () => {
      const result = await rejectExpenseAction({
        expenseId,
        rejectionReason: rejectionReason.trim(),
      });
      if (result.success) {
        setShowRejectForm(false);
        router.refresh();
      } else {
        setError(result.error ?? "Failed.");
      }
    });
  }

  function handleDelete() {
    if (!window.confirm("Delete this expense? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteExpenseAction(expenseId);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error ?? "Failed.");
      }
    });
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-xs text-error">{error}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {/* Draft: submitter can submit or delete */}
        {status === "DRAFT" && isSubmitter && (
          <>
            <Button
              size="sm"
              variant="accent"
              loading={isPending}
              onClick={handleSubmit}
            >
              <Send className="w-3.5 h-3.5" />
              Submit
            </Button>
            <Button
              size="sm"
              variant="danger"
              loading={isPending}
              onClick={handleDelete}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          </>
        )}

        {/* Submitted: manager (not submitter) can approve/reject */}
        {status === "SUBMITTED" && isManager && !isSubmitter && (
          <>
            <Button
              size="sm"
              variant="primary"
              loading={isPending}
              onClick={handleApprove}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowRejectForm(!showRejectForm)}
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject
            </Button>
          </>
        )}

        {/* Rejected: submitter can delete */}
        {status === "REJECTED" && isSubmitter && (
          <Button
            size="sm"
            variant="danger"
            loading={isPending}
            onClick={handleDelete}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </Button>
        )}
      </div>

      {showRejectForm && (
        <div className="flex items-start gap-2 mt-2">
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Reason for rejection..."
            className={cn(
              "flex-1 px-3 py-2 rounded-lg border border-stone/20 text-sm text-ink bg-paper",
              "focus:outline-none focus:border-terracotta-300",
              "resize-none",
            )}
            rows={2}
          />
          <Button
            size="sm"
            variant="danger"
            loading={isPending}
            onClick={handleReject}
            disabled={!rejectionReason.trim()}
          >
            Confirm
          </Button>
        </div>
      )}
    </div>
  );
}
