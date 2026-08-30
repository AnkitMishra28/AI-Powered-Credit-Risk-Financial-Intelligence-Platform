"use client";

import React, { useState } from "react";
import {
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  Tag,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Transaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TransactionLedgerProps {
  transactions: Transaction[];
  totalCount?: number;
  onFilterChange?: (category?: string, txnType?: string, search?: string) => void;
  isLoading?: boolean;
}

const CATEGORIES = [
  "All",
  "Food & Dining",
  "Shopping",
  "Transport",
  "Entertainment",
  "Healthcare",
  "Utilities",
  "Rent & Housing",
  "Groceries",
  "Salary / Income",
  "EMI / Loan",
  "Transfer",
  "Other",
];

export function TransactionLedger({
  transactions,
  totalCount,
  onFilterChange,
  isLoading = false,
}: TransactionLedgerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState<"all" | "debit" | "credit">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Local filtering if no server-side handler provided
  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      searchTerm === "" ||
      tx.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.originalDescription && tx.originalDescription.toLowerCase().includes(searchTerm.toLowerCase())) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || tx.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesType =
      selectedType === "all" || (tx.transactionType || "debit").toLowerCase() === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const displayTotal = totalCount !== undefined ? Math.max(totalCount, filtered.length) : filtered.length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    setCurrentPage(1);
    if (onFilterChange) {
      onFilterChange(
        selectedCategory !== "All" ? selectedCategory : undefined,
        selectedType !== "all" ? selectedType : undefined,
        val || undefined
      );
    }
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    if (onFilterChange) {
      onFilterChange(
        cat !== "All" ? cat : undefined,
        selectedType !== "all" ? selectedType : undefined,
        searchTerm || undefined
      );
    }
  };

  const handleTypeChange = (type: "all" | "debit" | "credit") => {
    setSelectedType(type);
    setCurrentPage(1);
    if (onFilterChange) {
      onFilterChange(
        selectedCategory !== "All" ? selectedCategory : undefined,
        type !== "all" ? type : undefined,
        searchTerm || undefined
      );
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[#090D0A] border border-white/[0.08] shadow-xl space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">Normalized Transaction Ledger</h3>
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />}
          </div>
          <p className="text-xs text-neutral-400">
            Canonical merchant extraction, category taxonomy, and statistical anomaly tags
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search merchant, nar..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0E1510] border border-white/[0.1] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#0E1510] border border-white/[0.1] text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-[#090D0A] text-neutral-200">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Type Toggle */}
          <div className="flex items-center rounded-lg bg-[#0E1510] border border-white/[0.1] p-0.5 text-xs font-semibold">
            <button
              onClick={() => handleTypeChange("all")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedType === "all" ? "bg-emerald-500/20 text-emerald-300 font-bold" : "text-neutral-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleTypeChange("debit")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedType === "debit" ? "bg-rose-500/20 text-rose-300 font-bold" : "text-neutral-400 hover:text-white"
              }`}
            >
              Debits
            </button>
            <button
              onClick={() => handleTypeChange("credit")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedType === "credit" ? "bg-emerald-500/20 text-emerald-300 font-bold" : "text-neutral-400 hover:text-white"
              }`}
            >
              Credits
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-neutral-400 border-b border-white/[0.06] uppercase tracking-wider font-semibold">
              <th className="pb-3 pl-2">Date</th>
              <th className="pb-3">Merchant / Narration</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">Method & Confidence</th>
              <th className="pb-3 text-right pr-2">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-neutral-500">
                  {isLoading ? "Loading transactions..." : "No transactions found matching the selected filters."}
                </td>
              </tr>
            )}

            {paginated.map((tx) => {
              const isCredit = tx.transactionType === "credit";

              return (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                  {/* Date */}
                  <td className="py-3 pl-2 text-neutral-400 font-medium whitespace-nowrap">
                    {formatDate(tx.date)}
                  </td>

                  {/* Merchant & Original Narration */}
                  <td className="py-3 max-w-[260px]">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isCredit ? "bg-emerald-500/10 text-emerald-400" : "bg-white/[0.04] text-neutral-300"
                        }`}
                      >
                        {isCredit ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-white truncate text-xs">{tx.merchant}</p>
                          {tx.isAnomaly && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-0.5 shrink-0">
                              <AlertTriangle className="w-2.5 h-2.5" /> Anomaly
                            </span>
                          )}
                        </div>
                        {tx.originalDescription && (
                          <p className="text-[10px] text-neutral-400 truncate max-w-[240px]" title={tx.originalDescription}>
                            {tx.originalDescription}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-neutral-300 font-medium text-[11px]">
                      <Tag className="w-2.5 h-2.5 text-emerald-400" />
                      {tx.category}
                    </span>
                  </td>

                  {/* Classification Method & Confidence */}
                  <td className="py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-neutral-400 capitalize">
                        {(tx.classificationMethod || "merchant_rule").replace("_", " ")}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                        {Math.round((tx.confidence ?? 0.95) * 100)}%
                      </span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-3 text-right pr-2 whitespace-nowrap">
                    <span
                      className={`font-bold text-xs ${
                        isCredit ? "text-emerald-400" : "text-neutral-100"
                      }`}
                    >
                      {isCredit ? "+" : "-"}{formatCurrency(tx.amount)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs text-neutral-400">
        <span>
          Showing {paginated.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
          {Math.min(currentPage * pageSize, filtered.length)} of {displayTotal} transactions
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.1]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 py-1 text-xs font-semibold text-neutral-300">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.1]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
