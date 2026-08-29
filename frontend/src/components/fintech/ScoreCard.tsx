import React from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { RadialGauge } from "@/components/ui/RadialGauge";
import { CreditHealthData } from "@/types";
import { ShieldCheck, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export interface ScoreCardProps {
  creditHealth: CreditHealthData;
  showActions?: boolean;
}

export function ScoreCard({ creditHealth, showActions = true }: ScoreCardProps) {
  return (
    <Card className="fintech-gradient-blue p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-blue-500/20 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base text-slate-100">Credit Health Score</CardTitle>
            <p className="text-[10px] text-blue-300 font-medium">CreditLens Diagnostic Indicator</p>
          </div>
        </div>

        {showActions && (
          <Link href="/credit-health">
            <Button size="sm" variant="outline" className="border-blue-500/30 text-blue-300 text-xs py-1">
              View Breakdown
            </Button>
          </Link>
        )}
      </div>

      <div className="py-4 flex flex-col items-center">
        <RadialGauge
          score={creditHealth.healthScore}
          tier={creditHealth.scoreTier}
          delta={creditHealth.scoreDelta}
          size={220}
        />
      </div>

      <div className="bg-slate-900/80 rounded-xl p-3 border border-blue-500/20 text-xs flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[11px] text-slate-300">
            Top Factor: <strong>Payment History (92%)</strong>
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Updated Mar 2026</span>
      </div>
    </Card>
  );
}
