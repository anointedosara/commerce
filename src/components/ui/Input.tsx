import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted",
            "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand-500",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
Input.displayName = "Input";
