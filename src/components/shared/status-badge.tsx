import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-success-soft text-success border-success/20",
  warning: "bg-warning-soft text-warning border-warning/20",
  error: "bg-error-soft text-error border-error/20",
  info: "bg-info-soft text-info border-info/20",
  neutral: "bg-parchment text-slate border-stone/10",
};

interface StatusBadgeProps {
  variant: BadgeVariant;
  label: string;
  dot?: boolean;
  className?: string;
}

export function StatusBadge({
  variant,
  label,
  dot = true,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        "px-2.5 py-1 rounded-full",
        "text-xs font-medium border",
        variantStyles[variant],
        className,
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {label}
    </span>
  );
}

/**
 * Map common entity statuses to badge variants.
 */
export function getProjectStatusVariant(
  status: string,
): BadgeVariant {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "DRAFT":
      return "neutral";
    case "ON_HOLD":
      return "warning";
    case "COMPLETED":
      return "info";
    case "ARCHIVED":
      return "neutral";
    default:
      return "neutral";
  }
}

export function getInvoiceStatusVariant(
  status: string,
): BadgeVariant {
  switch (status) {
    case "PAID":
      return "success";
    case "PARTIALLY_PAID":
      return "info";
    case "SENT":
    case "VIEWED":
      return "neutral";
    case "OVERDUE":
      return "error";
    case "WRITTEN_OFF":
      return "error";
    case "DRAFT":
      return "neutral";
    default:
      return "neutral";
  }
}

export function getExpenseStatusVariant(
  status: string,
): BadgeVariant {
  switch (status) {
    case "APPROVED":
      return "success";
    case "SUBMITTED":
      return "info";
    case "REJECTED":
      return "error";
    case "DRAFT":
      return "neutral";
    case "REIMBURSED":
      return "success";
    default:
      return "neutral";
  }
}
