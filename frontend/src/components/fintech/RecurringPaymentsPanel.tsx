"use client";

import React from "react";
import { Repeat, Calendar } from "lucide-react";
import { RecurringPayment } from "@/types";
import { formatINR } from "@/lib/utils";

interface RecurringPaymentsPanelProps {
  recurringPayments?: RecurringPayment[];
}

export function RecurringPaymentsPanel({ recurringPayments = [] }: RecurringPaymentsPanelProps) {
  if (!recurringPayments || recurringPayments.length === 0) {
    return null;
  }

  const totalMonthlyRecurring = recurringPayments.reduce((acc, r) => acc + r.estimatedAmount, 0);

  return (
    <div className="p-6 rounded-2xl bg-[#090D0A] border border-white/[0.08] shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Repeat className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Likely Recurring Payments & Subscriptions</h3>
            <p className="text-xs text-neutral-400">Detected regular commitments and subscription charges</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-neutral-400">Total Run-rate</span>
          <p className="text-sm font-bold text-emerald-400">{formatINR(totalMonthlyRecurring)} / mo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {recurringPayments.map((r) => (
          <div
            key={r.id}
            className="p-3.5 rounded-xl bg-[#0E1510] border border-white/[0.07] hover:border-emerald-500/30 transition-all flex flex-col justify-between gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white truncate max-w-[140px]">{r.merchant}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                {r.frequency}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-neutral-400 text-[11px]">{r.category}</span>
              <span className="font-bold text-neutral-100">{formatINR(r.estimatedAmount)}</span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1 border-t border-white/[0.04]">
              <span className="flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5 text-neutral-500" />
                Last: {r.lastPaymentDate}
              </span>
              <span className="text-emerald-400/90 font-semibold">{Math.round(r.confidence * 100)}% Match</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
