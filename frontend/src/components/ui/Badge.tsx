import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "low-risk" | "medium-risk" | "high-risk" | "emerald" | "blue" | "amber" | "rose" | "slate" | "violet";
  size?: "sm" | "md";
  showDot?: boolean;
}

export function Badge({
  className,
  variant = "slate",
  size = "md",
  showDot = false,
  children,
  ...props
}: BadgeProps) {
  const baseStyles = "inline-flex items-center font-medium rounded-full border transition-colors";

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 gap-1.5",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  const variantStyles = {
    "low-risk": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    "medium-risk": "bg-amber-500/10 text-amber-400 border-amber-500/30",
    "high-risk": "bg-rose-500/10 text-rose-400 border-rose-500/30",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    slate: "bg-slate-800 text-slate-300 border-slate-700",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  };

  const dotColors = {
    "low-risk": "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
    "medium-risk": "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]",
    "high-risk": "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]",
    emerald: "bg-emerald-400",
    blue: "bg-blue-400",
    amber: "bg-amber-400",
    rose: "bg-rose-400",
    slate: "bg-slate-400",
    violet: "bg-violet-400",
  };

  return (
    <span
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {showDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 animate-pulse", dotColors[variant])} />
      )}
      <span>{children}</span>
    </span>
  );
}
