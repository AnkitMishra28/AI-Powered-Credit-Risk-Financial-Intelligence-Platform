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
    <Card className="fintech-gradient-emerald p-6 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-3.5 border-b border-emerald-500/20 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/25">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base text-white">Credit Health Score</CardTitle>
            <p className="text-xs text-neutral-400 font-medium">CreditLens Behavioral Diagnostic</p>
          </div>
        </div>

        {showActions && (
          <Link href="/credit-health">
            <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-300 hover:text-white text-xs py-1.5 px-3">
              Factor Breakdown
            </Button>
          </Link>
        )}
      </div>

      <div className="py-5 flex flex-col items-center">
        <RadialGauge
          score={creditHealth.healthScore}
          tier={creditHealth.scoreTier}
          delta={creditHealth.scoreDelta}
          size={230}
        />
      </div>

      <div className="bg-[#080D09]/80 rounded-xl p-3.5 border border-emerald-500/20 text-xs flex items-center justify-between mt-2">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs text-neutral-300">
            Top Factor: <strong className="text-white font-semibold">Payment History (92%)</strong>
          </span>
        </div>
        <span className="text-xs text-neutral-400 font-mono">Updated Mar 2026</span>
      </div>
    </Card>
  );
}
