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
    if (c.includes("food") || c.includes("dining")) return <Utensils className="w-4 h-4 text-emerald-400" />;
    if (c.includes("shop")) return <ShoppingBag className="w-4 h-4 text-sky-400" />;
    if (c.includes("transport") || c.includes("fuel")) return <Car className="w-4 h-4 text-amber-400" />;
    if (c.includes("entertainment")) return <Tv className="w-4 h-4 text-pink-400" />;
    if (c.includes("utilities") || c.includes("bills")) return <Zap className="w-4 h-4 text-emerald-300" />;
    if (c.includes("health")) return <HeartPulse className="w-4 h-4 text-rose-400" />;
    return <CreditCard className="w-4 h-4 text-neutral-400" />;
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
    <Card className="p-5 md:p-6 bg-[#0B110D] border-white/10">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-white/[0.08] gap-3 mb-4">
        <div>
          <CardTitle className="text-base text-white">{title}</CardTitle>
          <p className="text-xs text-neutral-400 mt-0.5">Classified transaction ledger & pattern signals</p>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search merchant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#0E1510] text-xs text-white placeholder:text-neutral-500 rounded-xl pl-9 pr-3.5 py-2 border border-white/10 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 w-40 md:w-52"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#0E1510] text-xs text-neutral-200 rounded-xl px-3 py-2 border border-white/10 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[#0B110D] text-neutral-200">
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
            <tr className="border-b border-white/[0.08] text-xs font-bold text-neutral-400 uppercase tracking-wider">
              <th className="pb-3 pl-2">Merchant & Category</th>
              <th className="pb-3 hidden sm:table-cell">Account</th>
              <th className="pb-3 hidden md:table-cell">Date</th>
              <th className="pb-3 text-right">Amount</th>
              <th className="pb-3 text-right pr-2">Signal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {filtered.map((tx) => (
              <tr key={tx.id} className="hover:bg-[#101712] transition-colors group">
                <td className="py-3.5 pl-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#121A14] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-emerald-500/30 transition-colors">
                      {getCategoryIcon(tx.category)}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-white block group-hover:text-emerald-300 transition-colors">
                        {tx.merchant}
                      </span>
                      <span className="text-xs text-neutral-400">{tx.category}</span>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 hidden sm:table-cell text-neutral-300 text-xs">
                  {tx.accountType}
                </td>

                <td className="py-3.5 hidden md:table-cell text-neutral-400 text-xs font-mono">
                  {formatDate(tx.date)}
                </td>

                <td className="py-3.5 text-right font-mono font-bold text-sm text-white">
                  {formatINR(tx.amount, true)}
                </td>

                <td className="py-3.5 text-right pr-2">
                  {tx.isAnomaly ? (
                    <Badge variant="amber" size="sm" showDot>
                      {tx.anomalyReason || "Anomaly"}
                    </Badge>
                  ) : (
                    <span className="text-xs text-neutral-400 font-medium">Standard</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-10 text-xs text-neutral-400">
            No transactions found matching your criteria.
          </div>
        )}
      </div>
    </Card>
  );
}
