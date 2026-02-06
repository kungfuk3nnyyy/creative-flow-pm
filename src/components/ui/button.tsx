import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium text-sm transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-ring",
  {
    variants: {
      variant: {
        primary: "bg-ink text-paper hover:bg-charcoal shadow-sm",
        secondary:
          "bg-paper text-ink border border-stone/20 hover:bg-linen hover:border-stone/30",
        accent:
          "bg-terracotta-400 text-white hover:bg-terracotta-500 shadow-[0_1px_2px_rgba(0,0,0,0.1),0_2px_8px_rgba(229,131,97,0.25)]",
        ghost: "text-slate hover:bg-parchment hover:text-ink",
        danger: "bg-error text-white hover:bg-error/90",
        link: "text-terracotta-500 hover:text-terracotta-600 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-5 py-2.5",
        lg: "h-12 px-6 py-3 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
