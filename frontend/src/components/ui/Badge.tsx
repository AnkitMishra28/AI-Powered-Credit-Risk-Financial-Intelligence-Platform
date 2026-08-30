import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "low-risk" | "medium-risk" | "high-risk" | "emerald" | "lime" | "blue" | "amber" | "rose" | "slate" | "violet";
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
  const baseStyles = "inline-flex items-center rounded-full border transition-colors select-none";

  const sizeStyles = {
    sm: "text-xs px-2.5 py-0.5 gap-1.5 font-medium",
    md: "text-xs px-3 py-1 gap-1.5 font-semibold",
  };

  const variantStyles = {
    "low-risk": "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    "medium-risk": "bg-amber-500/10 text-amber-300 border-amber-500/30",
    "high-risk": "bg-rose-500/10 text-rose-300 border-rose-500/30",
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    lime: "bg-lime-500/10 text-lime-300 border-lime-500/30",
    blue: "bg-sky-500/10 text-sky-300 border-sky-500/30",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    rose: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    slate: "bg-[#121A14] text-neutral-300 border-white/10",
    violet: "bg-emerald-950/40 text-emerald-300 border-emerald-500/30",
  };

  const dotColors = {
    "low-risk": "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
    "medium-risk": "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]",
    "high-risk": "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]",
    emerald: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
    lime: "bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.8)]",
    blue: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]",
    amber: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]",
    rose: "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]",
    slate: "bg-neutral-400",
    violet: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
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
