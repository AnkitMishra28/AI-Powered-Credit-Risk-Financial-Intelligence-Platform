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
  AlertTriangle,
  FileSpreadsheet
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050706] text-[#F9FAFB] flex flex-col selection:bg-emerald-500/25 selection:text-emerald-200">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 md:px-12 overflow-hidden border-b border-white/[0.08]">
        {/* Subtle Ambient Emerald Lighting */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[400px] bg-radial from-emerald-500/10 via-emerald-950/5 to-transparent blur-[140px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI-Powered Credit Risk & Financial Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] mb-6">
            Understand your credit. <br />
            <span className="text-neutral-400">See the signals behind it.</span> <br />
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-lime-300 bg-clip-text text-transparent">
              Make smarter decisions.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            CreditLens transforms complex banking statements, revolving credit lines, and cashflow data into 
            explainable credit health metrics, machine learning risk signals, and verified AI insights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/onboarding" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto px-8 text-sm font-bold shadow-lg shadow-emerald-950/60" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Analyze My Finances
              </Button>
            </Link>

            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto px-8 text-sm font-bold border-white/10 bg-[#0E1510] hover:bg-[#141F17]" leftIcon={<Sparkles className="w-4 h-4 text-emerald-400" />}>
                Launch Interactive Demo
              </Button>
            </Link>
          </div>

          {/* Centerpiece: AI Financial Intelligence Console Preview */}
          <div className="relative mx-auto max-w-5xl">
            {/* Ambient backlight glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-lime-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000" />

            <div className="relative rounded-3xl bg-[#090E0A] border border-white/[0.12] p-6 md:p-8 text-left shadow-2xl overflow-hidden">
              {/* Console Window Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/[0.08] mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-neutral-400 font-mono ml-2">creditlens-intelligence-console.app</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="emerald" size="sm" showDot>
                    Deterministic Pipeline Active
                  </Badge>
                  <span className="text-xs text-neutral-400 font-mono hidden sm:inline">Portfolio Profile: Alex Mercer</span>
                </div>
              </div>

              {/* 4 Multi-Domain Preview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Panel 1: Credit Health Diagnostic (4 cols) */}
                <div className="md:col-span-4 p-5 rounded-2xl bg-[#0B110D] border border-white/[0.08] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Diagnostic Score</span>
                    <span className="text-xs text-emerald-400 font-semibold font-mono">0–1000 Index</span>
                  </div>
                  <div className="py-2 flex items-center justify-center">
                    <RadialGauge score={742} tier="Healthy" delta={18} size={200} />
                  </div>
                  <div className="p-2.5 bg-[#070B08] rounded-xl border border-white/5 text-xs text-neutral-300 flex items-center justify-between">
                    <span>Payment History Index</span>
                    <strong className="text-emerald-400 font-mono">92% (Optimal)</strong>
                  </div>
                </div>

                {/* Panel 2: ML Risk Assessment (4 cols) */}
                <div className="md:col-span-4 p-5 rounded-2xl bg-[#0B110D] border border-white/[0.08] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Algorithmic Risk</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-[#121A14] text-neutral-400 font-mono border border-white/10">XGB-1.2</span>
                    </div>
                    <h4 className="text-2xl font-black text-emerald-400 tracking-tight mt-1">LOW RISK</h4>
                    <p className="text-xs text-neutral-400 mt-1">82% Low Risk Probability | 87% Confidence</p>
                  </div>

                  <div className="space-y-2 py-3 border-y border-white/[0.08] my-3 text-xs text-neutral-300">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>94% on-time repayment consistency</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>68% revolving credit utilization</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>SHAP TreeExplainer</span>
                    <span className="text-emerald-400 font-mono font-bold">+0.42 Attribution</span>
                  </div>
                </div>

                {/* Panel 3: Grounded AI Copilot & Sources (4 cols) */}
                <div className="md:col-span-4 p-5 rounded-2xl bg-[#0B110D] border border-white/[0.08] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-2">
                      <Bot className="w-4 h-4" />
                      <span>Ask CreditLens Grounded GenAI</span>
                    </div>
                    <div className="p-3 bg-[#070B08] rounded-xl border border-white/5 text-xs text-neutral-300 leading-relaxed font-sans italic">
                      &ldquo;Paying only the minimum due preserves on-time status but leaves ₹1,70,000 at 42% APR compounding interest and 68% utilization.&rdquo;
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/[0.08] space-y-1.5">
                    <div className="text-xs text-neutral-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">Cited: RBI Master Direction 2022</span>
                    </div>
                    <div className="text-xs text-neutral-400 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">Grounding: 4 Verified Metrics</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Intelligence Suite Section */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="emerald" size="md" className="mb-3">
            Financial Intelligence Console
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Deterministic Financial Math Meets Responsible GenAI
          </h2>
          <p className="text-sm text-neutral-400 mt-3.5 leading-relaxed">
            Unlike generic LLM wrappers that hallucinate calculations, CreditLens executes rigorous deterministic pipelines first, then generates natural-language explanations grounded in verified regulatory sources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Credit Risk Intelligence */}
          <Card className="p-6 fintech-card-hover bg-[#0B110D] border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/25 mb-5 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <CardTitle className="text-base text-white">Credit Risk Intelligence</CardTitle>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Multi-class classification evaluating Low, Medium, and High Risk probabilities with confidence intervals and XGBoost/SHAP feature attribution.
              </p>
            </div>
            <div className="pt-4 border-t border-white/[0.08] mt-5 text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span>Low / Medium / High Risk</span>
            </div>
          </Card>

          {/* Card 2: Credit Health Score */}
          <Card className="p-6 fintech-card-hover bg-[#0B110D] border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center border border-emerald-500/25 mb-5 shadow-[0_0_15px_rgba(52,211,153,0.15)]">
                <Activity className="w-6 h-6" />
              </div>
              <CardTitle className="text-base text-white">Credit Health Score</CardTitle>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Proprietary 0 to 1000 score diagnostics measuring payment consistency, revolving debt burdens, and cashflow seasoning without opaque bureau black-boxes.
              </p>
            </div>
            <div className="pt-4 border-t border-white/[0.08] mt-5 text-xs text-emerald-300 font-semibold flex items-center gap-1">
              <span>0–1000 Scale + Factor Attribution</span>
            </div>
          </Card>

          {/* Card 3: Spending Intelligence */}
          <Card className="p-6 fintech-card-hover bg-[#0B110D] border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-300 flex items-center justify-center border border-amber-500/25 mb-5 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <PieChart className="w-6 h-6" />
              </div>
              <CardTitle className="text-base text-white">Spending Intelligence</CardTitle>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Automated merchant classification, month-over-month velocity tracking, and anomaly detection (e.g. +31% dining surge vs 3-month trailing mean).
              </p>
            </div>
            <div className="pt-4 border-t border-white/[0.08] mt-5 text-xs text-amber-300 font-semibold flex items-center gap-1">
              <span>Velocity & Anomaly Detection</span>
            </div>
          </Card>

          {/* Card 4: AI Financial Copilot */}
          <Card className="p-6 fintech-card-hover bg-[#0B110D] border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/25 mb-5 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <Bot className="w-6 h-6" />
              </div>
              <CardTitle className="text-base text-white">Ask CreditLens Copilot</CardTitle>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                RAG architecture combining vector search over official RBI guidelines and credit disclosures with structured deterministic metric grounding.
              </p>
            </div>
            <div className="pt-4 border-t border-white/[0.08] mt-5 text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span>pgvector + Verified Citations</span>
            </div>
          </Card>
        </div>
      </section>

      {/* How It Works (4 Steps) */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 bg-[#080D09] border-y border-white/[0.08]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">How CreditLens Operates</h2>
            <p className="text-xs md:text-sm text-neutral-400 mt-2 leading-relaxed">
              From raw statement documents to explainable credit intelligence across 4 transparent stages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#0B110D] border border-white/10 relative">
              <span className="text-4xl font-black text-[#141F17] font-mono block mb-2">01</span>
              <h3 className="text-sm font-bold text-white mb-1.5">Connect Financial Data</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Upload credit card statements, loan accounts, and cashflow data securely with zero credential exposure.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0B110D] border border-white/10 relative">
              <span className="text-4xl font-black text-[#141F17] font-mono block mb-2">02</span>
              <h3 className="text-sm font-bold text-white mb-1.5">Compute Health Score</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Run deterministic mathematical algorithms across utilization, repayment patterns, and debt ratios.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0B110D] border border-white/10 relative">
              <span className="text-4xl font-black text-[#141F17] font-mono block mb-2">03</span>
              <h3 className="text-sm font-bold text-white mb-1.5">Analyze Risk & SHAP</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Inspect positive drivers, risk flags, and feature impacts via TreeSHAP explainability models.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0B110D] border border-white/10 relative">
              <span className="text-4xl font-black text-[#141F17] font-mono block mb-2">04</span>
              <h3 className="text-sm font-bold text-white mb-1.5">Query Grounded AI</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Engage the copilot for personalized educational guidance cited with official RBI regulatory guidelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Responsible AI & Educational Trust */}
      <section id="explainable-ai" className="py-24 px-6 md:px-12 max-w-5xl mx-auto w-full">
        <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-r from-emerald-950/30 via-[#0B110D] to-emerald-950/20 border border-emerald-500/25 shadow-2xl">
          <div className="flex items-center gap-2.5 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Lock className="w-4 h-4" />
            <span>Responsible AI Architecture</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-4">
            Built for Financial Literacy & Intelligence — Not Financial Advice
          </h2>

          <p className="text-xs md:text-sm text-neutral-300 leading-relaxed mb-6">
            CreditLens adheres to strict AI safety standards. <strong className="text-white">The LLM does not compute mathematical metrics</strong>; our deterministic pipelines calculate exact figures, and GenAI serves purely to generate accessible natural language explanations and regulatory citations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-white/[0.08] text-xs">
            <div className="flex items-center gap-2 text-neutral-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero Hallucinated Numbers</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Verified Regulatory Citations</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Tenant-Isolated Data Privacy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Explore CTA */}
      <section className="py-20 px-6 text-center border-t border-white/[0.08]">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
          Experience CreditLens Financial Intelligence Today
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto mb-8 leading-relaxed">
          Explore the full interactive intelligence dashboard with preloaded demo profile data or configure your personal profile.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
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
