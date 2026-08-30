import { fetchApi } from "./api";
import { SpendingIntelligenceData, CategorySpend, SpendingAnomaly, RecurringPayment } from "@/types";
import { ApiSpendingIntelligenceData, ApiCategorySpend, ApiSpendingAnomaly, ApiRecurringPaymentItem } from "@/types/api";
import { mapSpendingResponse, mapCategorySpend, mapSpendingAnomaly, mapRecurringPayment } from "./mappers";
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
  },

  async getCategories(isDemo: boolean = true): Promise<CategorySpend[]> {
    try {
      const raw = await fetchApi<ApiCategorySpend[]>(
        `/spending/categories?demo=${isDemo}`,
        { method: "GET" },
        []
      );
      return (raw || []).map(mapCategorySpend);
    } catch {
      return DEMO_SPENDING_INTELLIGENCE.categories;
    }
  },

  async getAnomalies(isDemo: boolean = true): Promise<SpendingAnomaly[]> {
    try {
      const raw = await fetchApi<ApiSpendingAnomaly[]>(
        `/spending/anomalies?demo=${isDemo}`,
        { method: "GET" },
        []
      );
      return (raw || []).map(mapSpendingAnomaly);
    } catch {
      return DEMO_SPENDING_INTELLIGENCE.anomalies;
    }
  },

  async getRecurring(isDemo: boolean = true): Promise<RecurringPayment[]> {
    try {
      const raw = await fetchApi<ApiRecurringPaymentItem[]>(
        `/spending/recurring?demo=${isDemo}`,
        { method: "GET" },
        []
      );
      return (raw || []).map(mapRecurringPayment);
    } catch {
      return DEMO_SPENDING_INTELLIGENCE.recurringPayments || [];
    }
  }
};
