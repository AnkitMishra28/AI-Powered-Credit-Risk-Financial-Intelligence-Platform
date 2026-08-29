"use client";

import React, { useState } from "react";
import { Transaction } from "@/types";
import { formatINR, formatDate } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Search,
  ShoppingBag,
  Utensils,
  Car,
  Tv,
  Zap,
  HeartPulse,
  CreditCard
} from "lucide-react";

export interface TransactionTableProps {
  transactions: Transaction[];
  title?: string;
  limit?: number;
  showFilters?: boolean;
}

export function TransactionTable({
  transactions,
  title = "Recent Transactions",
  limit,
  showFilters = true,
}: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const getCategoryIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes("food") || c.includes("dining")) return <Utensils className="w-3.5 h-3.5 text-emerald-400" />;
    if (c.includes("shop")) return <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />;
    if (c.includes("transport") || c.includes("fuel")) return <Car className="w-3.5 h-3.5 text-amber-400" />;
    if (c.includes("entertainment")) return <Tv className="w-3.5 h-3.5 text-pink-400" />;
    if (c.includes("utilities") || c.includes("bills")) return <Zap className="w-3.5 h-3.5 text-purple-400" />;
    if (c.includes("health")) return <HeartPulse className="w-3.5 h-3.5 text-cyan-400" />;
    return <CreditCard className="w-3.5 h-3.5 text-slate-400" />;
  };

  const filtered = transactions
    .filter((tx) => {
      const matchesSearch =
        tx.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || tx.category.toLowerCase().includes(selectedCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    })
    .slice(0, limit || transactions.length);

  const categories = ["All", "Food & Dining", "Shopping", "Transport & Fuel", "Entertainment", "Utilities & Bills", "Healthcare"];

  return (
    <Card className="p-5 md:p-6 bg-slate-900/90">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3 mb-4">
        <div>
          <CardTitle className="text-base text-slate-100">{title}</CardTitle>
          <p className="text-xs text-slate-400">Classified transaction ledger</p>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search merchant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950/80 text-xs text-slate-200 placeholder:text-slate-500 rounded-xl pl-8 pr-3 py-1.5 border border-slate-800 focus:outline-none focus:border-blue-500 w-36 md:w-44"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950/80 text-xs text-slate-300 rounded-xl px-2.5 py-1.5 border border-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table responsive view */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 pl-1">Merchant & Category</th>
              <th className="pb-3 hidden sm:table-cell">Account</th>
              <th className="pb-3 hidden md:table-cell">Date</th>
              <th className="pb-3 text-right">Amount</th>
              <th className="pb-3 text-right pr-1">Signal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors group">
                <td className="py-3 pl-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0">
                      {getCategoryIcon(tx.category)}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-100 block group-hover:text-blue-300 transition-colors">
                        {tx.merchant}
                      </span>
                      <span className="text-[10px] text-slate-400">{tx.category}</span>
                    </div>
                  </div>
                </td>

                <td className="py-3 hidden sm:table-cell text-slate-400 text-[11px]">
                  {tx.accountType}
                </td>

                <td className="py-3 hidden md:table-cell text-slate-400 text-[11px] font-mono">
                  {formatDate(tx.date)}
                </td>

                <td className="py-3 text-right font-mono font-bold text-slate-100">
                  {formatINR(tx.amount, true)}
                </td>

                <td className="py-3 text-right pr-1">
                  {tx.isAnomaly ? (
                    <Badge variant="amber" size="sm" showDot>
                      {tx.anomalyReason || "Anomaly"}
                    </Badge>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-medium">Standard</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-500">
            No transactions matching filter criteria.
          </div>
        )}
      </div>
    </Card>
  );
}
