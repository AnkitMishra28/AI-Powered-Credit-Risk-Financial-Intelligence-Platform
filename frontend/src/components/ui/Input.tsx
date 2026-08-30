import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold text-neutral-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-neutral-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full bg-[#0E1510] text-[#F9FAFB] placeholder:text-neutral-500 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 disabled:opacity-50 disabled:bg-[#080D09]",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-rose-500/80 focus:ring-rose-500 focus:border-rose-500",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-neutral-400 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-rose-400 flex items-center gap-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-neutral-400 leading-relaxed">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
