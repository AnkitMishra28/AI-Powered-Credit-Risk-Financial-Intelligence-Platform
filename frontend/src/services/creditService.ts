import { fetchApi } from "./api";
import { CreditHealthData } from "@/types";
import { DEMO_CREDIT_HEALTH } from "@/lib/demo-data";

export const creditService = {
  async getCreditHealthSummary(isDemo: boolean = true): Promise<CreditHealthData> {
    return fetchApi<CreditHealthData>(
      `/credit-health/summary?demo=${isDemo}`,
      { method: "GET" },
      DEMO_CREDIT_HEALTH
    );
  }
};
