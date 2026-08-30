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
    <Card className="fintech-gradient-amber p-5 md:p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-300 flex items-center justify-center border border-amber-500/25">
              {isFood ? <UtensilsCrossed className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-amber-300">
                Pattern Anomaly Signal
              </span>
              <CardTitle className="text-sm font-bold text-white mt-0.5">{anomaly.title}</CardTitle>
            </div>
          </div>

          <Badge variant="amber" size="sm">
            +{anomaly.percentageAboveAverage}% Spike
          </Badge>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed mb-4">
          {anomaly.description}
        </p>
      </div>

      <div className="bg-[#080D09]/85 rounded-xl p-3.5 border border-amber-500/20 flex items-center justify-between text-xs">
        <div>
          <span className="text-xs text-neutral-400 block">3-Month Baseline</span>
          <span className="font-mono text-neutral-200 font-bold text-sm">{formatINR(anomaly.historicalAverage)}</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-neutral-400 block">Actual Spend</span>
          <span className="font-mono text-amber-300 font-bold text-sm">{formatINR(anomaly.currentAmount)}</span>
        </div>
      </div>
    </Card>
  );
}
