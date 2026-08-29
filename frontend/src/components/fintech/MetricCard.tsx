import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  deltaText?: string;
  deltaType?: "positive" | "negative" | "neutral";
  statusBadge?: string;
  statusVariant?: "low-risk" | "medium-risk" | "high-risk" | "emerald" | "blue" | "amber" | "rose" | "slate";
  icon?: React.ReactNode;
  tooltipText?: string;
  highlightColor?: "emerald" | "blue" | "amber" | "rose";
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  deltaText,
  deltaType = "positive",
  statusBadge,
  statusVariant = "emerald",
  icon,
  tooltipText,
  highlightColor,
  className,
}: MetricCardProps) {
  const isPositiveDelta = deltaType === "positive";

  return (
    <Card
      className={cn(
        "relative overflow-hidden p-5 flex flex-col justify-between hover:border-slate-700/80 transition-all group",
        highlightColor === "emerald" && "hover:border-emerald-500/30",
        highlightColor === "blue" && "hover:border-blue-500/30",
        highlightColor === "amber" && "hover:border-amber-500/30",
        className
      )}
    >
      {/* Top row: Title + Tooltip + Icon */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400">{title}</span>
          {tooltipText && (
            <Tooltip content={tooltipText}>
              <Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-pointer" />
            </Tooltip>
          )}
        </div>

        {icon && (
          <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 group-hover:text-slate-200 transition-colors">
            {icon}
          </div>
        )}
      </div>

      {/* Center Value */}
      <div className="my-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl md:text-3xl font-black text-white tracking-tight font-mono">
            {value}
          </span>
          {statusBadge && (
            <Badge variant={statusVariant} size="sm">
              {statusBadge}
            </Badge>
          )}
        </div>
      </div>

      {/* Bottom row: Delta & Subtitle */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/40 text-xs">
        {deltaText && (
          <div
            className={cn(
              "flex items-center gap-1 font-semibold text-[11px]",
              isPositiveDelta ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {isPositiveDelta ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{deltaText}</span>
          </div>
        )}

        {subtitle && (
          <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
            {subtitle}
          </span>
        )}
      </div>
    </Card>
  );
}
