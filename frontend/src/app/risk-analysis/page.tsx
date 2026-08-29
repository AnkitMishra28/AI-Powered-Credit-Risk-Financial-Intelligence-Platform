"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { RiskDistributionCard } from "@/components/fintech/RiskDistributionCard";
import { ShapExplainabilityCard } from "@/components/fintech/ShapExplainabilityCard";
import { EducationalDisclaimer } from "@/components/fintech/EducationalDisclaimer";
import { useCreditLens } from "@/context/CreditLensContext";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  AlertTriangle,
  CheckCircle2,
  Layers
} from "lucide-react";

export default function RiskAnalysisPage() {
  const { riskAnalysis } = useCreditLens();

  return (
    <AppLayout>
      <PageHeader
        title="Credit Risk Assessment"
        subtitle="Machine learning multi-class risk classification, probability distributions, and explainable feature impacts."
        badge={
          <Badge variant="low-risk" size="sm" showDot>
            LOW RISK (82% Prob)
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
        <Card className="p-6 bg-slate-900/90 border-emerald-500/20">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base text-slate-100">Top Positive Factors</CardTitle>
              <p className="text-xs text-slate-400">Features significantly reducing default probability</p>
            </div>
          </div>

          <div className="space-y-3">
            {riskAnalysis.topPositiveFactors.map((factor, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-slate-300"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{factor}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Risk Warning Factors Card */}
        <Card className="p-6 bg-slate-900/90 border-amber-500/20">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base text-slate-100">Risk Factors & Warning Signals</CardTitle>
              <p className="text-xs text-slate-400">Features increasing model risk index</p>
            </div>
          </div>

          <div className="space-y-3">
            {riskAnalysis.riskFactors.map((factor, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20 flex items-start gap-2.5 text-xs text-slate-300"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
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
        <Card className="p-6 bg-slate-900/50 border-slate-800 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-200 mb-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>ML Pipeline Architecture (Phase 2 Roadmap)</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            In Phase 2, this view connects directly to our containerized <strong>FastAPI + Scikit-Learn / XGBoost</strong> pipeline. 
            Real statement transactions and bureau metrics will be passed into normalized feature extractors to compute real-time multi-class probabilities and SHAP waterfall attributions.
          </p>
        </Card>
      </div>

      {/* Educational Disclaimer */}
      <EducationalDisclaimer />
    </AppLayout>
  );
}
