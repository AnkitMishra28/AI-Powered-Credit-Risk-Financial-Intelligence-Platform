import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number; // 0 - 100
  max?: number;
  variant?: "emerald" | "blue" | "amber" | "rose" | "dynamic";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  variant = "dynamic",
  size = "md",
  showLabel = false,
  label,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const getDynamicColor = (pct: number) => {
    if (pct >= 80) return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
    if (pct >= 60) return "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]";
    if (pct >= 40) return "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]";
    return "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]";
  };

  const variantColors = {
    emerald: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
    blue: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]",
    amber: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]",
    rose: "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]",
    dynamic: getDynamicColor(percentage),
  };

  const heightStyles = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-3.5",
  };

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="font-medium text-slate-300">{label}</span>}
          {showLabel && <span className="text-slate-400 font-mono">{percentage.toFixed(0)}%</span>}
        </div>
      )}
      <div className={cn("w-full bg-slate-800 rounded-full overflow-hidden p-0.5", heightStyles[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", variantColors[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
