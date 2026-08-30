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
  statusVariant?: "low-risk" | "medium-risk" | "high-risk" | "emerald" | "lime" | "blue" | "amber" | "rose" | "slate";
  icon?: React.ReactNode;
  tooltipText?: string;
  highlightColor?: "emerald" | "lime" | "blue" | "amber" | "rose";
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
        "relative overflow-hidden p-5 md:p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all bg-[#0B110D] group",
        highlightColor === "emerald" && "hover:border-emerald-500/40 hover:bg-[#0E1510]",
        highlightColor === "amber" && "hover:border-amber-500/40",
        highlightColor === "rose" && "hover:border-rose-500/40",
        className
      )}
    >
      {/* Top row: Title + Tooltip + Icon */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">{title}</span>
          {tooltipText && (
            <Tooltip content={tooltipText}>
              <Info className="w-3.5 h-3.5 text-neutral-500 hover:text-neutral-300 cursor-pointer" />
            </Tooltip>
          )}
        </div>

        {icon && (
          <div className="w-8 h-8 rounded-xl bg-[#121A14] border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-emerald-400 transition-colors">
            {icon}
          </div>
        )}
      </div>

      {/* Center Value */}
      <div className="my-1.5">
        <div className="flex items-baseline gap-2.5 flex-wrap">
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
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.07] text-xs">
        {deltaText && (
          <div
            className={cn(
              "flex items-center gap-1 font-semibold text-xs",
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
          <span className="text-xs text-neutral-400 truncate max-w-[190px]">
            {subtitle}
          </span>
        )}
      </div>
    </Card>
  );
}
