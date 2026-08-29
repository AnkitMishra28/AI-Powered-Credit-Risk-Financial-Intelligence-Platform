"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, ShieldAlert } from "lucide-react";
import Link from "next/link";

export function DemoBanner() {
  const { isDemoMode } = useAuth();

  if (!isDemoMode) return null;

  return (
    <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border-b border-blue-500/30 px-4 py-2 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2 z-40 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-400/30 text-[11px]">
          <Sparkles className="w-3 h-3 text-blue-400 animate-spin" style={{ animationDuration: "6s" }} />
          DEMO PROFILE ACTIVE
        </span>
        <span className="hidden sm:inline text-slate-400">
          Showing structured portfolio demo metrics for <strong className="text-slate-200">Alex Mercer</strong>.
        </span>
      </div>

      <div className="flex items-center gap-3 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          Educational Intelligence — Not CIBIL / Not Financial Advice
        </span>
        <Link
          href="/onboarding"
          className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2"
        >
          Setup Real Data
        </Link>
      </div>
    </div>
  );
}
