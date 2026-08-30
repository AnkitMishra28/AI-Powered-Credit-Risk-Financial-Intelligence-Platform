"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Activity,
  ShieldCheck,
  CreditCard,
  Bot,
  Settings,
  TrendingUp,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    label: "Credit Health",
    href: "/credit-health",
    icon: Activity,
    badge: "742",
    badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
  {
    label: "Risk Intelligence",
    href: "/risk-analysis",
    icon: ShieldCheck,
    badge: "Low Risk",
    badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
  {
    label: "Spending",
    href: "/spending",
    icon: CreditCard,
    badge: "Anomaly",
    badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
  {
    label: "Ask CreditLens",
    href: "/copilot",
    icon: Bot,
    badge: "Copilot",
    badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
];

const SECONDARY_NAV = [
  {
    label: "Settings & Privacy",
    href: "/settings",
    icon: Settings,
    badge: null,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isDemoMode } = useAuth();

  return (
    <aside className="w-64 bg-[#070B08] border-r border-white/[0.07] flex flex-col shrink-0 h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/[0.07]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-lime-400 p-[1.5px] shadow-lg shadow-emerald-950/60 group-hover:shadow-emerald-900/80 transition-all">
            <div className="w-full h-full bg-[#050706] rounded-[10px] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400 transition-transform group-hover:scale-110" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">CreditLens</span>
              <span className="text-xs font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">AI</span>
            </div>
            <p className="text-xs text-neutral-400 font-medium tracking-tight">Financial Intelligence</p>
          </div>
        </Link>
      </div>

      {/* Primary Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        <div className="px-3 pb-2 text-xs font-bold tracking-wider text-neutral-500 uppercase">
          Intelligence Console
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-emerald-950/40 text-white border border-emerald-500/30 font-semibold shadow-sm shadow-emerald-950/30"
                  : "text-neutral-400 hover:text-neutral-100 hover:bg-[#101712]"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors shrink-0",
                    isActive ? "text-emerald-400" : "text-neutral-400 group-hover:text-neutral-200"
                  )}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-md font-semibold border",
                    item.badgeColor
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Secondary Navigation Group */}
        <div className="pt-4 mt-4 border-t border-white/[0.06]">
          <div className="px-3 pb-2 text-xs font-bold tracking-wider text-neutral-500 uppercase">
            Platform & Governance
          </div>

          {SECONDARY_NAV.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-emerald-950/40 text-white border border-emerald-500/30 font-semibold shadow-sm"
                    : "text-neutral-400 hover:text-neutral-100 hover:bg-[#101712]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors shrink-0",
                      isActive ? "text-emerald-400" : "text-neutral-400 group-hover:text-neutral-200"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* User / Demo Account Box */}
      <div className="p-3 border-t border-white/[0.07] bg-[#050706]">
        <div className="p-2.5 rounded-xl bg-[#0E1510] border border-white/[0.08] flex items-center justify-between hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-lime-400 p-[1px] shrink-0">
              <div className="w-full h-full bg-[#070B08] rounded-[7px] flex items-center justify-center text-xs font-bold text-emerald-300">
                {user?.fullName ? user.fullName.charAt(0) : "U"}
              </div>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-neutral-200 truncate">{user?.fullName || "User"}</p>
              <p className="text-xs text-neutral-400 flex items-center gap-1 truncate">
                {isDemoMode && (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Demo Profile
                  </span>
                )}
                {!isDemoMode && "Connected Account"}
              </p>
            </div>
          </div>
          <Link href="/settings" className="text-neutral-500 hover:text-neutral-200 p-1">
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
