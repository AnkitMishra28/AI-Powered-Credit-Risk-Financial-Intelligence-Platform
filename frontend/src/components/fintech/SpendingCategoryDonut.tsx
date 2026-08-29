"use client";

import React from "react";
import { CategorySpend } from "@/types";
import { formatINR } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/Card";
import { PieChart as PieIcon } from "lucide-react";

export interface SpendingCategoryDonutProps {
  categories: CategorySpend[];
  totalSpending: number;
}

export function SpendingCategoryDonut({ categories, totalSpending }: SpendingCategoryDonutProps) {
  return (
    <Card className="p-6 bg-slate-900/90 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base text-slate-100">Category Allocations</CardTitle>
            <p className="text-xs text-slate-400">Monthly spending distribution</p>
          </div>
        </div>

        <span className="font-mono text-sm font-bold text-slate-200">
          {formatINR(totalSpending)}
        </span>
      </div>

      {/* Visual Category Distribution Bar & List */}
      <div className="space-y-3">
        {/* Multi-segment allocation bar */}
        <div className="h-3.5 w-full bg-slate-800 rounded-xl overflow-hidden flex p-0.5 gap-0.5 shadow-inner">
          {categories.map((cat) => (
            <div
              key={cat.category}
              className="h-full rounded-sm transition-all duration-500 hover:opacity-80"
              style={{
                width: `${cat.percentage}%`,
                backgroundColor: cat.color,
              }}
              title={`${cat.category}: ${formatINR(cat.amount)} (${cat.percentage}%)`}
            />
          ))}
        </div>

        {/* Categories Breakdown Ledger */}
        <div className="space-y-2 pt-2">
          {categories.map((cat) => {
            const isIncrease = cat.monthOverMonthChangePct > 0;
            return (
              <div
                key={cat.category}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:border-slate-700 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-medium text-slate-200">{cat.category}</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-bold text-slate-100 font-mono block">
                      {formatINR(cat.amount)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {cat.percentage}% of total
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-semibold flex items-center px-1.5 py-0.5 rounded-md ${
                      isIncrease
                        ? "bg-rose-500/10 text-rose-400"
                        : "bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {isIncrease ? "+" : ""}
                    {cat.monthOverMonthChangePct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
