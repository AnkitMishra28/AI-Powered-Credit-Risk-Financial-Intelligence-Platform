"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/fintech/MetricCard";
import { SpendingCategoryDonut } from "@/components/fintech/SpendingCategoryDonut";
import { SpendingTrendChart } from "@/components/fintech/SpendingTrendChart";
import { AnomalyCard } from "@/components/fintech/AnomalyCard";
import { TransactionTable } from "@/components/fintech/TransactionTable";
import { EducationalDisclaimer } from "@/components/fintech/EducationalDisclaimer";
import { useCreditLens } from "@/context/CreditLensContext";
import { formatINR } from "@/lib/utils";
import { CreditCard, Wallet, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default function SpendingPage() {
  const { spending } = useCreditLens();

  return (
    <AppLayout>
      <PageHeader
        title="Spending Intelligence & Cashflow"
        subtitle="Automated transaction categorization, velocity tracking, and behavioral anomaly detection."
        badge={
          <Badge variant="amber" size="sm" showDot>
            Dining Anomaly Flagged
          </Badge>
        }
      />

      {/* Top 3 KPI Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <MetricCard
          title="Current Month Spend"
          value={formatINR(spending.totalSpendingCurrentMonth)}
          statusBadge="-4.2% MoM"
          statusVariant="emerald"
          deltaText="Controlled Velocity"
          deltaType="positive"
          subtitle="Target: ₹50,000 / mo"
          icon={<Wallet className="w-4 h-4 text-emerald-400" />}
          highlightColor="emerald"
        />

        <MetricCard
          title="6-Month Average Outflow"
          value={formatINR(spending.averageMonthlySpend)}
          statusBadge="Baseline"
          statusVariant="blue"
          deltaText="Stable Run-rate"
          deltaType="positive"
          subtitle="Historical monthly mean"
          icon={<CreditCard className="w-4 h-4 text-blue-400" />}
          highlightColor="blue"
        />

        <MetricCard
          title="Detected Anomalies"
          value={`${spending.anomalies.length} Flagged`}
          statusBadge="Action Review"
          statusVariant="amber"
          deltaText="+31% Food & Dining"
          deltaType="negative"
          subtitle="Above 3-month average"
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
          highlightColor="amber"
        />
      </div>

      {/* Detected Anomalies Showcase */}
      {spending.anomalies.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Pattern Anomalies Detected
            </h3>
            <span className="text-xs text-slate-500 font-mono">Unusual spending rate vs baseline</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spending.anomalies.map((anom) => (
              <AnomalyCard key={anom.id} anomaly={anom} />
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid: Allocations & 6-Month Velocity */}
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
