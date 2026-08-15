import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-[0_8px_30px_rgba(37,99,235,0.25)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "bg-red-600 text-white shadow-[0_4px_16px_rgba(239,68,68,0.25)] hover:bg-red-700 hover:-translate-y-0.5 active:translate-y-0",
        outline:
          "border-[1.5px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-blue-600 hover:bg-blue-50 hover:border-blue-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(37,99,235,0.1)] active:translate-y-0",
        secondary:
          "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 hover:-translate-y-0.5 active:translate-y-0",
        ghost:
          "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-900 dark:text-slate-50 active:translate-y-0",
        link:
          "text-blue-600 underline-offset-4 hover:underline p-0 h-auto",
        ember:
          "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-[0_8px_30px_rgba(37,99,235,0.25)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 active:translate-y-0",
      },
      size: {
        default: "h-10 px-5 py-2.5 text-sm rounded-[14px]",
        sm: "h-8 px-4 py-1.5 text-xs rounded-xl",
        lg: "h-12 px-8 py-3 text-base rounded-[14px]",
        xl: "h-14 px-10 py-3.5 text-lg rounded-[14px]",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Component = asChild ? "span" : "button";

    return (
      <Component
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...(props as any)}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };