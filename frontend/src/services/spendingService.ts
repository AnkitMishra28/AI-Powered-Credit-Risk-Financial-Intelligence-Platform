import { fetchApi } from "./api";
import { SpendingIntelligenceData } from "@/types";
import { DEMO_SPENDING_INTELLIGENCE } from "@/lib/demo-data";

export const spendingService = {
  async getSpendingOverview(isDemo: boolean = true): Promise<SpendingIntelligenceData> {
    return fetchApi<SpendingIntelligenceData>(
      `/spending/overview?demo=${isDemo}`,
      { method: "GET" },
      DEMO_SPENDING_INTELLIGENCE
    );
  }
};
