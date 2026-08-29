"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { DemoBanner } from "./DemoBanner";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
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
