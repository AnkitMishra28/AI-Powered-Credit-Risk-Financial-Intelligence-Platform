import { fetchApi } from "./api";
import { SpendingIntelligenceData } from "@/types";
import { ApiSpendingIntelligenceData } from "@/types/api";
import { mapSpendingResponse } from "./mappers";
import { DEMO_SPENDING_INTELLIGENCE } from "@/lib/demo-data";

export const spendingService = {
  async getSpendingOverview(isDemo: boolean = true): Promise<SpendingIntelligenceData> {
    try {
      const raw = await fetchApi<ApiSpendingIntelligenceData>(
        `/spending/overview?demo=${isDemo}`,
        { method: "GET" }
      );
      return mapSpendingResponse(raw);
    } catch {
      return DEMO_SPENDING_INTELLIGENCE;
    }
  }
};
