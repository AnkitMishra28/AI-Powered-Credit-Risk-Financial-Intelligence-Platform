import React from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { ShapContribution } from "@/types";
import { BrainCircuit, ArrowUp, ArrowDown, Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";

export interface ShapExplainabilityCardProps {
  contributions: ShapContribution[];
}

export function ShapExplainabilityCard({ contributions }: ShapExplainabilityCardProps) {
  return (
    <Card className="p-6 bg-[#0B110D] border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] mb-5 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/25">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base text-white">Model Explainability (SHAP)</CardTitle>
              <Badge variant="emerald" size="sm">TreeSHAP Ready</Badge>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Feature attribution & predictive impact deltas (XGBoost TreeExplainer framework)
            </p>
          </div>
        </div>

        <Tooltip content="SHAP (SHapley Additive exPlanations) values quantify how each financial feature moves the default prediction relative to the population baseline.">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-emerald-300 cursor-pointer">
            <Info className="w-4 h-4" />
            <span>How Explainability Works</span>
          </div>
        </Tooltip>
      </div>

      {/* Feature Attribution Rows */}
      <div className="space-y-3">
        {contributions.map((item) => {
          const isPositive = item.isPositive;
          const absValue = Math.abs(item.impactValue);
          const barWidthPct = Math.min(absValue * 180, 100);

          return (
            <div
              key={item.featureName}
              className="p-3.5 rounded-xl bg-[#0E1510] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-[210px]">
                <div
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border",
                    isPositive
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                  )}
                >
                  {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                </div>
                <div>
                  <span className="font-bold text-sm text-white block">{item.displayName}</span>
                  <span className="text-xs text-neutral-400 font-mono">Profile Input: {item.featureValue}</span>
                </div>
              </div>

              {/* Relative Impact Bar */}
              <div className="flex-1 max-w-xs mx-0 sm:mx-4 flex items-center gap-3">
                <span className="text-xs text-neutral-400 w-24 text-right shrink-0">
                  {isPositive ? "Reduces Risk" : "Increases Risk"}
                </span>
                <div className="flex-1 h-2.5 bg-[#121A14] rounded-full overflow-hidden border border-white/5">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      isPositive
                        ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]"
                        : "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                    )}
                    style={{ width: `${barWidthPct}%` }}
                  />
                </div>
              </div>

              {/* Numeric Weight */}
              <div className="text-right shrink-0">
                <span
                  className={cn(
                    "font-mono font-bold text-xs px-2.5 py-1 rounded-md border",
                    isPositive
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-300 border-rose-500/30"
                  )}
                >
                  {item.impactValue > 0 ? `+${item.impactValue.toFixed(2)}` : item.impactValue.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-3.5 border-t border-white/[0.08] text-xs text-neutral-400 flex items-center justify-between">
        <span>Framework: TreeSHAP Kernel v0.45</span>
        <span className="text-emerald-400 font-medium">Deterministic Feature Impact Container</span>
      </div>
    </Card>
  );
}
