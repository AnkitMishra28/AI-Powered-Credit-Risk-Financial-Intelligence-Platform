"use client";

import React, { useState } from "react";
import { riskService, RiskPredictParams } from "@/services/riskService";
import { useCreditLens } from "@/context/CreditLensContext";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Info } from "lucide-react";

/**
 * Structured applicant intake for the educational credit-risk model.
 *
 * The model is a calibrated XGBoost classifier trained on the public
 * (South) German Credit benchmark. It scores a fixed 20-field applicant
 * profile — a schema a bank statement does not contain — so this form collects
 * those fields explicitly. Category options are exactly the values the model
 * was trained on. On submit it calls POST /risk/predict, which persists the
 * prediction for this user, then refreshes the dashboard.
 *
 * These are structured credit-application inputs, deliberately separate from
 * the user's transaction-derived spending intelligence.
 */

type SelectOpt = { value: string; label?: string };
type NumField = {
  kind: "number";
  name: keyof RiskPredictParams;
  label: string;
  helper?: string;
  min?: number;
  max?: number;
};
type SelectField = {
  kind: "select";
  name: keyof RiskPredictParams;
  label: string;
  helper?: string;
  options: SelectOpt[];
};
type FormField = NumField | SelectField;

const opt = (values: string[]): SelectOpt[] => values.map((v) => ({ value: v }));

const FIELDS: FormField[] = [
  {
    kind: "select",
    name: "checking_status",
    label: "Checking account status",
    helper: "Balance band of the primary current account",
    options: opt(["<0", "0<=X<200", ">=200", "no checking"]),
  },
  { kind: "number", name: "duration", label: "Loan duration (months)", min: 1, max: 120 },
  {
    kind: "select",
    name: "credit_history",
    label: "Credit history",
    options: opt([
      "no credits/all paid",
      "all paid",
      "existing paid",
      "delayed previously",
      "critical/other existing credit",
    ]),
  },
  {
    kind: "select",
    name: "purpose",
    label: "Purpose",
    options: opt([
      "new car",
      "used car",
      "furniture/equipment",
      "radio/tv",
      "domestic appliance",
      "repairs",
      "education",
      "retraining",
      "business",
      "other",
    ]),
  },
  { kind: "number", name: "credit_amount", label: "Credit amount (DM)", min: 100, helper: "Amount applied for" },
  {
    kind: "select",
    name: "savings_status",
    label: "Savings / investments",
    options: opt(["<100", "100<=X<500", "500<=X<1000", ">=1000", "no known savings"]),
  },
  {
    kind: "select",
    name: "employment",
    label: "Present employment since",
    options: opt(["unemployed", "<1", "1<=X<4", "4<=X<7", ">=7"]),
  },
  {
    kind: "number",
    name: "installment_commitment",
    label: "Instalment rate (% of income, tier 1–4)",
    min: 1,
    max: 4,
  },
  {
    kind: "select",
    name: "personal_status",
    label: "Personal status",
    options: opt(["male single", "male mar/wid", "male div/sep", "female div/dep/mar"]),
  },
  {
    kind: "select",
    name: "other_parties",
    label: "Other debtors / guarantors",
    options: opt(["none", "co applicant", "guarantor"]),
  },
  { kind: "number", name: "residence_since", label: "Years at current residence (tier 1–4)", min: 1, max: 4 },
  {
    kind: "select",
    name: "property_magnitude",
    label: "Most valuable property",
    options: opt(["real estate", "life insurance", "car", "no known property"]),
  },
  { kind: "number", name: "age", label: "Age (years)", min: 18, max: 100 },
  {
    kind: "select",
    name: "other_payment_plans",
    label: "Other instalment plans",
    options: opt(["none", "bank", "stores"]),
  },
  { kind: "select", name: "housing", label: "Housing", options: opt(["own", "rent", "for free"]) },
  { kind: "number", name: "existing_credits", label: "Existing credits at this bank (1–4)", min: 1, max: 4 },
  {
    kind: "select",
    name: "job",
    label: "Job",
    options: opt([
      "unemp/unskilled non res",
      "unskilled resident",
      "skilled",
      "high qualif/self emp/mgmt",
    ]),
  },
  { kind: "number", name: "num_dependents", label: "Dependents (1–2)", min: 1, max: 2 },
  { kind: "select", name: "own_telephone", label: "Registered telephone", options: opt(["yes", "none"]) },
  { kind: "select", name: "foreign_worker", label: "Foreign worker", options: opt(["yes", "no"]) },
];

const DEFAULTS: Record<string, string | number> = {
  checking_status: "0<=X<200",
  duration: 18,
  credit_history: "existing paid",
  purpose: "furniture/equipment",
  credit_amount: 2500,
  savings_status: "500<=X<1000",
  employment: "4<=X<7",
  installment_commitment: 2,
  personal_status: "male single",
  other_parties: "none",
  residence_since: 3,
  property_magnitude: "real estate",
  age: 31,
  other_payment_plans: "none",
  housing: "own",
  existing_credits: 2,
  job: "skilled",
  num_dependents: 1,
  own_telephone: "yes",
  foreign_worker: "no",
};

const selectClass =
  "w-full bg-[#0E1510] text-[#F9FAFB] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500";

export function RiskProfileForm({ contextMessage }: { contextMessage?: string }) {
  const { refreshData } = useCreditLens();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(DEFAULTS).map(([k, v]) => [k, String(v)])),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (name: string, v: string) => setValues((p) => ({ ...p, [name]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload: RiskPredictParams = {};
      for (const f of FIELDS) {
        const raw = values[f.name as string];
        if (f.kind === "number") {
          const num = parseFloat(raw);
          (payload as Record<string, unknown>)[f.name as string] = Number.isFinite(num) ? num : DEFAULTS[f.name as string];
        } else {
          (payload as Record<string, unknown>)[f.name as string] = raw;
        }
      }
      await riskService.predictRisk(payload);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate the risk assessment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6 md:p-8 bg-[#0B110D] border-white/10 space-y-6">
      <div className="pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base text-white">Generate your risk assessment</CardTitle>
            <p className="text-xs text-neutral-400 mt-0.5">
              The model scores this structured 20-field applicant profile (the public German Credit schema).
              These are credit-application inputs — separate from your transaction data.
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-neutral-300 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
        <span>
          Educational model trained on the public (South) German Credit benchmark. Amounts are in Deutsche Mark
          (DM), as in the dataset. Not a bureau score or an underwriting decision.
        </span>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FIELDS.map((f) => (
          <div key={f.name as string} className="w-full space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-300">{f.label}</label>
            {f.kind === "select" ? (
              <select
                className={selectClass}
                value={values[f.name as string]}
                onChange={(e) => set(f.name as string, e.target.value)}
              >
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label ?? o.value}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                type="number"
                min={f.min}
                max={f.max}
                value={values[f.name as string]}
                onChange={(e) => set(f.name as string, e.target.value)}
              />
            )}
            {f.helper && <p className="text-xs text-neutral-500">{f.helper}</p>}
          </div>
        ))}

        {error && <p className="sm:col-span-2 lg:col-span-3 text-xs text-rose-300">{error}</p>}

        <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-3 pt-1">
          <Button type="submit" variant="emerald" size="md" isLoading={submitting}>
            Run risk model
          </Button>
          <span className="text-xs text-neutral-500">Persisted to your account — you can re-run any time.</span>
        </div>
      </form>

      {contextMessage && (
        <p className="text-xs text-neutral-500 border-t border-white/[0.06] pt-3">{contextMessage}</p>
      )}
    </Card>
  );
}
