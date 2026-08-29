"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScoreCard } from "@/components/fintech/ScoreCard";
import { FactorBreakdown } from "@/components/fintech/FactorBreakdown";
import { EducationalDisclaimer } from "@/components/fintech/EducationalDisclaimer";
import { useCreditLens } from "@/context/CreditLensContext";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  TrendingUp,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export default function CreditHealthPage() {
  const { creditHealth } = useCreditLens();

  return (
    <AppLayout>
      <PageHeader
        title="Credit Health Intelligence"
        subtitle="Proprietary CreditLens 0–1000 behavioral health score and deterministic factor attribution."
        badge={
          <Badge variant="emerald" size="sm">
            742 / 1000 Healthy
          </Badge>
        }
      />

      {/* Main Score Hero & Trend Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left 5 Cols: Main Radial Gauge */}
        <div className="lg:col-span-5">
          <ScoreCard creditHealth={creditHealth} showActions={false} />
        </div>

        {/* Right 7 Cols: 6-Month Historical Evolution */}
        <div className="lg:col-span-7">
          <Card className="p-6 bg-slate-900/90 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div>
                  <CardTitle className="text-base text-slate-100">Score History & Trajectory</CardTitle>
                  <p className="text-xs text-slate-400">6-month score tracking vs revolving utilization</p>
                </div>
                <Badge variant="emerald" size="sm">
                  +32 pts in 6 months
                </Badge>
              </div>

              {/* Score Trend Line & History points */}
              <div className="grid grid-cols-6 gap-2 py-4">
                {creditHealth.history.map((pt, idx) => {
                  const isCurrent = idx === creditHealth.history.length - 1;
                  return (
                    <div
                      key={pt.month}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isCurrent
                          ? "bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/20"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <span className="text-[10px] font-semibold block uppercase text-slate-400">{pt.month}</span>
                      <span className="text-sm font-bold font-mono text-slate-100 block mt-1">{pt.score}</span>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{pt.utilization}% util</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trajectory Insights */}
            <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1 mt-4">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <TrendingUp className="w-4 h-4" />
                <span>Steady Score Recovery Observed</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Your score gained +18 points this cycle primarily due to reducing revolving credit balances by 7% (from 75% down to 68%).
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* 6 Deterministic Factor Breakdown Cards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Behavioral Factor Diagnostics
            </h2>
            <p className="text-xs text-slate-400">
              Weighted components contributing to your aggregate 742 Health Score
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">Sum of weights: 100%</span>
        </div>

        <FactorBreakdown factors={creditHealth.factors} />
      </div>

      {/* "Why this score?" Deep-dive Section */}
      <div className="mb-8">
        <Card className="p-6 bg-slate-900/90 border-slate-800">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base text-slate-100">Why this score? Transparent Scoring Methodology</CardTitle>
              <p className="text-xs text-slate-400">How CreditLens calculates behavioral diagnostics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed text-slate-300">
            <div className="space-y-2">
              <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                1. Payment Reliability (45% total)
              </h4>
              <p className="text-slate-400 text-[11px]">
                Calculated from payment history (35%) and unbroken monthly streak consistency (10%). On-time settlement of minimums and full balances is the single strongest driver.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                2. Balance & Leverage (45% total)
              </h4>
              <p className="text-slate-400 text-[11px]">
                Revolving card utilization (30%) and debt-to-income ratio (15%). Maintaining utilization below 30% avoids severe score compression.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-400" />
                3. Line Seasoning & Velocity (10%)
              </h4>
              <p className="text-slate-400 text-[11px]">
                Average age of open accounts (5%) and monthly cashflow volatility (5%). Seasoned credit history proves long-term repayment discipline.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Compliance & Educational Disclaimer */}
      <EducationalDisclaimer />
    </AppLayout>
  );
}
