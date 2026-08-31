import { fetchSection, DataResult } from "./api";
import { SpendingIntelligenceData } from "@/types";
import { ApiSpendingIntelligenceData } from "@/types/api";
import { mapSpendingResponse } from "./mappers";

export const spendingService = {
  /**
   * Returns the authenticated user's spending-intelligence state, computed
   * strictly from THEIR persisted transactions:
   *   - demo account         -> status "demo" with the demo dataset
   *   - real user w/ txns    -> status "ok" with their real analytics
   *   - real user w/o txns   -> status "no_data" (data still carries genuine zeros)
   * Demo / Alex Mercer transactions are never substituted for a real user.
   */
  async getSpendingOverview(): Promise<DataResult<SpendingIntelligenceData>> {
    return fetchSection<ApiSpendingIntelligenceData, SpendingIntelligenceData>(
      "/spending/overview",
      mapSpendingResponse
    );
  },
};
