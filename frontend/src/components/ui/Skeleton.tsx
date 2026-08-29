import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rectangular" | "circular" | "text";
}

export function Skeleton({
  className,
  variant = "rectangular",
  ...props
}: SkeletonProps) {
  const variantStyles = {
    rectangular: "rounded-xl",
    circular: "rounded-full",
    text: "rounded-md h-4 w-3/4",
  };

  return (
    <div
      className={cn(
        "animate-shimmer bg-slate-800",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="fintech-card p-5 space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-28" />
        <Skeleton variant="circular" className="w-8 h-8" />
      </div>
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
