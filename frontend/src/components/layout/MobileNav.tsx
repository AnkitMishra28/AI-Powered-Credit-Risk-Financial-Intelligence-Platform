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
  X,
  TrendingUp
} from "lucide-react";

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Credit Health", href: "/credit-health", icon: Activity },
  { label: "Risk Analysis", href: "/risk-analysis", icon: ShieldCheck },
  { label: "Spending Intelligence", href: "/spending", icon: CreditCard },
  { label: "Ask CreditLens", href: "/copilot", icon: Bot },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-xs bg-slate-900 border-r border-slate-800 h-full p-5 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-bold text-white text-base">CreditLens</span>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white" aria-label="Close menu">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-5 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                      : "text-slate-300 hover:bg-slate-800"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          CreditLens AI Platform v1.0
        </div>
      </div>
    </div>
  );
}
