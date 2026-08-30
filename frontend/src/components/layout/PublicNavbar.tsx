"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TrendingUp, ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="h-20 bg-[#050706]/85 border-b border-white/[0.07] px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 backdrop-blur-lg">
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-lime-400 p-[1.5px] shadow-lg shadow-emerald-950/60 group-hover:shadow-emerald-900/80 transition-all">
          <div className="w-full h-full bg-[#050706] rounded-[10px] flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg tracking-tight text-white">CreditLens</span>
            <span className="text-xs font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">AI</span>
          </div>
          <p className="text-xs text-neutral-400 font-medium">Financial Intelligence</p>
        </div>
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
        <Link href="#features" className="hover:text-emerald-400 transition-colors">
          Intelligence Console
        </Link>
        <Link href="#how-it-works" className="hover:text-emerald-400 transition-colors">
          How It Works
        </Link>
        <Link href="#explainable-ai" className="hover:text-emerald-400 transition-colors">
          Responsible AI
        </Link>
        <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Interactive Demo
        </Link>
      </div>

      {/* Action CTA */}
      <div className="hidden md:flex items-center gap-3">
        <Link href="/login">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Launch Console
          </Button>
        </Link>
      </div>

      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2.5 rounded-xl bg-[#0E1510] border border-white/10 text-neutral-300"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-[#070B08] border-b border-white/10 p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 shadow-2xl">
          <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-neutral-200">
            Intelligence Console
          </Link>
          <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-neutral-200">
            How It Works
          </Link>
          <Link href="#explainable-ai" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-neutral-200">
            Responsible AI
          </Link>
          <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-2.5">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" className="w-full">
                Launch Live Demo
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
