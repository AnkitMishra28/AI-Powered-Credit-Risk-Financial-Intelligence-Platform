"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCreditLens } from "@/context/CreditLensContext";
import {
  Bell,
  Search,
  SlidersHorizontal,
  LogOut,
  Menu
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
    <header className="h-16 bg-[#090D16]/90 border-b border-slate-800/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      {/* Left: Mobile trigger & Search bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-slate-800/60 text-slate-300 hover:text-white border border-slate-700/60"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center relative w-64 md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search metrics, transactions, loans..."
            className="w-full bg-slate-900/80 text-xs text-slate-200 placeholder:text-slate-500 rounded-xl pl-9 pr-4 py-2 border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions, Demo switch, Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Demo Mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
          <span className="text-[11px] font-semibold text-slate-300 hidden md:inline">Demo Data:</span>
          <button
            onClick={toggleDemoMode}
            className={`text-[11px] font-bold px-2 py-0.5 rounded-lg transition-all ${
              isDemoMode
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {isDemoMode ? "ON" : "OFF"}
          </button>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-100">Intelligence Alerts</span>
                <span className="text-[10px] font-medium text-slate-400">{notifications.length} alerts</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationAsRead(n.id)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      n.read
                        ? "bg-slate-900/40 border-slate-800 text-slate-400"
                        : "bg-slate-800/80 border-slate-700 text-slate-200 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{n.title}</span>
                      <span className="text-[9px] text-slate-500">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{n.message}</p>
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
            className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-400 p-[1px]">
              <div className="w-full h-full bg-slate-900 rounded-[6px] flex items-center justify-center text-xs font-bold text-white">
                {user?.fullName ? user.fullName.charAt(0) : "A"}
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-200 hidden md:inline">{user?.fullName?.split(" ")[0]}</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="font-bold text-slate-200">{user?.fullName}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
              <Link
                href="/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors mt-1"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                Settings & Privacy
              </Link>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors mt-1 text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
