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
  Bot
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
        title={`Welcome back, ${user?.fullName?.split(" ")[0] || "Alex"}`}
        subtitle="Your real-time financial intelligence snapshot and credit risk diagnostics."
        badge={
          <Badge variant="blue" size="sm">
            Phase 1 Portfolio Build
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link href="/copilot">
              <Button size="sm" variant="primary" className="bg-purple-600 hover:bg-purple-500 border-purple-500/30 text-xs" leftIcon={<Bot className="w-3.5 h-3.5" />}>
                Ask CreditLens
              </Button>
            </Link>
          </div>
        }
      />

      {/* 4 Primary Fintech KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* KPI 1: Credit Health */}
        <MetricCard
          title="Credit Health"
          value={`${creditHealth.healthScore} / 1000`}
          statusBadge={creditHealth.scoreTier}
          statusVariant="emerald"
          deltaText={`+${creditHealth.scoreDelta} pts`}
          deltaType="positive"
          subtitle="Healthy Corridor"
          icon={<Activity className="w-4 h-4 text-emerald-400" />}
          tooltipText="Proprietary CreditLens financial diagnostic score based on repayment patterns and utilization."
          highlightColor="emerald"
        />

        {/* KPI 2: Risk Level */}
        <MetricCard
          title="Credit Risk Level"
          value={riskAnalysis.riskCategory}
          statusBadge={`${riskAnalysis.confidencePercentage}% Conf.`}
          statusVariant="blue"
          deltaText="Stable Tier"
          deltaType="positive"
          subtitle="Low Default Probability"
          icon={<ShieldCheck className="w-4 h-4 text-blue-400" />}
          tooltipText="Machine learning multi-class risk classification based on verified cashflow and debt ratios."
          highlightColor="blue"
        />

        {/* KPI 3: Credit Utilization */}
        <MetricCard
          title="Credit Utilization"
          value="68.0%"
          statusBadge="Action Needed"
          statusVariant="amber"
          deltaText="↓ 7% vs last month"
          deltaType="positive"
          subtitle="Target <30% (₹75k)"
          icon={<Percent className="w-4 h-4 text-amber-400" />}
          tooltipText="Total revolving credit balance against your aggregate ₹2,50,000 credit limit."
          highlightColor="amber"
        />

        {/* KPI 4: Monthly Spending */}
        <MetricCard
          title="Monthly Outflow"
          value={formatINR(spending.totalSpendingCurrentMonth)}
          statusBadge="-4.2% MoM"
          statusVariant="emerald"
          deltaText="Within Budget"
          deltaType="positive"
          subtitle={`Avg: ${formatINR(spending.averageMonthlySpend)}`}
          icon={<Wallet className="w-4 h-4 text-purple-400" />}
          tooltipText="Total transactions recorded across all registered accounts this billing cycle."
        />
      </div>

      {/* Main Analytics Grid: Credit Health Gauge & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left 5 Cols: Score Card */}
        <div className="lg:col-span-5 flex flex-col">
          <ScoreCard creditHealth={creditHealth} />
        </div>

        {/* Right 7 Cols: Risk Distribution & Explainability */}
        <div className="lg:col-span-7 flex flex-col">
          <RiskDistributionCard riskData={riskAnalysis} />
        </div>
      </div>

      {/* Spending Breakdown & AI Fact Insights Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Spending Category Allocation Donut/Bar */}
        <div className="lg:col-span-6">
          <SpendingCategoryDonut
            categories={spending.categories}
            totalSpending={spending.totalSpendingCurrentMonth}
          />
        </div>

        {/* AI Grounded Insights & Copilot Teaser */}
        <div className="lg:col-span-6 space-y-4">
          {/* Anomaly card */}
          {spending.anomalies.length > 0 && (
            <AnomalyCard anomaly={spending.anomalies[0]} />
          )}

          {/* Quick Ask CreditLens Widget */}
          <Card className="p-5 bg-slate-900/90 border-purple-500/20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <CardTitle className="text-sm text-slate-100">Ask CreditLens Intelligence</CardTitle>
              </div>
              <Badge variant="violet" size="sm">RAG Assistant</Badge>
            </div>

            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Have questions about how your 68% utilization or 31% dining surge affects your credit score?
            </p>

            <div className="space-y-2">
              <Link href="/copilot" className="block">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/40 text-xs text-slate-300 flex items-center justify-between group transition-colors">
                  <span>&ldquo;What happens if I only pay the minimum amount on my credit card?&rdquo;</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>
              </Link>

              <Link href="/copilot" className="block">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/40 text-xs text-slate-300 flex items-center justify-between group transition-colors">
                  <span>&ldquo;How fast will my credit health improve if I reduce utilization to 30%?&rdquo;</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Transactions Ledger */}
      <div className="mb-6">
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
