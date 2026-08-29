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
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    label: "Credit Health",
    href: "/credit-health",
    icon: Activity,
    badge: "742",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    label: "Risk Analysis",
    href: "/risk-analysis",
    icon: ShieldCheck,
    badge: "Low Risk",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  {
    label: "Spending Intelligence",
    href: "/spending",
    icon: CreditCard,
    badge: "Anomaly",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  {
    label: "Ask CreditLens",
    href: "/copilot",
    icon: Bot,
    badge: "AI Copilot",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
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
    <aside className="w-64 bg-[#0B101B] border-r border-slate-800/80 flex flex-col shrink-0 h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 p-[1.5px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400 transition-transform group-hover:scale-110" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">CreditLens</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">AI</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight">Risk & Financial Intel</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
          Intelligence Suite
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group",
                isActive
                  ? "bg-blue-600/15 text-blue-300 border border-blue-500/30 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-md font-semibold border",
                    item.badgeColor
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* User / Demo Account Box */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-blue-500 p-[1px] shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[7px] flex items-center justify-center text-xs font-bold text-slate-200">
                {user?.fullName ? user.fullName.charAt(0) : "U"}
              </div>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.fullName || "User"}</p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                {isDemoMode && <span className="text-blue-400 font-semibold">Demo Mode</span>}
                {!isDemoMode && "Connected Account"}
              </p>
            </div>
          </div>
          <Link href="/settings" className="text-slate-500 hover:text-slate-300 p-1">
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
