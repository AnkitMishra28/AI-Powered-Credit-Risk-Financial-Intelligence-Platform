"use client";

import React from "react";
import { MonthlySpendTrend } from "@/types";
import { formatINR } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/Card";
import { BarChart3, TrendingDown } from "lucide-react";

export interface SpendingTrendChartProps {
  trend: MonthlySpendTrend[];
  averageSpend: number;
}

export function SpendingTrendChart({ trend, averageSpend }: SpendingTrendChartProps) {
  const maxAmount = Math.max(...trend.map((t) => Math.max(t.amount, t.budget)), 60000);

  return (
    <Card className="p-6 bg-slate-900/90 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base text-slate-100">Monthly Spending Velocity</CardTitle>
            <p className="text-xs text-slate-400">6-month trend vs ₹50,000 budget target</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">6-Month Rolling Avg</span>
          <span className="text-sm font-bold text-slate-200 font-mono">
            {formatINR(averageSpend)}
          </span>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="pt-6 pb-2">
        <div className="h-44 flex items-end justify-between gap-3 px-2 border-b border-slate-800 relative">
          {/* Target Budget Line */}
          <div
            className="absolute left-0 right-0 border-t border-dashed border-slate-600 z-0 pointer-events-none flex justify-end pr-2"
            style={{ bottom: `${(50000 / maxAmount) * 100}%` }}
          >
            <span className="text-[10px] text-slate-400 bg-slate-900 px-1 -mt-2.5 font-mono">
              Budget ₹50k
            </span>
          </div>

          {trend.map((point) => {
            const heightPct = (point.amount / maxAmount) * 100;
            const isOverBudget = point.amount > point.budget;

            return (
              <div key={point.month} className="flex-1 flex flex-col items-center gap-2 z-10 group">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 bg-slate-800 text-[10px] font-mono text-white px-2 py-1 rounded-md border border-slate-700 pointer-events-none whitespace-nowrap shadow-xl">
                  {formatINR(point.amount)} ({point.amount > point.budget ? "+Over" : "Under"})
                </div>

                {/* Vertical Bar */}
                <div className="w-full max-w-[36px] bg-slate-800/80 rounded-t-lg overflow-hidden flex flex-col justify-end h-36 p-0.5">
                  <div
                    className={`w-full rounded-t-md transition-all duration-700 ${
                      isOverBudget
                        ? "bg-gradient-to-t from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                        : "bg-gradient-to-t from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>

                <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200">
                  {point.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 text-[11px] text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
            Within Budget
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            Over Budget
          </span>
        </div>
        <span className="text-emerald-400 font-semibold flex items-center gap-1">
          <TrendingDown className="w-3.5 h-3.5" /> -4.2% MoM
        </span>
      </div>
    </Card>
  );
}
