"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { RiskDistributionCard } from "@/components/fintech/RiskDistributionCard";
import { ShapExplainabilityCard } from "@/components/fintech/ShapExplainabilityCard";
import { EducationalDisclaimer } from "@/components/fintech/EducationalDisclaimer";
import { RiskProfileForm } from "@/components/fintech/RiskProfileForm";
import { useCreditLens } from "@/context/CreditLensContext";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  AlertTriangle,
  CheckCircle2,
  Layers
} from "lucide-react";

export default function RiskAnalysisPage() {
  const { riskAnalysis: riskState, refreshData } = useCreditLens();
  const riskAnalysis = riskState.data;

  if (riskState.status === "loading") {
    return (
      <AppLayout>
        <PageHeader title="Credit Risk Intelligence" subtitle="Loading your risk assessment…" />
        <div className="space-y-4">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (riskState.status === "error") {
    return (
      <AppLayout>
        <PageHeader title="Credit Risk Intelligence" subtitle="Machine learning multi-class risk classification with TreeSHAP explainability." />
        <ErrorState description={riskState.message || undefined} onRetry={() => void refreshData()} />
      </AppLayout>
    );
  }

  if (!riskAnalysis) {
    // no_data / insufficient_data — never show the canonical demo applicant
    // result. Give the user the real 20-field intake so the model can run.
    return (
      <AppLayout>
        <PageHeader
          title="Credit Risk Intelligence"
          subtitle="Machine learning multi-class risk classification, multi-tier probability distributions, and TreeSHAP feature attributions."
          badge={<Badge variant="slate" size="sm">Analysis pending</Badge>}
        />
        <div className="mb-8">
          <RiskProfileForm contextMessage={riskState.message || undefined} />
        </div>
        <EducationalDisclaimer />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Credit Risk Intelligence"
        subtitle="Machine learning multi-class risk classification, multi-tier probability distributions, and TreeSHAP feature attributions."
        badge={
          <Badge variant="emerald" size="sm" showDot>
            {riskAnalysis.riskCategory} ({Math.round(riskAnalysis.probabilityDistribution.lowRisk <= 1 ? riskAnalysis.probabilityDistribution.lowRisk * 100 : riskAnalysis.probabilityDistribution.lowRisk)}% Prob)
          </Badge>
        }
      />

      {/* Top Probability Distribution Card */}
      <div className="mb-8">
        <RiskDistributionCard riskData={riskAnalysis} />
      </div>

      {/* Positive Drivers vs Warning Signals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Positive Drivers Card */}
        <Card className="p-6 bg-[#0B110D] border-emerald-500/20">
          <div className="flex items-center gap-2.5 pb-3.5 border-b border-white/[0.08] mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/25">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base text-white">Top Positive Drivers</CardTitle>
              <p className="text-xs text-neutral-400">Features significantly reducing estimated default risk</p>
            </div>
          </div>

          <div className="space-y-3">
            {riskAnalysis.topPositiveFactors.map((factor, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#0E1510] border border-emerald-500/20 flex items-start gap-3 text-xs text-neutral-200"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{factor}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Risk Warning Factors Card */}
        <Card className="p-6 bg-[#0B110D] border-amber-500/20">
          <div className="flex items-center gap-2.5 pb-3.5 border-b border-white/[0.08] mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-300 flex items-center justify-center border border-amber-500/25">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base text-white">Watch Signals & Risk Drivers</CardTitle>
              <p className="text-xs text-neutral-400">Features increasing model default probability index</p>
            </div>
          </div>

          <div className="space-y-3">
            {riskAnalysis.riskFactors.map((factor, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#0E1510] border border-amber-500/20 flex items-start gap-3 text-xs text-neutral-200"
              >
                <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{factor}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* SHAP Model Explainability Container */}
      <div className="mb-8">
        <ShapExplainabilityCard contributions={riskAnalysis.modelExplainability} />
      </div>

      {/* Future Model Architecture Specification Note */}
      <div className="mb-8">
        <Card className="p-6 bg-[#080D09] border-white/10 text-xs">
          <div className="flex items-center gap-2 font-bold text-white mb-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>ML Pipeline Architecture Specifications</span>
          </div>
          <p className="text-neutral-400 leading-relaxed text-xs">
            This analytical view connects directly to our containerized <strong>FastAPI + Scikit-Learn / XGBoost</strong> pipeline.
            An applicant credit profile is evaluated against gradient boosted trees trained on the public (South) German Credit benchmark dataset to compute multi-class probabilities and exact TreeSHAP waterfall values. It is an educational risk model, not a bureau or underwriting decision.
          </p>
        </Card>
      </div>

      {/* Educational Disclaimer */}
      <EducationalDisclaimer />
    </AppLayout>
  );
}
