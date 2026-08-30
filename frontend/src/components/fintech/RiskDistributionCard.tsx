import React from "react";
import { Card } from "@/components/ui/Card";
import { RiskAnalysisData } from "@/types";
import { ShieldCheck, Cpu, CheckCircle2, AlertTriangle } from "lucide-react";

export interface RiskDistributionCardProps {
  riskData: RiskAnalysisData;
}

export function RiskDistributionCard({ riskData }: RiskDistributionCardProps) {
  const {
    riskCategory,
    confidencePercentage,
    probabilityDistribution,
    topPositiveFactors,
    riskFactors
  } = riskData;

  const lowVal = probabilityDistribution.lowRisk;
  const medVal = probabilityDistribution.mediumRisk;
  const highVal = probabilityDistribution.highRisk;

  const lowPct = Math.round(lowVal <= 1 ? lowVal * 100 : lowVal);
  const medPct = Math.round(medVal <= 1 ? medVal * 100 : medVal);
  const highPct = Math.round(highVal <= 1 ? highVal * 100 : highVal);

  const positiveList = topPositiveFactors || [];
  const watchList = riskFactors || [];

  return (
    <Card className="p-6 fintech-card bg-[#0B110D] border-white/10 flex flex-col justify-between h-full">
      <div>
        {/* Top Classification Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/25">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-neutral-400">Risk Intelligence Signal</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#101712] text-neutral-400 border border-white/10 font-mono">XGB-v1.2</span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <h2 className="text-2xl md:text-3xl font-black text-emerald-400 tracking-tight">
                  {riskCategory}
                </h2>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-[#101712] border border-white/10 rounded-xl px-3.5 py-2">
            <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div>
              <p className="text-xs text-neutral-400 uppercase font-semibold">Model Confidence</p>
              <p className="text-sm font-bold text-white font-mono">{confidencePercentage}%</p>
            </div>
          </div>
        </div>

        {/* Probability Distribution Multi-Class Bar */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-200">Probability Distribution</span>
            <span className="text-neutral-400 text-xs font-mono">Multi-class classification</span>
          </div>

          {/* Stacked Bar */}
          <div className="h-4 w-full bg-[#121A14] rounded-xl overflow-hidden flex p-0.5 gap-1 border border-white/5">
            <div
              className="h-full bg-emerald-500 rounded-l-md transition-all duration-700 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
              style={{ width: `${lowPct}%` }}
              title={`Low Risk: ${lowPct}%`}
            />
            <div
              className="h-full bg-amber-400 transition-all duration-700 shadow-[0_0_8px_rgba(251,191,36,0.4)]"
              style={{ width: `${medPct}%` }}
              title={`Medium Risk: ${medPct}%`}
            />
            <div
              className="h-full bg-rose-500 rounded-r-md transition-all duration-700 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
              style={{ width: `${highPct}%` }}
              title={`High Risk: ${highPct}%`}
            />
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-2.5 pt-1 text-center text-xs">
            <div className="bg-[#101712] p-2.5 rounded-xl border border-emerald-500/25">
              <span className="text-xs text-neutral-400 uppercase font-semibold block">Low Risk</span>
              <span className="text-base font-bold text-emerald-400 font-mono">{lowPct}%</span>
            </div>
            <div className="bg-[#101712] p-2.5 rounded-xl border border-amber-500/25">
              <span className="text-xs text-neutral-400 uppercase font-semibold block">Medium Risk</span>
              <span className="text-base font-bold text-amber-300 font-mono">{medPct}%</span>
            </div>
            <div className="bg-[#101712] p-2.5 rounded-xl border border-rose-500/25">
              <span className="text-xs text-neutral-400 uppercase font-semibold block">High Risk</span>
              <span className="text-base font-bold text-rose-400 font-mono">{highPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Semantic Key Signals (Positive vs Watch Signals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/[0.08] text-xs">
        <div className="space-y-1.5">
          <span className="font-bold text-neutral-300 uppercase tracking-wider text-xs block">
            Positive Signals
          </span>
          <div className="space-y-1">
            {positiveList.slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-neutral-300 leading-snug">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="font-bold text-neutral-300 uppercase tracking-wider text-xs block">
            Watch Signals
          </span>
          <div className="space-y-1">
            {watchList.slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-neutral-300 leading-snug">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
