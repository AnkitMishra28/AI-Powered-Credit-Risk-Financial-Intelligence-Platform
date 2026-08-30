import { fetchApi } from "./api";
import { RiskAnalysisData } from "@/types";
import { ApiRiskAnalysisData } from "@/types/api";
import { mapRiskAnalysisResponse } from "./mappers";
import { DEMO_RISK_ANALYSIS } from "@/lib/demo-data";

export const riskService = {
  async getRiskAnalysis(isDemo: boolean = true): Promise<RiskAnalysisData> {
    try {
      const raw = await fetchApi<ApiRiskAnalysisData>(
        `/risk/analysis?demo=${isDemo}`,
        { method: "GET" }
      );
      return mapRiskAnalysisResponse(raw);
    } catch {
      return DEMO_RISK_ANALYSIS;
    }
  }
};
