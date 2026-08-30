import { fetchApi } from "./api";
import { RiskAnalysisData } from "@/types";
import { ApiRiskAnalysisData } from "@/types/api";
import { mapRiskAnalysisResponse } from "./mappers";
import { DEMO_RISK_ANALYSIS } from "@/lib/demo-data";

export interface RiskPredictParams {
  checking_status?: string;
  duration?: number;
  credit_history?: string;
  purpose?: string;
  credit_amount?: number;
  savings_status?: string;
  employment?: string;
  installment_commitment?: number;
  personal_status?: string;
  other_parties?: string;
  residence_since?: number;
  property_magnitude?: string;
  age?: number;
  other_payment_plans?: string;
  housing?: string;
  existing_credits?: number;
  job?: string;
  num_dependents?: number;
  own_telephone?: string;
  foreign_worker?: string;
}

export interface ModelInfoResponse {
  model_version: string;
  algorithm: string;
  features_count: number;
  primary_xgb_metrics: Record<string, number>;
  feature_importance: Record<string, number>;
}

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
  },

  async predictRisk(params: RiskPredictParams): Promise<RiskAnalysisData> {
    const raw = await fetchApi<ApiRiskAnalysisData>(
      "/risk/predict",
      {
        method: "POST",
        body: JSON.stringify(params),
      }
    );
    return mapRiskAnalysisResponse(raw);
  },

  async getModelInfo(): Promise<ModelInfoResponse> {
    return await fetchApi<ModelInfoResponse>(
      "/risk/model-info",
      { method: "GET" }
    );
  }
};
