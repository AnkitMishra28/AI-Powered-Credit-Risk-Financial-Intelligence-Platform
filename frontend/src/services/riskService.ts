import { fetchApi, fetchSection, DataResult } from "./api";
import { RiskAnalysisData } from "@/types";
import { ApiRiskAnalysisData } from "@/types/api";
import { mapRiskAnalysisResponse } from "./mappers";

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
  /**
   * Returns the authenticated user's risk-analysis state. Ownership is decided
   * server-side from the JWT identity:
   *   - demo account            -> status "demo" with the demo applicant result
   *   - real user w/ a saved prediction -> status "ok" with THEIR result
   *   - real user w/o one       -> status "insufficient_data", data null
   * The canonical demo result is never returned to a real user.
   */
  async getRiskAnalysis(): Promise<DataResult<RiskAnalysisData>> {
    return fetchSection<ApiRiskAnalysisData, RiskAnalysisData>(
      "/risk/analysis",
      mapRiskAnalysisResponse
    );
  },

  async predictRisk(params: RiskPredictParams): Promise<RiskAnalysisData> {
    const raw = await fetchApi<ApiRiskAnalysisData>("/risk/predict", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return mapRiskAnalysisResponse(raw);
  },

  async getModelInfo(): Promise<ModelInfoResponse> {
    return await fetchApi<ModelInfoResponse>("/risk/model-info", { method: "GET" });
  },
};
