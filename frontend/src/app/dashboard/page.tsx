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
import { EmptyState } from "@/components/ui/EmptyState";
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
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

function isReady(status: string) {
  return status === "ok" || status === "demo";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    creditHealth: creditHealthState,
    riskAnalysis: riskState,
    spending: spendingState,
    hasAnyFinancialData,
    isLoading,
  } = useCreditLens();

  const creditHealth = isReady(creditHealthState.status) ? creditHealthState.data : null;
  const riskAnalysis = isReady(riskState.status) ? riskState.data : null;
  const spending = isReady(spendingState.status) ? spendingState.data : null;

  const utilizationFactor = creditHealth?.factors?.find((f) => /utili[sz]ation/i.test(f.name));

  return (
    <AppLayout>
      <PageHeader
        title={`Good morning, ${user?.fullName?.split(" ")[0] || "there"}`}
        subtitle="Here is what CreditLens sees across your credit lines, cashflow velocity, and algorithmic risk signals."
        badge={
          <Badge variant={hasAnyFinancialData ? "emerald" : "slate"} size="sm" showDot={hasAnyFinancialData}>
            {hasAnyFinancialData ? "Live Financial Intelligence" : "Not analyzed yet"}
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

      {/* First-run / no-data guidance */}
      {!isLoading && !hasAnyFinancialData && (
        <div className="mb-8">
          <EmptyState
            icon={<UploadCloud className="w-7 h-7" />}
            title="Let's analyze your finances"
            description="You haven't added any financial data yet. Upload a bank statement to unlock spending analytics, then complete your credit profile to calculate your CreditLens Health Score and risk assessment. Nothing shown here is real until you do — no demo figures are mixed into your account."
            actionLabel="Upload a Bank Statement"
            actionHref="/statements"
          />
        </div>
      )}

      {/* 4 Primary Fintech Intelligence KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Credit Health"
          value={creditHealth ? `${creditHealth.healthScore} / 1000` : "—"}
          statusBadge={creditHealth ? creditHealth.scoreTier : "Not calculated"}
          statusVariant={creditHealth ? "emerald" : "slate"}
          deltaText={creditHealth ? `${creditHealth.scoreDelta >= 0 ? "+" : ""}${creditHealth.scoreDelta} pts this period` : undefined}
          deltaType={creditHealth && creditHealth.scoreDelta >= 0 ? "positive" : "negative"}
          subtitle={creditHealth ? "CreditLens diagnostic" : "Complete your credit profile"}
          icon={<Activity className="w-4 h-4 text-emerald-400" />}
          tooltipText="Proprietary CreditLens diagnostic score. Requires your credit profile inputs — it is not derived from a bank statement alone."
          highlightColor="emerald"
        />

        <MetricCard
          title="Credit Risk Signal"
          value={riskAnalysis ? riskAnalysis.riskCategory : "—"}
          statusBadge={riskAnalysis ? `${riskAnalysis.confidencePercentage}% Conf.` : "Pending"}
          statusVariant={riskAnalysis ? "emerald" : "slate"}
          deltaText={
            riskAnalysis
              ? `${Math.round(riskAnalysis.probabilityDistribution.lowRisk <= 1 ? riskAnalysis.probabilityDistribution.lowRisk * 100 : riskAnalysis.probabilityDistribution.lowRisk)}% Low Risk Prob`
              : undefined
          }
          deltaType="positive"
          subtitle={riskAnalysis ? "Educational ML model" : "Submit your credit profile"}
          icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
          tooltipText="Educational multi-class risk model trained on the public German Credit benchmark. Not a bureau or underwriting decision."
          highlightColor="emerald"
        />

        <MetricCard
          title="Revolving Utilization"
          value={utilizationFactor ? `${Math.round(utilizationFactor.score)}/100` : "—"}
          statusBadge={utilizationFactor ? utilizationFactor.status : "No data"}
          statusVariant={utilizationFactor ? "amber" : "slate"}
          subtitle={utilizationFactor ? "Utilization factor score" : "From your credit profile"}
          icon={<Percent className="w-4 h-4 text-amber-400" />}
          tooltipText="Revolving-credit utilization factor from your CreditLens Health Score calculation."
          highlightColor="amber"
        />

        <MetricCard
          title="Monthly Outflow"
          value={spending ? formatINR(spending.totalSpendingCurrentMonth) : "—"}
          statusBadge={spending ? `${spending.spendingDeltaPct > 0 ? "+" : ""}${spending.spendingDeltaPct}% MoM` : "No data"}
          statusVariant={spending ? "emerald" : "slate"}
          deltaText={spending ? "From your transactions" : undefined}
          deltaType="positive"
          subtitle={spending ? `6-mo Avg: ${formatINR(spending.averageMonthlySpend)}` : "Upload a statement"}
          icon={<Wallet className="w-4 h-4 text-emerald-400" />}
          tooltipText="Total recorded debit outflows for the current cycle, computed from your uploaded transactions."
          highlightColor="emerald"
        />
      </div>

      {/* Main Analytics Grid: Credit Health Gauge & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-5 flex flex-col">
          {creditHealth ? (
            <ScoreCard creditHealth={creditHealth} />
          ) : (
            <EmptyState
              icon={<Activity className="w-7 h-7" />}
              title="Credit Health not calculated"
              description="Complete your credit profile to generate your CreditLens Health Score and factor breakdown."
              actionLabel="Open Credit Health"
              actionHref="/credit-health"
            />
          )}
        </div>

        <div className="lg:col-span-7 flex flex-col">
          {riskAnalysis ? (
            <RiskDistributionCard riskData={riskAnalysis} />
          ) : (
            <EmptyState
              icon={<ShieldCheck className="w-7 h-7" />}
              title="Risk assessment pending"
              description="Submit your applicant credit profile to generate a personalized, explainable risk assessment."
              actionLabel="Open Risk Analysis"
              actionHref="/risk-analysis"
            />
          )}
        </div>
      </div>

      {/* Spending Breakdown & AI Copilot Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-6">
          {spending && spending.categories.length > 0 ? (
            <SpendingCategoryDonut
              categories={spending.categories}
              totalSpending={spending.totalSpendingCurrentMonth}
            />
          ) : (
            <EmptyState
              icon={<Wallet className="w-7 h-7" />}
              title="No spending data yet"
              description="Upload a bank statement to see your category allocations, anomalies and recurring payments."
              actionLabel="Upload a Statement"
              actionHref="/statements"
            />
          )}
        </div>

        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          {spending && spending.anomalies.length > 0 && (
            <AnomalyCard anomaly={spending.anomalies[0]} />
          )}

          <Card className="p-5 md:p-6 bg-[#0B110D] border-emerald-500/25">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/25">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-white">Ask CreditLens Intelligence</CardTitle>
                  <p className="text-xs text-neutral-400">Grounded in RBI Master Directions & your own analyzed data</p>
                </div>
              </div>
              <Badge variant="emerald" size="sm">RAG Assistant</Badge>
            </div>

            <p className="text-xs text-neutral-300 mb-3.5 leading-relaxed">
              Ask about credit-card regulations, minimum-payment implications, utilization mechanics, or — once you have analyzed your data — your own metrics.
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
                  <span>&ldquo;How is revolving credit utilization calculated and why does it matter?&rdquo;</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Transactions Ledger */}
      {spending && spending.recentTransactions.length > 0 && (
        <div className="mb-8">
          <TransactionTable
            transactions={spending.recentTransactions}
            title="Recent Account Transactions"
            limit={5}
          />
        </div>
      )}

      <EducationalDisclaimer />
    </AppLayout>
  );
}
