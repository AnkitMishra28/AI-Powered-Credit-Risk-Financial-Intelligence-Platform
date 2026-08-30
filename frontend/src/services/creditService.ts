import { fetchApi } from "./api";
import { CreditHealthData } from "@/types";
import { ApiCreditHealthData } from "@/types/api";
import { mapCreditHealthResponse } from "./mappers";
import { DEMO_CREDIT_HEALTH } from "@/lib/demo-data";

export interface CreditHealthCalculateParams {
  monthly_income: number;
  credit_limit_total: number;
  revolving_balance_total?: number;
  total_monthly_emi?: number;
  payment_consistency_ratio?: number;
  credit_history_years?: number;
  monthly_spending_total?: number;
  spending_average_6mo?: number;
}

export const creditService = {
  async getCreditHealthSummary(isDemo: boolean = true): Promise<CreditHealthData> {
    try {
      const raw = await fetchApi<ApiCreditHealthData>(
        `/credit-health/summary?demo=${isDemo}`,
        { method: "GET" }
      );
      return mapCreditHealthResponse(raw);
    } catch {
      return DEMO_CREDIT_HEALTH;
    }
  },

  async calculateCreditHealth(params: CreditHealthCalculateParams): Promise<CreditHealthData> {
    const raw = await fetchApi<ApiCreditHealthData>(
      "/credit-health/calculate",
      {
        method: "POST",
        body: JSON.stringify(params),
      }
    );
    return mapCreditHealthResponse(raw);
  }
};
