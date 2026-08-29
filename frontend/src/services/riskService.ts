import { fetchApi } from "./api";
import { RiskAnalysisData } from "@/types";
import { DEMO_RISK_ANALYSIS } from "@/lib/demo-data";

export const riskService = {
  async getRiskAnalysis(isDemo: boolean = true): Promise<RiskAnalysisData> {
    return fetchApi<RiskAnalysisData>(
      `/risk/analysis?demo=${isDemo}`,
      { method: "GET" },
      DEMO_RISK_ANALYSIS
    );
  }
};
