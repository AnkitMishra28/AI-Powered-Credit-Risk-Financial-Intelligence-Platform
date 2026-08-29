import React from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardTitle } from "@/components/ui/Card";
import { RadialGauge } from "@/components/ui/RadialGauge";
import {
  ShieldCheck,
  Activity,
  Bot,
  PieChart,
  ArrowRight,
  Sparkles,
  Lock,
  BookOpen,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col selection:bg-blue-500/30">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 md:px-12 overflow-hidden border-b border-slate-800/80">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI-Powered Credit Risk & Financial Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1] mb-6">
            Understand your credit. <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Make smarter financial decisions.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            CreditLens transforms complex banking statements, revolving credit lines, and cashflow data into 
            explainable credit health metrics, machine learning risk signals, and verified AI insights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/onboarding" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto px-8 shadow-blue-600/30 text-sm font-bold" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Analyze My Finances
              </Button>
            </Link>

            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto px-8 text-sm font-bold border-slate-700 bg-slate-900/90 hover:bg-slate-800" leftIcon={<Sparkles className="w-4 h-4 text-emerald-400" />}>
                Explore Demo Profile
              </Button>
            </Link>
          </div>

          {/* Interactive Hero Product Preview Card */}
          <div className="fintech-card p-6 md:p-8 max-w-4xl mx-auto text-left shadow-2xl border-slate-700/80 bg-slate-950/90 relative group">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-slate-400 font-mono ml-2">creditlens-intelligence-v1.0.app</span>
              </div>
              <Badge variant="emerald" size="sm" showDot>
                Active Financial Health Diagnostic
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Score Preview */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center">
                <RadialGauge score={742} tier="Healthy" delta={18} size={180} />
              </div>

              {/* Risk Preview */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Algorithmic Risk</span>
                  <h4 className="text-xl font-bold text-emerald-400 mt-1">LOW RISK</h4>
                  <p className="text-xs text-slate-400 mt-1">82% Low Risk | 87% Confidence</p>
                </div>
                <div className="space-y-1.5 pt-3 border-t border-slate-800 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>94% on-time repayment index</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>68% revolving card utilization</span>
                  </div>
                </div>
              </div>

              {/* Grounded AI Preview */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold mb-1">
                    <Bot className="w-4 h-4" />
                    <span>Ask CreditLens RAG</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans italic">
                    &ldquo;Paying only the minimum due maintains on-time status but keeps utilization at 68% and accrues 42% APR interest on your ₹1,70,000 balance.&rdquo;
                  </p>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-2 pt-2 border-t border-slate-800">
                  <BookOpen className="w-3 h-3 text-purple-400" />
                  <span>Cited: RBI Master Direction 2022</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Intelligence Suite Section */}
      <section id="features" className="py-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="blue" size="md" className="mb-3">
            Comprehensive Platform Capabilities
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Traditional Financial Intelligence Meets Responsible GenAI
          </h2>
          <p className="text-sm text-slate-400 mt-3 leading-relaxed">
            Unlike generic chatbots that hallucinate numbers, CreditLens computes deterministic financial facts first, then generates natural-language explanations grounded in verified sources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Credit Risk Intelligence */}
          <Card className="p-6 fintech-card-hover bg-slate-900/90 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 mb-4 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <CardTitle className="text-base text-slate-100">Credit Risk Intelligence</CardTitle>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Multi-class classification evaluating Low, Medium, and High Risk probabilities with confidence intervals and XGBoost/SHAP feature attribution.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-4 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <span>Low / Medium / High Risk</span>
            </div>
          </Card>

          {/* Card 2: Credit Health Score */}
          <Card className="p-6 fintech-card-hover bg-slate-900/90 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 mb-4 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                <Activity className="w-6 h-6" />
              </div>
              <CardTitle className="text-base text-slate-100">Credit Health Score</CardTitle>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Proprietary 0 to 1000 score diagnostics measuring payment consistency, revolving debt burdens, and cashflow seasoning without opaque bureau black-boxes.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-4 text-[11px] text-blue-400 font-semibold flex items-center gap-1">
              <span>0-1000 Scale + Factor Breakdown</span>
            </div>
          </Card>

          {/* Card 3: Spending Intelligence */}
          <Card className="p-6 fintech-card-hover bg-slate-900/90 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 mb-4 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <PieChart className="w-6 h-6" />
              </div>
              <CardTitle className="text-base text-slate-100">Spending Intelligence</CardTitle>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Automated merchant classification, month-over-month velocity tracking, and anomaly detection (e.g. +31% dining surge vs 3-month trailing mean).
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-4 text-[11px] text-amber-400 font-semibold flex items-center gap-1">
              <span>Velocity & Anomaly Detection</span>
            </div>
          </Card>

          {/* Card 4: AI Financial Copilot */}
          <Card className="p-6 fintech-card-hover bg-slate-900/90 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 mb-4 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                <Bot className="w-6 h-6" />
              </div>
              <CardTitle className="text-base text-slate-100">Ask CreditLens Copilot</CardTitle>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                RAG architecture combining pgvector vector search over official RBI guidelines and credit disclosures with structured metric fact grounding.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-4 text-[11px] text-purple-400 font-semibold flex items-center gap-1">
              <span>pgvector + Verified Citations</span>
            </div>
          </Card>
        </div>
      </section>

      {/* How It Works (4 Steps) */}
      <section id="how-it-works" className="py-20 px-6 md:px-12 bg-slate-950/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">How CreditLens Works</h2>
            <p className="text-xs md:text-sm text-slate-400 mt-2">
              From raw banking statements to explainable credit intelligence in 4 transparent stages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 relative">
              <span className="text-4xl font-black text-slate-800 font-mono block mb-2">01</span>
              <h3 className="text-sm font-bold text-slate-200 mb-1">Upload Your Data</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect credit card statements, active loan accounts, and income data securely.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 relative">
              <span className="text-4xl font-black text-slate-800 font-mono block mb-2">02</span>
              <h3 className="text-sm font-bold text-slate-200 mb-1">Analyze Credit Health</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compute deterministic factor scores across utilization, repayment patterns, and debt ratios.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 relative">
              <span className="text-4xl font-black text-slate-800 font-mono block mb-2">03</span>
              <h3 className="text-sm font-bold text-slate-200 mb-1">Understand Your Risk</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inspect positive drivers, risk flags, and SHAP explainability attributions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 relative">
              <span className="text-4xl font-black text-slate-800 font-mono block mb-2">04</span>
              <h3 className="text-sm font-bold text-slate-200 mb-1">Ask CreditLens</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Query the copilot for personalized educational guidance cited with official regulations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Responsible AI & Educational Trust */}
      <section id="explainable-ai" className="py-20 px-6 md:px-12 max-w-5xl mx-auto w-full">
        <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-r from-blue-950/30 via-slate-900 to-indigo-950/30 border border-blue-500/30 shadow-2xl">
          <div className="flex items-center gap-2.5 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Lock className="w-4 h-4" />
            <span>Responsible AI Architecture</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-4">
            Built for Financial Education & Intelligence — Not Financial Advice
          </h2>

          <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-6">
            CreditLens adheres to strict AI safety standards. <strong>The LLM does not compute mathematical metrics</strong>; our deterministic pipelines calculate exact figures, and GenAI serves purely to generate accessible natural language explanations and regulatory citations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero Hallucinated Numbers</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Verified Source Citations</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Server-Side Data Privacy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Explore CTA */}
      <section className="py-16 px-6 text-center border-t border-slate-800/80">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
          Experience CreditLens Financial Intelligence Today
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mb-6">
          Explore the full interactive intelligence dashboard with preloaded demo profile data or start your onboarding.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" variant="emerald" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Launch Interactive Demo
            </Button>
          </Link>
          <Link href="/onboarding">
            <Button size="lg" variant="outline">
              Setup Custom Profile
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
