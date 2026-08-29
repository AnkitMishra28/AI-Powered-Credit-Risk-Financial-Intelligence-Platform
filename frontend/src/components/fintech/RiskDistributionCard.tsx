import React from "react";
import { Card } from "@/components/ui/Card";
import { RiskAnalysisData } from "@/types";
import { ShieldCheck, Cpu } from "lucide-react";

export interface RiskDistributionCardProps {
  riskData: RiskAnalysisData;
}

export function RiskDistributionCard({ riskData }: RiskDistributionCardProps) {
  const { riskCategory, confidencePercentage, probabilityDistribution } = riskData;

  const lowPct = Math.round(probabilityDistribution.lowRisk * 100);
  const medPct = Math.round(probabilityDistribution.mediumRisk * 100);
  const highPct = Math.round(probabilityDistribution.highRisk * 100);

  return (
    <Card className="p-6 fintech-gradient-emerald">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-emerald-500/20 gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Predicted Risk Rating</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">XGB-v1.2</span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {riskCategory}
              </h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2">
          <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Model Confidence</p>
            <p className="text-sm font-bold text-slate-100 font-mono">{confidencePercentage}%</p>
          </div>
        </div>
      </div>

      {/* Probability Distribution Stacked Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Probability Distribution</span>
          <span className="text-slate-400 text-[11px]">Multi-class classification</span>
        </div>

        {/* Stacked Bar */}
        <div className="h-4 w-full bg-slate-800 rounded-xl overflow-hidden flex p-0.5 gap-0.5 shadow-inner">
          <div
            className="h-full bg-emerald-500 rounded-l-lg transition-all duration-700 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
            style={{ width: `${lowPct}%` }}
            title={`Low Risk: ${lowPct}%`}
          />
          <div
            className="h-full bg-amber-500 transition-all duration-700 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
            style={{ width: `${medPct}%` }}
            title={`Medium Risk: ${medPct}%`}
          />
          <div
            className="h-full bg-rose-500 rounded-r-lg transition-all duration-700 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
            style={{ width: `${highPct}%` }}
            title={`High Risk: ${highPct}%`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
          <div className="bg-slate-900/80 p-2 rounded-xl border border-emerald-500/30">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Low Risk</span>
            <span className="text-base font-bold text-emerald-400 font-mono">{lowPct}%</span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-xl border border-amber-500/30">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Medium Risk</span>
            <span className="text-base font-bold text-amber-400 font-mono">{medPct}%</span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-xl border border-rose-500/30">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">High Risk</span>
            <span className="text-base font-bold text-rose-400 font-mono">{highPct}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
