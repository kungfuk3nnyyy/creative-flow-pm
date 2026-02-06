"use client";

import { useToastStore, type ToastVariant } from "@/stores/toast-store";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";

const VARIANT_STYLES: Record<
  ToastVariant,
  { bg: string; border: string; icon: typeof CheckCircle; iconColor: string }
> = {
  success: {
    bg: "bg-success-soft",
    border: "border-success/20",
    icon: CheckCircle,
    iconColor: "text-success",
  },
  error: {
    bg: "bg-error-soft",
    border: "border-error/20",
    icon: AlertCircle,
    iconColor: "text-error",
  },
  warning: {
    bg: "bg-warning-soft",
    border: "border-warning/20",
    icon: AlertTriangle,
    iconColor: "text-warning",
  },
  info: {
    bg: "bg-info-soft",
    border: "border-info/20",
    icon: Info,
    iconColor: "text-info",
  },
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-4 sm:right-6 z-notification space-y-2 max-w-[calc(100vw-2rem)] sm:max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((t) => {
        const style = VARIANT_STYLES[t.variant];
        const Icon = style.icon;

        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-md",
              "animate-toast-enter",
              style.bg,
              style.border,
            )}
            role="status"
          >
            <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", style.iconColor)} />
            <p className="flex-1 text-sm text-ink">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="p-0.5 rounded text-stone hover:text-ink transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
