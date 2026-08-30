import React from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-[#040605] border-t border-white/[0.08] text-neutral-400 py-14 px-6 md:px-12 select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        {/* Col 1: Brand & Architecture */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-lime-400 p-[1px]">
              <div className="w-full h-full bg-[#050706] rounded-[10px] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <span className="font-extrabold text-base text-white tracking-tight">CreditLens</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            AI-Powered Credit Risk & Financial Intelligence Platform combining deterministic credit calculations, machine learning classification, and grounded GenAI explanations.
          </p>
        </div>

        {/* Col 2: Intelligence Suite */}
        <div className="space-y-3">
          <p className="font-bold text-white text-xs uppercase tracking-wider">Intelligence Console</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/credit-health" className="text-neutral-400 hover:text-emerald-300 transition-colors">
                Credit Health Score (0–1000)
              </Link>
            </li>
            <li>
              <Link href="/risk-analysis" className="text-neutral-400 hover:text-emerald-300 transition-colors">
                Credit Risk Evaluation & SHAP
              </Link>
            </li>
            <li>
              <Link href="/spending" className="text-neutral-400 hover:text-emerald-300 transition-colors">
                Spending Velocity & Anomalies
              </Link>
            </li>
            <li>
              <Link href="/copilot" className="text-neutral-400 hover:text-emerald-300 transition-colors">
                Ask CreditLens RAG Assistant
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Engineering Architecture */}
        <div className="space-y-3">
          <p className="font-bold text-white text-xs uppercase tracking-wider">Engineering Core</p>
          <ul className="space-y-2 text-sm text-neutral-400">
            <li>Next.js 16 + React 19 + TypeScript</li>
            <li>FastAPI + Python REST Services</li>
            <li>PostgreSQL + pgvector Architecture</li>
            <li>XGBoost & TreeSHAP Explainability</li>
          </ul>
        </div>

        {/* Col 4: Responsible AI & Trust */}
        <div className="space-y-3">
          <p className="font-bold text-white text-xs uppercase tracking-wider">Responsible AI & Governance</p>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Engineered strictly for educational financial intelligence. CreditLens does NOT calculate official credit bureau scores (CIBIL/Experian) and does not provide regulated underwriting advice.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
        <p>© 2026 CreditLens Technologies. Open-source educational portfolio platform.</p>
        <div className="flex items-center gap-6">
          <Link href="/settings" className="hover:text-emerald-300 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/settings" className="hover:text-emerald-300 transition-colors">
            Data Architecture
          </Link>
          <Link href="/settings" className="hover:text-emerald-300 transition-colors">
            Security Model
          </Link>
        </div>
      </div>
    </footer>
  );
}
