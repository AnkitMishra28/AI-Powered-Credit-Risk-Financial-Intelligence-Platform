import React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/60", className)}>
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
