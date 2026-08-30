import { fetchApi } from "./api";
import { CreditHealthData } from "@/types";
import { ApiCreditHealthData } from "@/types/api";
import { mapCreditHealthResponse } from "./mappers";
import { DEMO_CREDIT_HEALTH } from "@/lib/demo-data";

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
  }
};
