import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number; // 0 - 100
  max?: number;
  variant?: "emerald" | "lime" | "blue" | "amber" | "rose" | "dynamic";
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
    if (pct >= 80) return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.35)]";
    if (pct >= 60) return "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.35)]";
    if (pct >= 40) return "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.35)]";
    return "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.35)]";
  };

  const variantColors = {
    emerald: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.35)]",
    lime: "bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.35)]",
    blue: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.35)]",
    amber: "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.35)]",
    rose: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.35)]",
    dynamic: getDynamicColor(percentage),
  };

  const heightStyles = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="font-semibold text-neutral-300">{label}</span>}
          {showLabel && <span className="text-neutral-400 font-mono font-medium">{percentage.toFixed(0)}%</span>}
        </div>
      )}
      <div className={cn("w-full bg-[#121A14] rounded-full overflow-hidden p-0.5 border border-white/5", heightStyles[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", variantColors[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
