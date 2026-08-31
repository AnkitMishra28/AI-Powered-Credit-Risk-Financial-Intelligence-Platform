"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { DemoBanner } from "./DemoBanner";
import { useAuth } from "@/context/AuthContext";

/**
 * Wraps every authenticated screen. Acts as the client-side route guard: an
 * unauthenticated visitor (no session, expired token, or just-logged-out) is
 * redirected to /login and NEVER sees protected content painted. The backend
 * independently rejects unauthenticated API calls with 401 — this guard is the
 * UX layer, not the security boundary.
 */
export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    // Minimal, data-free placeholder while the redirect to /login happens.
    return (
      <div className="min-h-screen bg-[#050706] flex items-center justify-center">
        <div className="flex items-center gap-3 text-neutral-400 text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Loading your secure workspace…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050706] text-[#F9FAFB] flex flex-col">
      {/* Top Demo Banner */}
      <DemoBanner />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Navigation Drawer */}
        <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
