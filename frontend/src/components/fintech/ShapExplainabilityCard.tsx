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
    <Card className="p-6 bg-slate-900/90 border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 mb-5 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base text-slate-100">Model Explainability</CardTitle>
              <Badge variant="blue" size="sm">SHAP Architecture Ready</Badge>
            </div>
            <p className="text-xs text-slate-400">
              Feature attribution & predictive impact indicators (XGBoost TreeExplainer framework)
            </p>
          </div>
        </div>

        <Tooltip content="SHAP (SHapley Additive exPlanations) values quantify how each financial feature moves the prediction relative to the baseline score.">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer">
            <Info className="w-3.5 h-3.5" />
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
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-[200px]">
                <div
                  className={cn(
                    "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
                    isPositive ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                  )}
                >
                  {isPositive ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <span className="font-semibold text-slate-200 block">{item.displayName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Input: {item.featureValue}</span>
                </div>
              </div>

              {/* Relative Impact Bar */}
              <div className="flex-1 max-w-xs mx-0 sm:mx-4 flex items-center gap-2">
                <span className="text-[10px] text-slate-400 w-12 text-right">
                  {isPositive ? "Reduces Risk" : "Increases Risk"}
                </span>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      isPositive ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                    )}
                    style={{ width: `${barWidthPct}%` }}
                  />
                </div>
              </div>

              {/* Numeric Weight */}
              <div className="text-right shrink-0">
                <span
                  className={cn(
                    "font-mono font-bold text-xs px-2 py-0.5 rounded-md border",
                    isPositive
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  )}
                >
                  {item.impactValue > 0 ? `+${item.impactValue.toFixed(2)}` : item.impactValue.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Framework: TreeSHAP Kernel v0.45</span>
        <span className="text-blue-400/80 font-medium">Phase 1 Architecture Container</span>
      </div>
    </Card>
  );
}
