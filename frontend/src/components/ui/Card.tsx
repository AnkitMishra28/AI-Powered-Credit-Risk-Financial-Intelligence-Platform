import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "subtle" | "glow-blue" | "glow-emerald" | "glow-amber";
  hoverable?: boolean;
}

export function Card({
  className,
  variant = "default",
  hoverable = false,
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    default: "fintech-card bg-slate-900/90",
    subtle: "bg-slate-900/50 border border-slate-800/80 rounded-2xl",
    "glow-blue": "fintech-card fintech-gradient-blue",
    "glow-emerald": "fintech-card fintech-gradient-emerald",
    "glow-amber": "fintech-card fintech-gradient-amber",
  };

  return (
    <div
      className={cn(
        "p-5 md:p-6 transition-all duration-200",
        variantStyles[variant],
        hoverable && "fintech-card-hover cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between pb-4 border-b border-slate-800/60 mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base md:text-lg font-semibold text-slate-100 tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs md:text-sm text-slate-400 mt-1", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pt-4 border-t border-slate-800/60 mt-4 flex items-center justify-between", className)} {...props}>
      {children}
    </div>
  );
}
