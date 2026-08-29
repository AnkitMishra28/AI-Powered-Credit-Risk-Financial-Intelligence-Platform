import React from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-[#070A12] border-t border-slate-800/80 text-slate-400 text-xs py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        {/* Col 1 */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-extrabold text-sm text-white">CreditLens</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            AI-Powered Credit Risk & Financial Intelligence Platform combining deterministic credit calculations, machine learning classification, and grounded GenAI explanations.
          </p>
        </div>

        {/* Col 2: Suite */}
        <div className="space-y-2">
          <p className="font-bold text-slate-200 text-xs uppercase tracking-wider">Intelligence</p>
          <ul className="space-y-1.5 text-[11px]">
            <li><Link href="/credit-health" className="hover:text-blue-400 transition-colors">Credit Health Score (0-1000)</Link></li>
            <li><Link href="/risk-analysis" className="hover:text-blue-400 transition-colors">Credit Risk Evaluation</Link></li>
            <li><Link href="/spending" className="hover:text-blue-400 transition-colors">Spending Intelligence & Velocity</Link></li>
            <li><Link href="/copilot" className="hover:text-blue-400 transition-colors">Ask CreditLens RAG Assistant</Link></li>
          </ul>
        </div>

        {/* Col 3: Architecture & Tech */}
        <div className="space-y-2">
          <p className="font-bold text-slate-200 text-xs uppercase tracking-wider">Engineering Stack</p>
          <ul className="space-y-1.5 text-[11px]">
            <li><span className="text-slate-400">Next.js 16 + React 19 + TypeScript</span></li>
            <li><span className="text-slate-400">FastAPI + Python REST Core</span></li>
            <li><span className="text-slate-400">PostgreSQL + pgvector Architecture</span></li>
            <li><span className="text-slate-400">XGBoost & SHAP Explainability</span></li>
          </ul>
        </div>

        {/* Col 4: Responsible AI */}
        <div className="space-y-2">
          <p className="font-bold text-slate-200 text-xs uppercase tracking-wider">Compliance & Trust</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Built strictly for educational financial intelligence. CreditLens does NOT represent official credit bureau scores (CIBIL/Experian) and does not provide regulated underwriting advice.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <p>© 2026 CreditLens Technologies. Open-source educational portfolio architecture.</p>
        <div className="flex items-center gap-6">
          <Link href="/settings" className="hover:text-slate-400">Privacy Policy</Link>
          <Link href="/settings" className="hover:text-slate-400">Data Architecture</Link>
          <Link href="/settings" className="hover:text-slate-400">Security Model</Link>
        </div>
      </div>
    </footer>
  );
}
