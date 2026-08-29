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
        return <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />;
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
        return <Badge variant="blue" size="sm">Good</Badge>;
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
          className="p-5 flex flex-col justify-between hover:border-slate-700 transition-all bg-slate-900/90"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(factor.status)}
                <span className="text-sm font-bold text-slate-100">{factor.name}</span>
              </div>
              {getStatusBadge(factor.status)}
            </div>

            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              {factor.description}
            </p>
          </div>

          <div className="space-y-2 mt-2 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Factor Score</span>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-slate-100 font-mono text-sm">{factor.score}%</span>
                <span className="text-[10px] text-slate-500 font-mono">(Weight: {(factor.weight * 100).toFixed(0)}%)</span>
              </div>
            </div>

            <ProgressBar
              value={factor.score}
              variant={
                factor.status === "optimal"
                  ? "emerald"
                  : factor.status === "good"
                  ? "blue"
                  : factor.status === "warning"
                  ? "amber"
                  : "rose"
              }
              size="sm"
            />

            <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
              <span className="font-semibold text-slate-300">Impact:</span>
              <span className="truncate">{factor.impactDetail}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
