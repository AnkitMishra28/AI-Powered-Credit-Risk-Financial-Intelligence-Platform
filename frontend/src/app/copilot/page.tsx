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
  Database,
  History,
  MessageSquare
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
      url: "https://www.rbi.org.in",
      relevanceScore: 0.92
    },
    {
      id: "src-terms-03",
      title: "Consumer Credit APR & Grace Period Disclosure Standard",
      publisher: "National Financial Educators Council",
      docType: "Credit Terms Standard",
      excerpt: "Carrying unpaid revolving balances month-over-month revokes the interest-free grace period on subsequent purchases, subjecting all new charges to daily APR from the transaction date.",
      url: "https://www.rbi.org.in",
      relevanceScore: 0.88
    }
  ]);

  const [groundingFacts, setGroundingFacts] = useState<GroundingFact[]>([
    { label: "Revolving Utilization", value: "68% (₹1,70,000 / ₹2,50,000)" },
    { label: "Payment Consistency", value: "94% on-time index" },
    { label: "Current Monthly Spend", value: "₹49,230" },
    { label: "Net Monthly Income", value: "₹65,000" },
  ]);

  const PAST_SESSIONS = [
    { title: "Minimum Payment Trap Analysis", date: "Today" },
    { title: "Dining Anomaly & Cashflow Impact", date: "Yesterday" },
    { title: "Score Recovery to 800+ Plan", date: "Mar 24" },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Ask CreditLens — Financial Intelligence Workspace"
        subtitle="Interactive AI research studio grounded strictly in deterministic profile facts and official regulatory credit frameworks."
        badge={
          <Badge variant="emerald" size="sm" showDot>
            RAG + Deterministic Grounding
          </Badge>
        }
      />

      {/* 3-Column AI Financial Intelligence Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left Column (3 cols): Active Grounding Matrix & Topic Sessions */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Grounding Matrix */}
          <Card className="p-4 bg-[#0B110D] border-white/10">
            <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08] mb-3">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">Live Grounding Matrix</span>
            </div>
            <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
              The AI copilot synthesizes these exact figures calculated by the deterministic pipeline.
            </p>
            <div className="space-y-2">
              {groundingFacts.map((f, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#0E1510] border border-white/[0.06] text-xs">
                  <span className="text-neutral-400 block text-xs">{f.label}</span>
                  <span className="font-mono font-bold text-emerald-400 text-xs mt-0.5 block">{f.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Past Inquiry Sessions */}
          <Card className="p-4 bg-[#0B110D] border-white/10">
            <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08] mb-3">
              <History className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">Recent Sessions</span>
            </div>
            <div className="space-y-2 text-xs">
              {PAST_SESSIONS.map((sess, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#0E1510] border border-white/[0.06] hover:border-emerald-500/30 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-neutral-500 group-hover:text-emerald-400" />
                    <span className="text-xs font-medium text-neutral-300 group-hover:text-white truncate max-w-[150px]">
                      {sess.title}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400 shrink-0">{sess.date}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Questions Card */}
          <Card className="p-4 bg-[#0B110D] border-white/10">
            <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08] mb-3">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">Curated Topics</span>
            </div>
            <div className="space-y-2 text-xs">
              {SUGGESTED_COPILOT_QUESTIONS.map((q, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#0E1510] border border-white/[0.06] text-xs text-neutral-300 hover:text-white hover:border-emerald-500/30 transition-colors cursor-pointer"
                >
                  {q}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Center Column (6 cols): Main Dominant Conversation Canvas */}
        <div className="lg:col-span-6">
          <CopilotChat
            initialMessages={INITIAL_COPILOT_MESSAGES}
            onSourcesUpdated={(newSources) => setSources(newSources)}
            onFactsUpdated={(newFacts) => setGroundingFacts(newFacts)}
          />
        </div>

        {/* Right Column (3 cols): Knowledge Sources & Regulatory Citations Panel */}
        <div className="lg:col-span-3">
          <Card className="p-4 bg-[#0B110D] border-emerald-500/20">
            <SourceCitationPanel sources={sources} />
          </Card>
        </div>
      </div>

      {/* Educational & Responsible AI Notice */}
      <EducationalDisclaimer />
    </AppLayout>
  );
}
