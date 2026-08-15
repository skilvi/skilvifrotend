import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  inputSize?: 'sm' | 'default' | 'lg';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputSize = 'default', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 px-3 text-xs rounded-lg',
      default: 'h-10 px-4 text-sm rounded-xl',
      lg: 'h-12 px-5 text-base rounded-xl',
    };

    return (
      <input
        type={type}
        className={cn(
          "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-50 font-sans transition-all outline-none placeholder:text-slate-400 shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)]",
          "focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 dark:bg-slate-800/50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          sizeClasses[inputSize],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };