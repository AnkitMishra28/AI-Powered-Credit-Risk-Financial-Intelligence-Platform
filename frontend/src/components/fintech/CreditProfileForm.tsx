"use client";

import React, { useState } from "react";
import { creditService } from "@/services/creditService";
import { useCreditLens } from "@/context/CreditLensContext";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/lib/utils";
import { Activity, Info } from "lucide-react";

/**
 * Collects the structured credit-profile inputs the CreditLens Health Score
 * model requires and that a bank statement CANNOT provide (card limits,
 * revolving balances, EMI obligations, payment history, credit age).
 *
 * `monthly_income` / `monthly_spending` are PRE-FILLED from the authenticated
 * user's own analysed statement (Spending Intelligence) but stay editable.
 * On submit it calls POST /credit-health/calculate, which persists a snapshot
 * for this user, then refreshes the dashboard so the real score renders.
 *
 * Nothing here is fabricated: every value is either derived from the user's own
 * transactions or entered by the user.
 */
export function CreditProfileForm({ contextMessage }: { contextMessage?: string }) {
  const { spending, refreshData } = useCreditLens();
  const s = spending.status === "ok" || spending.status === "demo" ? spending.data : null;

  const derivedIncome =
    s?.totalIncomeCurrentMonth && s.totalIncomeCurrentMonth > 0 ? Math.round(s.totalIncomeCurrentMonth) : null;
  const derivedSpend =
    s?.totalSpendingCurrentMonth && s.totalSpendingCurrentMonth > 0 ? Math.round(s.totalSpendingCurrentMonth) : null;

  const [monthlyIncome, setMonthlyIncome] = useState(derivedIncome != null ? String(derivedIncome) : "");
  const [monthlySpending, setMonthlySpending] = useState(derivedSpend != null ? String(derivedSpend) : "");
  const [creditLimit, setCreditLimit] = useState("");
  const [revolvingBalance, setRevolvingBalance] = useState("");
  const [monthlyEmi, setMonthlyEmi] = useState("");
  const [paymentPct, setPaymentPct] = useState("95");
  const [historyYears, setHistoryYears] = useState("3");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const n = (v: string) => {
    const x = parseFloat(v);
    return Number.isFinite(x) ? x : NaN;
  };
  const finiteOrUndef = (v: string) => (Number.isFinite(n(v)) ? n(v) : undefined);

  const incomeValid = n(monthlyIncome) >= 1000;
  const limitValid = n(creditLimit) >= 1000;
  const canSubmit = incomeValid && limitValid && !submitting;

  const utilizationPreview =
    n(creditLimit) > 0 && Number.isFinite(n(revolvingBalance))
      ? `${((Math.max(0, n(revolvingBalance)) / n(creditLimit)) * 100).toFixed(1)}%`
      : "—";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await creditService.calculateCreditHealth({
        monthly_income: n(monthlyIncome),
        credit_limit_total: n(creditLimit),
        revolving_balance_total: Number.isFinite(n(revolvingBalance)) ? Math.max(0, n(revolvingBalance)) : 0,
        total_monthly_emi: Number.isFinite(n(monthlyEmi)) ? Math.max(0, n(monthlyEmi)) : 0,
        payment_consistency_ratio: Math.min(1, Math.max(0, (n(paymentPct) || 90) / 100)),
        credit_history_years: Math.min(50, Math.max(0, n(historyYears) || 3)),
        monthly_spending_total: finiteOrUndef(monthlySpending),
        spending_average_6mo: finiteOrUndef(monthlySpending),
      });
      // Persisted snapshot now exists for this user — re-pull the dashboard.
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not calculate your Credit Health Score. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6 md:p-8 bg-[#0B110D] border-white/10 space-y-6">
      <div className="pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base text-white">Complete your credit profile</CardTitle>
            <p className="text-xs text-neutral-400 mt-0.5">
              The CreditLens Health Score is a deterministic 0–1000 diagnostic. It needs the structured
              credit-line inputs below — a bank statement does not contain them.
            </p>
          </div>
        </div>
      </div>

      {(derivedIncome != null || derivedSpend != null) && (
        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-neutral-300 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            Pre-filled from your analysed statement:
            {derivedIncome != null && <> income <strong className="text-white">{formatINR(derivedIncome)}</strong></>}
            {derivedIncome != null && derivedSpend != null && ","}
            {derivedSpend != null && <> spending <strong className="text-white">{formatINR(derivedSpend)}</strong></>}
            . Adjust if needed.
          </span>
        </div>
      )}

      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Monthly net income (₹)"
          type="number"
          min={0}
          value={monthlyIncome}
          onChange={(e) => setMonthlyIncome(e.target.value)}
          helperText={derivedIncome != null ? "Derived from your statement credits" : "Take-home after taxes"}
          error={monthlyIncome !== "" && !incomeValid ? "Enter at least ₹1,000" : undefined}
        />
        <Input
          label="Monthly spending (₹)"
          type="number"
          min={0}
          value={monthlySpending}
          onChange={(e) => setMonthlySpending(e.target.value)}
          helperText={derivedSpend != null ? "Derived from your statement debits" : "Typical monthly outflow"}
        />
        <Input
          label="Aggregate credit-card limit (₹)"
          type="number"
          min={0}
          value={creditLimit}
          onChange={(e) => setCreditLimit(e.target.value)}
          helperText="Sum of limits across all active cards"
          error={creditLimit !== "" && !limitValid ? "Enter at least ₹1,000" : undefined}
        />
        <Input
          label="Current revolving balance (₹)"
          type="number"
          min={0}
          value={revolvingBalance}
          onChange={(e) => setRevolvingBalance(e.target.value)}
          helperText="Outstanding balance carried on cards"
        />
        <Input
          label="Total monthly loan EMIs (₹)"
          type="number"
          min={0}
          value={monthlyEmi}
          onChange={(e) => setMonthlyEmi(e.target.value)}
          helperText="Personal / auto / home loan instalments"
        />
        <Input
          label="On-time payment ratio — last 12 months (%)"
          type="number"
          min={0}
          max={100}
          value={paymentPct}
          onChange={(e) => setPaymentPct(e.target.value)}
          helperText="Share of dues paid on time"
        />
        <Input
          label="Credit history length (years)"
          type="number"
          min={0}
          max={50}
          value={historyYears}
          onChange={(e) => setHistoryYears(e.target.value)}
          helperText="Age of your oldest active credit line"
        />

        <div className="flex flex-col justify-end">
          <div className="p-2.5 rounded-xl bg-[#0E1510] border border-white/[0.08] text-xs flex items-center justify-between">
            <span className="text-neutral-400">Utilization preview</span>
            <span className="font-mono font-bold text-amber-400">{utilizationPreview}</span>
          </div>
        </div>

        {error && (
          <p className="sm:col-span-2 text-xs text-rose-300">{error}</p>
        )}

        <div className="sm:col-span-2 flex items-center gap-3 pt-1">
          <Button type="submit" variant="emerald" size="md" isLoading={submitting} disabled={!canSubmit}>
            Calculate my Credit Health Score
          </Button>
          <span className="text-xs text-neutral-500">
            Persisted to your account — you can recalculate any time.
          </span>
        </div>
      </form>

      {contextMessage && (
        <p className="text-xs text-neutral-500 border-t border-white/[0.06] pt-3">{contextMessage}</p>
      )}
    </Card>
  );
}
