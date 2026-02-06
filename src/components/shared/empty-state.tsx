import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  secondaryLabel,
  secondaryHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 bg-linen rounded-2xl mb-4 border border-stone/5">
        <Icon className="w-8 h-8 text-stone" />
      </div>
      <h3 className="text-h4 text-ink">{title}</h3>
      <p className="text-body-sm text-slate mt-2 max-w-sm">{description}</p>
      <div className="flex items-center gap-3 mt-6">
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-ink text-paper font-medium text-sm hover:bg-charcoal transition-all duration-150 active:scale-[0.98]"
          >
            {actionLabel}
          </Link>
        )}
        {secondaryLabel && secondaryHref && (
          <Link
            href={secondaryHref}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-paper border border-stone/20 text-ink font-medium text-sm hover:bg-linen transition-all duration-150"
          >
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
