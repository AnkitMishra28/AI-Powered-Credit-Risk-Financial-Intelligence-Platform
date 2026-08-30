"use client";

import React from "react";
import { FileText, FileSpreadsheet, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { StatementSummary } from "@/types";
import { formatDate } from "@/lib/utils";

interface StatementHistoryListProps {
  statements: StatementSummary[];
  onSelectStatement?: (statementId: string) => void;
}

export function StatementHistoryList({ statements, onSelectStatement }: StatementHistoryListProps) {
  if (statements.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-[#090D0A] border border-white/[0.08] text-center">
        <p className="text-xs text-neutral-400">No statements uploaded yet. Use the uploader above to ingest a statement.</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-[#090D0A] border border-white/[0.08] shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
        <h3 className="text-sm font-bold text-white tracking-tight">Connected Statements History</h3>
        <span className="text-xs text-neutral-400">{statements.length} file{statements.length > 1 ? "s" : ""}</span>
      </div>

      <div className="space-y-2.5">
        {statements.map((s) => {
          const isCsv = s.fileType === "csv";

          return (
            <div
              key={s.id}
              onClick={() => onSelectStatement && onSelectStatement(s.id)}
              className="p-3.5 rounded-xl bg-[#0E1510] border border-white/[0.07] hover:border-emerald-500/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isCsv ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                  }`}
                >
                  {isCsv ? <FileSpreadsheet className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>

                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                    {s.filename}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    {formatDate(s.uploadedAt)} • {s.transactionCount} transactions
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center gap-1.5 justify-end">
                  {s.status === "completed" && (
                    <span className="text-[10px] font-bold text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> Ingested
                    </span>
                  )}
                  {s.status === "processing" && (
                    <span className="text-[10px] font-bold text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-amber-400 animate-spin" /> Processing
                    </span>
                  )}
                  {s.status === "failed" && (
                    <span className="text-[10px] font-bold text-rose-300 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5 text-rose-400" /> Failed
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Outflows: <strong className="text-neutral-200">₹{s.totalDebits.toLocaleString()}</strong>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
