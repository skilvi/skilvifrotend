import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap font-semibold transition-all",
  {
    variants: {
      variant: {
        default:
          "bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1 text-xs",
        ember:
          "bg-[rgba(37,99,235,0.08)] text-blue-700 border border-[rgba(37,99,235,0.15)] rounded-full px-3 py-1 text-xs",
        blue:
          "bg-[rgba(59,130,246,0.08)] text-blue-600 border border-[rgba(59,130,246,0.15)] rounded-full px-3 py-1 text-xs",
        green:
          "bg-[rgba(16,185,129,0.08)] text-emerald-700 border border-[rgba(16,185,129,0.15)] rounded-full px-3 py-1 text-xs",
        amber:
          "bg-[rgba(245,158,11,0.08)] text-amber-700 border border-[rgba(245,158,11,0.15)] rounded-full px-3 py-1 text-xs",
        red:
          "bg-[rgba(239,68,68,0.08)] text-red-700 border border-[rgba(239,68,68,0.15)] rounded-full px-3 py-1 text-xs",
        slate:
          "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1 text-xs",
        solid:
          "bg-blue-600 text-white rounded-full px-3 py-1 text-xs shadow-sm",
        "solid-green":
          "bg-emerald-500 text-white rounded-full px-3 py-1 text-xs shadow-sm",
        "solid-amber":
          "bg-amber-500 text-white rounded-full px-3 py-1 text-xs shadow-sm",
        "solid-red":
          "bg-red-600 text-white rounded-full px-3 py-1 text-xs shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };