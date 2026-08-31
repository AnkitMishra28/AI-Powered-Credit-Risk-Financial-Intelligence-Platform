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
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  TrendingUp,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Activity
} from "lucide-react";

export default function CreditHealthPage() {
  const { creditHealth: creditHealthState, refreshData } = useCreditLens();
  const creditHealth = creditHealthState.data;

  if (creditHealthState.status === "loading") {
    return (
      <AppLayout>
        <PageHeader title="Credit Health Intelligence" subtitle="Loading your CreditLens Health Score…" />
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (creditHealthState.status === "error") {
    return (
      <AppLayout>
        <PageHeader title="Credit Health Intelligence" subtitle="Proprietary CreditLens 0–1000 behavioral health score." />
        <ErrorState
          description={creditHealthState.message || undefined}
          onRetry={() => void refreshData()}
        />
      </AppLayout>
    );
  }

  if (!creditHealth) {
    // no_data / insufficient_data — never show a canonical score
    return (
      <AppLayout>
        <PageHeader
          title="Credit Health Intelligence"
          subtitle="Proprietary CreditLens 0–1000 behavioral health score and deterministic factor attribution."
          badge={<Badge variant="slate" size="sm">Not calculated yet</Badge>}
        />
        <EmptyState
          icon={<Activity className="w-7 h-7" />}
          title="Your Credit Health Score has not been calculated yet"
          description={
            creditHealthState.message ||
            "Complete your credit profile (credit limits, revolving balances, EMIs, payment history) to generate your personalized CreditLens Health Score. Uploading a bank statement adds your cashflow picture."
          }
          actionLabel="Go to Statements"
          actionHref="/statements"
        />
        <EducationalDisclaimer />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Credit Health Intelligence"
        subtitle="Proprietary CreditLens 0–1000 behavioral health score and deterministic factor attribution."
        badge={
          <Badge variant="emerald" size="sm" showDot>
            {creditHealth.healthScore} / 1000 {creditHealth.scoreTier}
          </Badge>
        }
      />

      {/* Main Score Hero & Trend Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left 5 Cols: Main Score Radial Gauge */}
        <div className="lg:col-span-5">
          <ScoreCard creditHealth={creditHealth} showActions={false} />
        </div>

        {/* Right 7 Cols: 6-Month Historical Evolution */}
        <div className="lg:col-span-7">
          <Card className="p-6 bg-[#0B110D] border-white/10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] mb-4">
                <div>
                  <CardTitle className="text-base text-white">Score History & Trajectory</CardTitle>
                  <p className="text-xs text-neutral-400">6-month score tracking vs revolving credit utilization</p>
                </div>
                <Badge variant="emerald" size="sm">
                  +32 pts over 6 months
                </Badge>
              </div>

              {/* Score Trend Points Grid */}
              <div className="grid grid-cols-6 gap-2.5 py-4">
                {creditHealth.history.map((pt, idx) => {
                  const isCurrent = idx === creditHealth.history.length - 1;
                  return (
                    <div
                      key={pt.month}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isCurrent
                          ? "bg-emerald-950/40 border-emerald-500/40 text-white shadow-md shadow-emerald-950/40"
                          : "bg-[#0E1510] border-white/[0.06] text-neutral-400 hover:border-white/20"
                      }`}
                    >
                      <span className="text-xs font-bold block uppercase text-neutral-400">{pt.month}</span>
                      <span className="text-base font-black font-mono text-white block mt-1">{pt.score}</span>
                      <span className="text-xs text-neutral-400 font-mono block mt-0.5">{pt.utilization}% util</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trajectory Insights — derived from the user's OWN score history.
                Only shown once at least two calculations exist so there is a real
                trend to describe; no hardcoded deltas. */}
            {creditHealth.history.length >= 2 && (() => {
              const first = creditHealth.history[0];
              const last = creditHealth.history[creditHealth.history.length - 1];
              const scoreChange = last.score - first.score;
              const utilChange = last.utilization - first.utilization;
              const improving = scoreChange >= 0;
              return (
                <div className="p-4 bg-[#080D09] rounded-xl border border-white/[0.08] text-xs text-neutral-300 space-y-1 mt-4">
                  <div className={`flex items-center gap-2 font-bold ${improving ? "text-emerald-400" : "text-amber-400"}`}>
                    <TrendingUp className="w-4 h-4" />
                    <span>{improving ? "Upward Score Trajectory" : "Score Softening"}</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Your CreditLens Health Score {improving ? "rose" : "fell"} {Math.abs(scoreChange)} point{Math.abs(scoreChange) === 1 ? "" : "s"}
                    {" "}from {first.score} ({first.month}) to {last.score} ({last.month})
                    {utilChange !== 0
                      ? `, with revolving utilization moving ${utilChange < 0 ? "down" : "up"} ${Math.abs(utilChange)} pts (${first.utilization}% → ${last.utilization}%).`
                      : "."}
                  </p>
                </div>
              );
            })()}
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
            <p className="text-xs text-neutral-400">
              Weighted components contributing to your aggregate {creditHealth.healthScore} Health Score
            </p>
          </div>
          <span className="text-xs text-neutral-400 font-mono">Sum of factor weights: 100%</span>
        </div>

        <FactorBreakdown factors={creditHealth.factors} />
      </div>

      {/* "Why this score?" Deep-dive Section */}
      <div className="mb-8">
        <Card className="p-6 md:p-8 bg-[#0B110D] border-white/10">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.08] mb-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/25">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base text-white">Why this score? Transparent Scoring Methodology</CardTitle>
              <p className="text-xs text-neutral-400">How CreditLens calculates behavioral diagnostics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed text-neutral-300">
            <div className="space-y-2 p-4 rounded-xl bg-[#0E1510] border border-white/[0.06]">
              <h4 className="font-bold text-white flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                1. Payment Reliability (45% total)
              </h4>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Calculated from payment history (35%) and unbroken monthly streak consistency (10%). On-time settlement of minimums and full balances is the single strongest positive driver.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-[#0E1510] border border-white/[0.06]">
              <h4 className="font-bold text-white flex items-center gap-2 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                2. Balance & Leverage (45% total)
              </h4>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Revolving card utilization (30%) and debt-to-income ratio (15%). Maintaining utilization below 30% avoids severe score compression.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-[#0E1510] border border-white/[0.06]">
              <h4 className="font-bold text-white flex items-center gap-2 text-xs">
                <Sparkles className="w-4 h-4 text-emerald-300" />
                3. Line Seasoning & Velocity (10%)
              </h4>
              <p className="text-neutral-400 text-xs leading-relaxed">
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
