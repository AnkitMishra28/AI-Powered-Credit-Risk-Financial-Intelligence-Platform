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
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Credit Health", href: "/credit-health", icon: Activity },
  { label: "Risk Intelligence", href: "/risk-analysis", icon: ShieldCheck },
  { label: "Spending", href: "/spending", icon: CreditCard },
  { label: "Ask CreditLens", href: "/copilot", icon: Bot },
  { label: "Settings & Privacy", href: "/settings", icon: Settings },
];

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-xs bg-[#070B08] border-r border-white/10 h-full p-5 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-lime-400 p-[1.5px]">
                <div className="w-full h-full bg-[#050706] rounded-[9px] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <span className="font-extrabold text-white text-base">CreditLens</span>
            </div>
            <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white" aria-label="Close menu">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-5 space-y-1.5">
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
                      ? "bg-emerald-950/40 text-white border border-emerald-500/30 font-semibold"
                      : "text-neutral-300 hover:bg-[#101712] hover:text-white"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-emerald-400" : "text-neutral-400")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.08] text-xs text-neutral-500 text-center font-medium">
          CreditLens AI Financial Intelligence Platform
        </div>
      </div>
    </div>
  );
}
