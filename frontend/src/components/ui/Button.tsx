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
    const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050706] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-3.5 py-2 gap-2",
      md: "text-sm px-4.5 py-2.5 gap-2.5",
      lg: "text-base px-6 py-3.5 gap-3",
    };

    const variantStyles = {
      primary: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-950/60 hover:shadow-emerald-900/80 focus:ring-emerald-400 border border-emerald-400/30",
      emerald: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-950/60 hover:shadow-emerald-900/80 focus:ring-emerald-400 border border-emerald-400/30",
      secondary: "bg-[#101712] hover:bg-[#152019] text-[#F3F4F6] border border-white/10 hover:border-emerald-500/30 shadow-sm focus:ring-neutral-400",
      outline: "bg-transparent hover:bg-emerald-950/20 text-[#E5E7EB] hover:text-white border border-white/10 hover:border-emerald-500/40 focus:ring-emerald-500",
      ghost: "bg-transparent hover:bg-white/5 text-[#9CA3AF] hover:text-white focus:ring-neutral-500",
      danger: "bg-rose-600/90 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 border border-rose-500/30 focus:ring-rose-500",
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
