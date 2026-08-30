import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "subtle" | "glow-emerald" | "glow-amber" | "glow-rose";
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
    default: "fintech-card bg-[#0B110D]",
    elevated: "bg-[#101712] border border-white/10 shadow-2xl rounded-2xl",
    subtle: "bg-[#080D09]/90 border border-white/5 rounded-2xl",
    "glow-emerald": "fintech-card fintech-gradient-emerald",
    "glow-amber": "fintech-card fintech-gradient-amber",
    "glow-rose": "fintech-card fintech-gradient-rose",
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
    <div className={cn("flex items-center justify-between pb-4 border-b border-white/[0.07] mb-4", className)} {...props}>
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
    <h3 className={cn("text-base md:text-lg font-bold text-white tracking-tight", className)} {...props}>
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
    <p className={cn("text-xs md:text-sm text-neutral-400 mt-1 leading-relaxed", className)} {...props}>
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
    <div className={cn("pt-4 border-t border-white/[0.07] mt-4 flex items-center justify-between", className)} {...props}>
      {children}
    </div>
  );
}
