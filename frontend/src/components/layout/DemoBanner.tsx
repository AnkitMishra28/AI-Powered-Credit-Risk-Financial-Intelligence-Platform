"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, ShieldAlert } from "lucide-react";
import Link from "next/link";

export function DemoBanner() {
  const { isDemoMode } = useAuth();

  if (!isDemoMode) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-950/50 via-[#0A100C] to-emerald-950/40 border-b border-emerald-500/25 px-4 py-2.5 text-xs text-neutral-300 flex flex-wrap items-center justify-between gap-3 z-40 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30 text-xs shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: "6s" }} />
          DEMO PROFILE ACTIVE
        </span>
        <span className="hidden sm:inline text-neutral-400 text-xs">
          Showing structured portfolio demo metrics for <strong className="text-white">Alex Mercer</strong>.
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-neutral-400">
        <span className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Educational Intelligence — Not CIBIL / Not Financial Advice</span>
        </span>
        <Link
          href="/onboarding"
          className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4"
        >
          Setup Real Data
        </Link>
      </div>
    </div>
  );
}
