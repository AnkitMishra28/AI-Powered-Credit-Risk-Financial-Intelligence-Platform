"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  CreditHealthData,
  RiskAnalysisData,
  SpendingIntelligenceData,
  FinancialProfile,
  InsightNotification
} from "@/types";
import {
  DEMO_CREDIT_HEALTH,
  DEMO_RISK_ANALYSIS,
  DEMO_SPENDING_INTELLIGENCE,
  DEMO_FINANCIAL_PROFILE,
  DEMO_NOTIFICATIONS
} from "@/lib/demo-data";
import { creditService } from "@/services/creditService";
import { riskService } from "@/services/riskService";
import { spendingService } from "@/services/spendingService";
import { useAuth } from "./AuthContext";

interface CreditLensContextType {
  financialProfile: FinancialProfile;
  creditHealth: CreditHealthData;
  riskAnalysis: RiskAnalysisData;
  spending: SpendingIntelligenceData;
  notifications: InsightNotification[];
  unreadNotificationCount: number;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  updateFinancialProfile: (updated: Partial<FinancialProfile>) => void;
}

const CreditLensContext = createContext<CreditLensContextType | undefined>(undefined);

export function CreditLensProvider({ children }: { children: React.ReactNode }) {
  const { isDemoMode } = useAuth();
  const [financialProfile, setFinancialProfile] = useState<FinancialProfile>(DEMO_FINANCIAL_PROFILE);
  const [creditHealth, setCreditHealth] = useState<CreditHealthData>(DEMO_CREDIT_HEALTH);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysisData>(DEMO_RISK_ANALYSIS);
  const [spending, setSpending] = useState<SpendingIntelligenceData>(DEMO_SPENDING_INTELLIGENCE);
  const [notifications, setNotifications] = useState<InsightNotification[]>(DEMO_NOTIFICATIONS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [healthRes, riskRes, spendingRes] = await Promise.all([
        creditService.getCreditHealthSummary(isDemoMode),
        riskService.getRiskAnalysis(isDemoMode),
        spendingService.getSpendingOverview(isDemoMode)
      ]);
      setCreditHealth(healthRes);
      setRiskAnalysis(riskRes);
      setSpending(spendingRes);
    } catch (err: unknown) {
      console.warn("Using fallback demo dataset:", err);
      // Fallback state is maintained
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const [healthRes, riskRes, spendingRes] = await Promise.all([
          creditService.getCreditHealthSummary(isDemoMode),
          riskService.getRiskAnalysis(isDemoMode),
          spendingService.getSpendingOverview(isDemoMode)
        ]);
        if (isMounted) {
          setCreditHealth(healthRes);
          setRiskAnalysis(riskRes);
          setSpending(spendingRes);
        }
      } catch (err: unknown) {
        console.warn("Initial data load using fallback:", err);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [isDemoMode]);

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const updateFinancialProfile = (updated: Partial<FinancialProfile>) => {
    setFinancialProfile((prev) => ({ ...prev, ...updated }));
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <CreditLensContext.Provider
      value={{
        financialProfile,
        creditHealth,
        riskAnalysis,
        spending,
        notifications,
        unreadNotificationCount,
        isLoading,
        error,
        refreshData,
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
