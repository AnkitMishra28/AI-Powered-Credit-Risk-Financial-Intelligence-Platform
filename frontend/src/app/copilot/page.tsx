"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { CopilotChat } from "@/components/fintech/CopilotChat";
import { SourceCitationPanel } from "@/components/fintech/SourceCitationPanel";
import { EducationalDisclaimer } from "@/components/fintech/EducationalDisclaimer";
import { CitationSource, GroundingFact } from "@/types";
import { INITIAL_COPILOT_MESSAGES } from "@/lib/demo-data";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  HelpCircle,
  Database
} from "lucide-react";
import { SUGGESTED_COPILOT_QUESTIONS } from "@/lib/constants";

export default function CopilotPage() {
  const [sources, setSources] = useState<CitationSource[]>([
    {
      id: "src-rbi-01",
      title: "RBI Master Direction – Credit Card & Debit Card Issuance (2022)",
      publisher: "Reserve Bank of India (RBI)",
      docType: "Regulatory Guideline",
      excerpt: "Clause 8(b): Card issuers shall explicitly inform the cardholder of the implications of paying only the minimum amount due, including the compounding interest burden and time required to liquidate the full outstanding amount.",
      url: "https://www.rbi.org.in",
      relevanceScore: 0.96
    },
    {
      id: "src-edu-02",
      title: "Credit Utilization & Revolving Balance Optimization Handbook",
      publisher: "CreditLens Financial Intelligence Framework",
      docType: "Financial Education Guide",
      excerpt: "Maintaining aggregate revolving credit utilization below 30% of authorized limits is historically correlated with lower default risk and faster score recovery.",
      relevanceScore: 0.92
    },
    {
      id: "src-terms-03",
      title: "Consumer Credit APR & Grace Period Disclosure Standard",
      publisher: "National Financial Educators Council",
      docType: "Credit Terms Standard",
      excerpt: "Carrying unpaid revolving balances month-over-month revokes the interest-free grace period on subsequent purchases, subjecting all new charges to daily APR from the transaction date.",
      relevanceScore: 0.88
    }
  ]);

  const [groundingFacts, setGroundingFacts] = useState<GroundingFact[]>([
    { label: "Revolving Utilization", value: "68% (₹1,70,000 / ₹2,50,000)" },
    { label: "Payment Consistency", value: "94% on-time" },
    { label: "Current Monthly Spend", value: "₹49,230" },
    { label: "Net Monthly Income", value: "₹65,000" },
  ]);

  return (
    <AppLayout>
      <PageHeader
        title="Ask CreditLens Intelligence Studio"
        subtitle="Conversational financial assistant grounded in your deterministic metrics and official regulatory guidelines."
        badge={
          <Badge variant="violet" size="sm">
            RAG + Gemini 1.5 Architecture
          </Badge>
        }
      />

      {/* 3-Column Financial Intelligence Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left Column (3 cols): Financial Grounding Matrix & Suggested Topics */}
        <div className="lg:col-span-3 space-y-4">
          {/* Grounding Fact Box */}
          <Card className="p-4 bg-slate-900/90 border-slate-800">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800 mb-3">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">Active Grounding Matrix</span>
            </div>
            <p className="text-[10px] text-slate-400 mb-3">
              The copilot uses these structured facts from your pipeline. The LLM does not calculate them.
            </p>
            <div className="space-y-2">
              {groundingFacts.map((f, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                  <span className="text-[10px] text-slate-400 block">{f.label}</span>
                  <span className="font-mono font-bold text-emerald-400 text-[11px]">{f.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Questions Card */}
          <Card className="p-4 bg-slate-900/90 border-slate-800">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800 mb-3">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-slate-200">Suggested Inquiries</span>
            </div>
            <div className="space-y-2 text-xs">
              {SUGGESTED_COPILOT_QUESTIONS.map((q, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                >
                  {q}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Center Column (6 cols): Copilot Chat Conversation */}
        <div className="lg:col-span-6">
          <CopilotChat
            initialMessages={INITIAL_COPILOT_MESSAGES}
            onSourcesUpdated={(newSources) => setSources(newSources)}
            onFactsUpdated={(newFacts) => setGroundingFacts(newFacts)}
          />
        </div>

        {/* Right Column (3 cols): Knowledge Sources & Citations Panel */}
        <div className="lg:col-span-3">
          <Card className="p-4 bg-slate-900/90 border-purple-500/20">
            <SourceCitationPanel sources={sources} />
          </Card>
        </div>
      </div>

      {/* Educational & Responsible AI Notice */}
      <EducationalDisclaimer />
    </AppLayout>
  );
}
