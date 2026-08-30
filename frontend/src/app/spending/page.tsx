"use client";

import React from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/fintech/MetricCard";
import { SpendingCategoryDonut } from "@/components/fintech/SpendingCategoryDonut";
import { SpendingTrendChart } from "@/components/fintech/SpendingTrendChart";
import { AnomalyCard } from "@/components/fintech/AnomalyCard";
import { TransactionTable } from "@/components/fintech/TransactionTable";
import { RecurringPaymentsPanel } from "@/components/fintech/RecurringPaymentsPanel";
import { EducationalDisclaimer } from "@/components/fintech/EducationalDisclaimer";
import { useCreditLens } from "@/context/CreditLensContext";
import { formatINR } from "@/lib/utils";
import { CreditCard, Wallet, AlertTriangle, ArrowDownLeft, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default function SpendingPage() {
  const { spending } = useCreditLens();

  const totalIncome = spending.totalIncomeCurrentMonth ?? 65000;
  const netCashflow = spending.netCashflow ?? (totalIncome - spending.totalSpendingCurrentMonth);

  return (
    <AppLayout>
      <PageHeader
        title="Spending Intelligence & Cashflow Velocity"
        subtitle="Automated transaction categorization, cashflow velocity tracking, and behavioral anomaly detection."
        badge={
          <Badge variant="amber" size="sm" showDot>
            {spending.anomalies.length > 0 ? "Dining Anomaly Flagged" : "Controlled Velocity"}
          </Badge>
        }
        actions={
          <Link
            href="/statements"
            className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all flex items-center gap-2 shadow-sm"
          >
            <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Upload New Statement</span>
          </Link>
        }
      />

      {/* Top 4 KPI Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Current Month Spend"
          value={formatINR(spending.totalSpendingCurrentMonth)}
          statusBadge={`${spending.spendingDeltaPct > 0 ? "+" : ""}${spending.spendingDeltaPct}% MoM`}
          statusVariant={spending.spendingDeltaPct > 10 ? "amber" : "emerald"}
          deltaText={spending.spendingDeltaPct > 0 ? "Accelerated Outflows" : "Controlled Velocity"}
          deltaType={spending.spendingDeltaPct > 0 ? "negative" : "positive"}
          subtitle="Total debit outflows"
          icon={<Wallet className="w-4 h-4 text-emerald-400" />}
          highlightColor="emerald"
        />

        <MetricCard
          title="Monthly Income Inflows"
          value={formatINR(totalIncome)}
          statusBadge="Verified"
          statusVariant="emerald"
          deltaText="Steady Stream"
          deltaType="positive"
          subtitle="Net verified credits"
          icon={<ArrowDownLeft className="w-4 h-4 text-emerald-400" />}
          highlightColor="emerald"
        />

        <MetricCard
          title="Net Monthly Cashflow"
          value={formatINR(netCashflow)}
          statusBadge={netCashflow > 0 ? "Surplus" : "Deficit"}
          statusVariant={netCashflow > 0 ? "emerald" : "rose"}
          deltaText={netCashflow > 0 ? "Positive Liquidity" : "Negative Cashflow"}
          deltaType={netCashflow > 0 ? "positive" : "negative"}
          subtitle="Savings cushion buffer"
          icon={<CreditCard className="w-4 h-4 text-emerald-300" />}
          highlightColor="emerald"
        />

        <MetricCard
          title="Detected Anomalies"
          value={`${spending.anomalies.length} Flagged`}
          statusBadge="Statistical Alert"
          statusVariant={spending.anomalies.length > 0 ? "amber" : "emerald"}
          deltaText={spending.anomalies.length > 0 ? "Dining Velocity Spike" : "Within Norm"}
          deltaType={spending.anomalies.length > 0 ? "negative" : "positive"}
          subtitle="Deviation vs historical baseline"
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
          highlightColor="amber"
        />
      </div>

      {/* Detected Anomalies Showcase */}
      {spending.anomalies.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Pattern Anomalies Detected
            </h3>
            <span className="text-xs text-neutral-500 font-mono">Statistical deviation vs 3-month rolling baseline</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spending.anomalies.map((anom) => (
              <AnomalyCard key={anom.id} anomaly={anom} />
            ))}
          </div>
        </div>
      )}

      {/* Likely Recurring Subscriptions Panel */}
      {spending.recurringPayments && spending.recurringPayments.length > 0 && (
        <div className="mb-8">
          <RecurringPaymentsPanel recurringPayments={spending.recurringPayments} />
        </div>
      )}

      {/* Charts Grid: Allocations & Monthly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-6">
          <SpendingCategoryDonut
            categories={spending.categories}
            totalSpending={spending.totalSpendingCurrentMonth}
          />
        </div>

        <div className="lg:col-span-6">
          <SpendingTrendChart
            trend={spending.monthlyTrend}
            averageSpend={spending.averageMonthlySpend}
          />
        </div>
      </div>

      {/* Full Filterable Transaction Table */}
      <div className="mb-8">
        <TransactionTable
          transactions={spending.recentTransactions}
          title="Categorized Transaction Ledger"
          showFilters={true}
        />
      </div>

      {/* Educational Disclaimer */}
      <EducationalDisclaimer />
    </AppLayout>
  );
}
