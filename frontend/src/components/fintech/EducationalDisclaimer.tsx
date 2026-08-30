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
      <p className={cn("text-xs text-neutral-400 flex items-center gap-2", className)}>
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong className="text-neutral-300">Educational Metric</strong>: CreditLens is NOT an official credit bureau (CIBIL/Experian) score and does not constitute credit advice.
        </span>
      </p>
    );
  }

  return (
    <div
      className={cn(
        "p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-3.5 text-xs text-neutral-300",
        className
      )}
    >
      <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0 mt-0.5 border border-emerald-500/20">
        <ShieldCheck className="w-4 h-4" />
      </div>
      <div>
        <h4 className="font-bold text-white text-xs mb-1">Responsible Financial Intelligence & Educational Notice</h4>
        <p className="text-xs text-neutral-400 leading-relaxed">
          CreditLens Credit Health Scores, Risk Ratings, and Copilot Insights are generated strictly for financial literacy, pattern awareness, and behavioral diagnostics. 
          CreditLens is <strong className="text-neutral-300">not a credit reporting agency (such as CIBIL, Equifax, or Experian)</strong>, and outputs must not be treated as formal credit underwriting or investment advice.
        </p>
      </div>
    </div>
  );
}
