import React from "react";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EducationalDisclaimerProps {
  className?: string;
  variant?: "banner" | "inline" | "card";
}

export function EducationalDisclaimer({
  className,
  variant = "card",
}: EducationalDisclaimerProps) {
  if (variant === "inline") {
    return (
      <p className={cn("text-[11px] text-slate-400 flex items-center gap-1.5", className)}>
        <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span>
          <strong>Educational Metric</strong>: CreditLens is NOT an official credit bureau (CIBIL/Experian) score and does not constitute credit advice.
        </span>
      </p>
    );
  }

  return (
    <div
      className={cn(
        "p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20 flex items-start gap-3 text-xs text-slate-300",
        className
      )}
    >
      <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
        <ShieldCheck className="w-4 h-4" />
      </div>
      <div>
        <h4 className="font-bold text-slate-200 text-xs mb-0.5">Responsible Financial Intelligence & Disclaimer</h4>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          CreditLens Credit Health Scores, Risk Categories, and Copilot Insights are generated strictly for financial literacy, pattern awareness, and behavioral diagnostics. 
          CreditLens is <strong>not a credit reporting agency (such as CIBIL, Equifax, or Experian)</strong>, and outputs must not be treated as formal credit underwriting or investment advice.
        </p>
      </div>
    </div>
  );
}
