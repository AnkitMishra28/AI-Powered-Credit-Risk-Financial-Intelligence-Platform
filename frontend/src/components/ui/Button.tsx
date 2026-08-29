import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "emerald";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-6 py-3 gap-2.5",
    };

    const variantStyles = {
      primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 focus:ring-blue-500 border border-blue-500/30",
      emerald: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 focus:ring-emerald-500 border border-emerald-500/30",
      secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/60 focus:ring-slate-400",
      outline: "bg-transparent hover:bg-slate-800/60 text-slate-200 border border-slate-700 focus:ring-slate-400",
      ghost: "bg-transparent hover:bg-slate-800/40 text-slate-300 hover:text-white focus:ring-slate-500",
      danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 focus:ring-rose-500",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
