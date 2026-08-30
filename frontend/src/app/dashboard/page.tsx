"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/fintech/MetricCard";
import { ScoreCard } from "@/components/fintech/ScoreCard";
import { RiskDistributionCard } from "@/components/fintech/RiskDistributionCard";
import { SpendingCategoryDonut } from "@/components/fintech/SpendingCategoryDonut";
import { AnomalyCard } from "@/components/fintech/AnomalyCard";
import { TransactionTable } from "@/components/fintech/TransactionTable";
import { EducationalDisclaimer } from "@/components/fintech/EducationalDisclaimer";
import { useAuth } from "@/context/AuthContext";
import { useCreditLens } from "@/context/CreditLensContext";
import { formatINR } from "@/lib/utils";
import {
  Activity,
  ShieldCheck,
  Percent,
  Wallet,
  ArrowRight,
  Bot,
  UploadCloud
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function DashboardPage() {
  const { user } = useAuth();
  const { creditHealth, riskAnalysis, spending } = useCreditLens();

  return (
    <AppLayout>
      {/* Top Greeting and Header */}
      <PageHeader
        title={`Good morning, ${user?.fullName?.split(" ")[0] || "Alex"}`}
        subtitle="Here is what CreditLens sees across your credit lines, cashflow velocity, and algorithmic risk signals."
        badge={
          <Badge variant="emerald" size="sm" showDot>
            Live Financial Intelligence
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <Link href="/statements">
              <Button size="sm" variant="outline" className="text-xs font-bold border-white/[0.1] bg-[#0E1510] text-neutral-200 hover:text-white hover:border-emerald-500/30" leftIcon={<UploadCloud className="w-4 h-4 text-emerald-400" />}>
                Upload Statement
              </Button>
            </Link>
            <Link href="/copilot">
              <Button size="sm" variant="emerald" className="text-xs font-bold shadow-md shadow-emerald-950/60" leftIcon={<Bot className="w-4 h-4" />}>
                Ask CreditLens
              </Button>
            </Link>
          </div>
        }
      />

      {/* 4 Primary Fintech Intelligence KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* KPI 1: Credit Health */}
        <MetricCard
          title="Credit Health"
          value={`${creditHealth.healthScore} / 1000`}
          statusBadge={creditHealth.scoreTier}
          statusVariant="emerald"
          deltaText={`+${creditHealth.scoreDelta} pts this month`}
          deltaType="positive"
          subtitle="Optimal Corridor"
          icon={<Activity className="w-4 h-4 text-emerald-400" />}
          tooltipText="Proprietary CreditLens financial diagnostic score computed from payment patterns and credit line utilization."
          highlightColor="emerald"
        />

        {/* KPI 2: Risk Level */}
        <MetricCard
          title="Credit Risk Signal"
          value={riskAnalysis.riskCategory}
          statusBadge={`${riskAnalysis.confidencePercentage}% Conf.`}
          statusVariant="emerald"
          deltaText={`${Math.round(riskAnalysis.probabilityDistribution.lowRisk <= 1 ? riskAnalysis.probabilityDistribution.lowRisk * 100 : riskAnalysis.probabilityDistribution.lowRisk)}% Low Risk Prob`}
          deltaType="positive"
          subtitle="Low Default Probability"
          icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
          tooltipText="Machine learning multi-class risk classification based on verified cashflow and debt ratios."
          highlightColor="emerald"
        />

        {/* KPI 3: Credit Utilization */}
        <MetricCard
          title="Revolving Utilization"
          value="68.0%"
          statusBadge="Action Needed"
          statusVariant="amber"
          deltaText="↓ 7% vs last cycle"
          deltaType="positive"
          subtitle="Target <30% (₹75k)"
          icon={<Percent className="w-4 h-4 text-amber-400" />}
          tooltipText="Total revolving credit card balance against aggregate ₹2,50,000 credit limit."
          highlightColor="amber"
        />

        {/* KPI 4: Monthly Spending */}
        <MetricCard
          title="Monthly Outflow"
          value={formatINR(spending.totalSpendingCurrentMonth)}
          statusBadge="-4.2% MoM"
          statusVariant="emerald"
          deltaText="Controlled Run-rate"
          deltaType="positive"
          subtitle={`6-mo Avg: ${formatINR(spending.averageMonthlySpend)}`}
          icon={<Wallet className="w-4 h-4 text-emerald-400" />}
          tooltipText="Total recorded transactions across registered accounts during this billing cycle."
          highlightColor="emerald"
        />
      </div>

      {/* Main Analytics Grid: Credit Health Gauge & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left 5 Cols: Score Card as the Primary Visual Anchor */}
        <div className="lg:col-span-5 flex flex-col">
          <ScoreCard creditHealth={creditHealth} />
        </div>

        {/* Right 7 Cols: Risk Distribution & Analytical Explainability */}
        <div className="lg:col-span-7 flex flex-col">
          <RiskDistributionCard riskData={riskAnalysis} />
        </div>
      </div>

      {/* Spending Breakdown & AI Copilot Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Spending Category Allocation Donut/Bar */}
        <div className="lg:col-span-6">
          <SpendingCategoryDonut
            categories={spending.categories}
            totalSpending={spending.totalSpendingCurrentMonth}
          />
        </div>

        {/* AI Grounded Insights & Copilot Prompt Cards */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          {/* Anomaly Card */}
          {spending.anomalies.length > 0 && (
            <AnomalyCard anomaly={spending.anomalies[0]} />
          )}

          {/* Quick Ask CreditLens Copilot Intelligence Card */}
          <Card className="p-5 md:p-6 bg-[#0B110D] border-emerald-500/25">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/25">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-white">Ask CreditLens Intelligence</CardTitle>
                  <p className="text-xs text-neutral-400">Grounded in your financial metrics & RBI guidelines</p>
                </div>
              </div>
              <Badge variant="emerald" size="sm">RAG Assistant</Badge>
            </div>

            <p className="text-xs text-neutral-300 mb-3.5 leading-relaxed">
              Have questions about your 68% utilization ratio, minimum payment implications, or recent dining anomalies?
            </p>

            <div className="space-y-2.5">
              <Link href="/copilot" className="block">
                <div className="p-3 rounded-xl bg-[#0E1510] border border-white/[0.08] hover:border-emerald-500/40 text-xs text-neutral-200 flex items-center justify-between group transition-colors">
                  <span>&ldquo;What happens if I only pay the minimum amount due on my credit card?&rdquo;</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                </div>
              </Link>

              <Link href="/copilot" className="block">
                <div className="p-3 rounded-xl bg-[#0E1510] border border-white/[0.08] hover:border-emerald-500/40 text-xs text-neutral-200 flex items-center justify-between group transition-colors">
                  <span>&ldquo;How fast will my credit health score improve if I reduce utilization to 30%?&rdquo;</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Transactions Ledger */}
      <div className="mb-8">
        <TransactionTable
          transactions={spending.recentTransactions}
          title="Recent Account Transactions"
          limit={5}
        />
      </div>

      {/* Educational & Compliance Disclaimer */}
      <EducationalDisclaimer />
    </AppLayout>
  );
}
