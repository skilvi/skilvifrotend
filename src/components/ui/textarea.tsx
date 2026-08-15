import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  inputSize?: 'sm' | 'default' | 'lg';
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, inputSize = 'default', ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-50 font-sans transition-all outline-none placeholder:text-slate-400 shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] resize-y min-h-[100px] px-4 py-3 text-sm rounded-xl",
          "focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 dark:bg-slate-800/50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };