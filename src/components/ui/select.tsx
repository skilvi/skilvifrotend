import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  inputSize?: 'sm' | 'default' | 'lg';
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, inputSize = 'default', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 px-3 text-xs rounded-lg',
      default: 'h-10 px-4 text-sm rounded-xl',
      lg: 'h-12 px-5 text-base rounded-xl',
    };

    return (
      <select
        className={cn(
          "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-50 font-sans transition-all outline-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] appearance-none cursor-pointer",
          "focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 dark:bg-slate-800/50",
          sizeClasses[inputSize],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Select.displayName = "Select";

export { Select };