"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCreditLens } from "@/context/CreditLensContext";
import {
  Bell,
  Search,
  SlidersHorizontal,
  LogOut,
  Menu,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const { user, isDemoMode, toggleDemoMode, logout } = useAuth();
  const { notifications, unreadNotificationCount, markNotificationAsRead } = useCreditLens();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 bg-[#050706]/90 border-b border-white/[0.07] px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      {/* Left: Mobile trigger & Search bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-[#101712] text-neutral-300 hover:text-white border border-white/10"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center relative w-64 md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search metrics, transactions, risk models..."
            className="w-full bg-[#0E1510] text-xs text-neutral-200 placeholder:text-neutral-500 rounded-xl pl-9 pr-4 py-2 border border-white/10 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions, Demo switch, Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Demo Mode Switcher */}
        <div className="flex items-center gap-2 bg-[#0E1510] border border-white/10 rounded-xl px-3 py-1.5 shadow-inner">
          <span className="text-xs font-semibold text-neutral-300 hidden md:inline">Demo Data:</span>
          <button
            onClick={toggleDemoMode}
            className={`text-xs font-bold px-2.5 py-0.5 rounded-lg transition-all flex items-center gap-1 ${
              isDemoMode
                ? "bg-emerald-500 text-[#050706] shadow-sm shadow-emerald-500/20 font-extrabold"
                : "bg-[#141F17] text-neutral-400 hover:text-neutral-200"
            }`}
          >
            {isDemoMode && <Sparkles className="w-3 h-3" />}
            {isDemoMode ? "ON" : "OFF"}
          </button>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-[#0E1510] border border-white/10 text-neutral-300 hover:text-white hover:border-emerald-500/40 transition-all"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[#050706] text-xs font-black flex items-center justify-center animate-pulse">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0B110D] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
                <span className="text-xs font-bold text-white">Intelligence Alerts</span>
                <span className="text-xs font-medium text-neutral-400">{notifications.length} alerts</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationAsRead(n.id)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      n.read
                        ? "bg-[#080D09]/60 border-white/5 text-neutral-400"
                        : "bg-[#101712] border-emerald-500/20 text-neutral-200 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{n.title}</span>
                      <span className="text-xs text-neutral-400">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-1 leading-snug">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl bg-[#0E1510] border border-white/10 hover:border-emerald-500/40 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-lime-400 p-[1px]">
              <div className="w-full h-full bg-[#070B08] rounded-[6px] flex items-center justify-center text-xs font-bold text-emerald-300">
                {user?.fullName ? user.fullName.charAt(0) : "A"}
              </div>
            </div>
            <span className="text-xs font-semibold text-neutral-200 hidden md:inline">{user?.fullName?.split(" ")[0]}</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0B110D] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
              <div className="px-3 py-2 border-b border-white/[0.08]">
                <p className="font-bold text-white text-sm">{user?.fullName}</p>
                <p className="text-xs text-neutral-400 truncate mt-0.5">{user?.email}</p>
              </div>
              <Link
                href="/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-neutral-300 hover:text-white hover:bg-[#101712] transition-colors mt-1 font-medium"
              >
                <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
                Settings & Governance
              </Link>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-950/30 transition-colors mt-1 text-left font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
