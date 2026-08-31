import { fetchApi, fetchSection, DataResult } from "./api";
import { CreditHealthData } from "@/types";
import { ApiCreditHealthData } from "@/types/api";
import { mapCreditHealthResponse } from "./mappers";

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
  /**
   * Returns the authenticated user's Credit Health state. The backend decides
   * ownership from the JWT identity:
   *   - demo account   -> status "demo" with the demo profile
   *   - real user w/ a saved score -> status "ok" with THEIR score
   *   - real user w/o a saved score -> status "no_data" / "insufficient_data", data null
   * A canonical/demo score is never returned to a real user.
   */
  async getCreditHealthSummary(): Promise<DataResult<CreditHealthData>> {
    return fetchSection<ApiCreditHealthData, CreditHealthData>(
      "/credit-health/summary",
      mapCreditHealthResponse
    );
  },

  async calculateCreditHealth(params: CreditHealthCalculateParams): Promise<CreditHealthData> {
    const raw = await fetchApi<ApiCreditHealthData>("/credit-health/calculate", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return mapCreditHealthResponse(raw);
  },
};
