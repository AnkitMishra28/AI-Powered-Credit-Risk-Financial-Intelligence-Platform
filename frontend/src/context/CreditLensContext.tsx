"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  CreditHealthData,
  RiskAnalysisData,
  SpendingIntelligenceData,
  FinancialProfile,
  InsightNotification,
} from "@/types";
import {
  DEMO_CREDIT_HEALTH,
  DEMO_RISK_ANALYSIS,
  DEMO_SPENDING_INTELLIGENCE,
  DEMO_FINANCIAL_PROFILE,
  DEMO_NOTIFICATIONS,
} from "@/lib/demo-data";
import { creditService } from "@/services/creditService";
import { riskService } from "@/services/riskService";
import { spendingService } from "@/services/spendingService";
import type { DataResult, SectionStatus } from "@/services/api";
import { useAuth } from "./AuthContext";

/**
 * Per-section data state. `status` is the single source of truth for what the UI
 * should render:
 *   loading            - request in flight
 *   ok                 - real, user-owned computed data (in `data`)
 *   demo               - intentional demo dataset (demo session only, in `data`)
 *   no_data            - authenticated real user has uploaded nothing yet (`data` is null)
 *   insufficient_data  - real user has some data but not enough for this metric (`data` is null)
 *   error              - the API could not be reached
 */
export type SectionState<T> = {
  data: T | null;
  status: SectionStatus;
  message: string;
};

interface CreditLensContextType {
  creditHealth: SectionState<CreditHealthData>;
  riskAnalysis: SectionState<RiskAnalysisData>;
  spending: SectionState<SpendingIntelligenceData>;
  hasAnyFinancialData: boolean;
  financialProfile: FinancialProfile;
  notifications: InsightNotification[];
  unreadNotificationCount: number;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  updateFinancialProfile: (updated: Partial<FinancialProfile>) => void;
}

const CreditLensContext = createContext<CreditLensContextType | undefined>(undefined);

const LOADING = <T,>(): SectionState<T> => ({ data: null, status: "loading", message: "" });

// A real user starts with an empty financial profile. Demo values are only
// applied for an explicit demo session (see `load()` below) — never as a default.
const EMPTY_FINANCIAL_PROFILE: FinancialProfile = {
  monthlyIncome: 0,
  employmentType: "",
  creditLimitTotal: 0,
  revolvingBalanceTotal: 0,
  activeLoansCount: 0,
  totalMonthlyEMI: 0,
};

/**
 * Turns a service DataResult into a SectionState. For a DEMO session only, an
 * unreachable API falls back to the bundled demo dataset so the portfolio demo
 * never hard-fails. For a real user an error stays an error — demo data is
 * NEVER substituted.
 */
function toSectionState<T>(
  result: DataResult<T>,
  isDemoSession: boolean,
  demoFallback: T
): SectionState<T> {
  if (result.status === "error" && isDemoSession) {
    return { data: demoFallback, status: "demo", message: "Offline demo dataset" };
  }
  return { data: result.data, status: result.status, message: result.message };
}

export function CreditLensProvider({ children }: { children: React.ReactNode }) {
  const { isDemoMode } = useAuth();

  const [creditHealth, setCreditHealth] = useState<SectionState<CreditHealthData>>(LOADING);
  const [riskAnalysis, setRiskAnalysis] = useState<SectionState<RiskAnalysisData>>(LOADING);
  const [spending, setSpending] = useState<SectionState<SpendingIntelligenceData>>(LOADING);

  const [financialProfile, setFinancialProfile] = useState<FinancialProfile>(EMPTY_FINANCIAL_PROFILE);
  const [notifications, setNotifications] = useState<InsightNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setCreditHealth(LOADING);
    setRiskAnalysis(LOADING);
    setSpending(LOADING);

    const [healthRes, riskRes, spendingRes] = await Promise.all([
      creditService.getCreditHealthSummary(),
      riskService.getRiskAnalysis(),
      spendingService.getSpendingOverview(),
    ]);

    setCreditHealth(toSectionState(healthRes, isDemoMode, DEMO_CREDIT_HEALTH));
    setRiskAnalysis(toSectionState(riskRes, isDemoMode, DEMO_RISK_ANALYSIS));
    setSpending(toSectionState(spendingRes, isDemoMode, DEMO_SPENDING_INTELLIGENCE));

    // Demo-only scaffolding; real users start with a clean slate.
    setNotifications(isDemoMode ? DEMO_NOTIFICATIONS : []);
    setFinancialProfile(isDemoMode ? DEMO_FINANCIAL_PROFILE : EMPTY_FINANCIAL_PROFILE);

    const anyError =
      healthRes.status === "error" &&
      riskRes.status === "error" &&
      spendingRes.status === "error";
    if (anyError && !isDemoMode) {
      setError("Unable to reach the CreditLens API. Please try again shortly.");
    }
    setIsLoading(false);
  }, [isDemoMode]);

  useEffect(() => {
    let active = true;
    void (async () => {
      if (!active) return;
      await load();
    })();
    return () => {
      active = false;
    };
  }, [load]);

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const updateFinancialProfile = (updated: Partial<FinancialProfile>) => {
    setFinancialProfile((prev) => ({ ...prev, ...updated }));
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;
  const hasAnyFinancialData =
    creditHealth.status === "ok" ||
    creditHealth.status === "demo" ||
    riskAnalysis.status === "ok" ||
    riskAnalysis.status === "demo" ||
    spending.status === "ok" ||
    spending.status === "demo";

  return (
    <CreditLensContext.Provider
      value={{
        creditHealth,
        riskAnalysis,
        spending,
        hasAnyFinancialData,
        financialProfile,
        notifications,
        unreadNotificationCount,
        isLoading,
        error,
        refreshData: load,
        markNotificationAsRead,
        updateFinancialProfile,
      }}
    >
      {children}
    </CreditLensContext.Provider>
  );
}

export function useCreditLens() {
  const context = useContext(CreditLensContext);
  if (!context) {
    throw new Error("useCreditLens must be used within a CreditLensProvider");
  }
  return context;
}
