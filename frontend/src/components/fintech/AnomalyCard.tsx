import React from "react";
import { SpendingAnomaly } from "@/types";
import { formatINR } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, UtensilsCrossed } from "lucide-react";

export interface AnomalyCardProps {
  anomaly: SpendingAnomaly;
}

export function AnomalyCard({ anomaly }: AnomalyCardProps) {
  const isFood = anomaly.category.toLowerCase().includes("food") || anomaly.category.toLowerCase().includes("dining");

  return (
    <Card className="fintech-gradient-amber p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              {isFood ? <UtensilsCrossed className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400">
                Pattern Anomaly
              </span>
              <CardTitle className="text-sm text-slate-100">{anomaly.title}</CardTitle>
            </div>
          </div>

          <Badge variant="amber" size="sm">
            +{anomaly.percentageAboveAverage}% Spike
          </Badge>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          {anomaly.description}
        </p>
      </div>

      <div className="bg-slate-900/90 rounded-xl p-3 border border-amber-500/20 flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] text-slate-500 block">3-Month Baseline</span>
          <span className="font-mono text-slate-300 font-semibold">{formatINR(anomaly.historicalAverage)}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 block">Actual Spend</span>
          <span className="font-mono text-amber-400 font-bold">{formatINR(anomaly.currentAmount)}</span>
        </div>
      </div>
    </Card>
  );
}
