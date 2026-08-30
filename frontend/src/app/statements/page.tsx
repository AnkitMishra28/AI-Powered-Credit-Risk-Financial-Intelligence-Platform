"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatementUploader } from "@/components/fintech/StatementUploader";
import { StatementHistoryList } from "@/components/fintech/StatementHistoryList";
import { TransactionLedger } from "@/components/fintech/TransactionLedger";
import { StatementSummary, Transaction } from "@/types";
import { getStatements, getTransactions } from "@/services/statementService";
import { FileText, RefreshCw } from "lucide-react";

export default function StatementsPage() {
  const [statements, setStatements] = useState<StatementSummary[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [stmtList, txnData] = await Promise.all([
        getStatements(),
        getTransactions({ limit: 100 }),
      ]);
      setStatements(stmtList);
      setTransactions(txnData.items);
    } catch (e) {
      console.error("Failed to fetch statements/transactions:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getStatements(),
      getTransactions({ limit: 100 }),
    ]).then(([stmtList, txnData]) => {
      if (isMounted) {
        setStatements(stmtList);
        setTransactions(txnData.items);
        setLoading(false);
      }
    }).catch((e) => {
      if (isMounted) {
        console.error("Failed to fetch initial statements/transactions:", e);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUploadSuccess = () => {
    void refreshData();
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Financial Statement Ingestion"
          subtitle="Upload bank and credit card statements (CSV/PDF) to extract, normalize, and categorize real financial cashflows."
          badge="Deterministic Pipeline"
          actions={
            <button
              onClick={() => void refreshData()}
              className="px-3.5 py-1.5 rounded-xl bg-[#0E1510] border border-white/[0.1] text-xs font-semibold text-neutral-300 hover:text-white hover:border-emerald-500/30 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
              <span>Refresh Ledger</span>
            </button>
          }
        />

        {/* Top Grid: Uploader & History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StatementUploader onUploadSuccess={handleUploadSuccess} />
          </div>

          <div className="lg:col-span-1">
            <StatementHistoryList statements={statements} />
          </div>
        </div>

        {/* Bottom Section: Transaction Ledger */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">Extracted Transaction Ledger</h2>
            </div>
          </div>

          <TransactionLedger transactions={transactions} isLoading={loading} />
        </div>
      </div>
    </AppLayout>
  );
}
