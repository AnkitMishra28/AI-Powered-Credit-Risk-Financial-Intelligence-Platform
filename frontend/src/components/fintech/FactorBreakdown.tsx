import React from "react";
import { HealthFactor } from "@/types";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FactorBreakdownProps {
  factors: HealthFactor[];
  compact?: boolean;
}

export function FactorBreakdown({ factors, compact = false }: FactorBreakdownProps) {
  const getStatusIcon = (status: HealthFactor["status"]) => {
    switch (status) {
      case "optimal":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case "good":
        return <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case "critical":
        return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
    }
  };

  const getStatusBadge = (status: HealthFactor["status"]) => {
    switch (status) {
      case "optimal":
        return <Badge variant="emerald" size="sm">Optimal</Badge>;
      case "good":
        return <Badge variant="lime" size="sm">Good</Badge>;
      case "warning":
        return <Badge variant="amber" size="sm">Action Needed</Badge>;
      case "critical":
        return <Badge variant="rose" size="sm">High Drag</Badge>;
    }
  };

  return (
    <div className={cn("grid gap-4", compact ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3")}>
      {factors.map((factor) => (
        <Card
          key={factor.factorId}
          className="p-5 md:p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all bg-[#0B110D] border-white/10"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2.5">
                {getStatusIcon(factor.status)}
                <span className="text-sm font-bold text-white tracking-tight">{factor.name}</span>
              </div>
              {getStatusBadge(factor.status)}
            </div>

            <p className="text-xs text-neutral-400 mb-3.5 leading-relaxed">
              {factor.description}
            </p>
          </div>

          <div className="space-y-2 mt-2 pt-3 border-t border-white/[0.08]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 text-xs">Factor Index</span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-white font-mono text-sm">{factor.score}%</span>
                <span className="text-xs text-neutral-500 font-mono">(Weight: {(factor.weight * 100).toFixed(0)}%)</span>
              </div>
            </div>

            <ProgressBar
              value={factor.score}
              variant={
                factor.status === "optimal"
                  ? "emerald"
                  : factor.status === "good"
                  ? "lime"
                  : factor.status === "warning"
                  ? "amber"
                  : "rose"
              }
              size="sm"
            />

            <div className="text-xs text-neutral-400 mt-2 flex items-center gap-1.5">
              <span className="font-semibold text-neutral-300">Impact:</span>
              <span className="truncate text-neutral-400">{factor.impactDetail}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
