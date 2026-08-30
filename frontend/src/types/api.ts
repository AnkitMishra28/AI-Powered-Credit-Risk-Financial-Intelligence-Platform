/**
 * Raw FastAPI Backend DTOs
 * Strictly typed definitions for responses returned by the Python FastAPI backend (snake_case).
 */

export interface ApiProbabilityDistribution {
  low_risk: number;
  medium_risk: number;
  high_risk: number;
}

export interface ApiShapFeatureContribution {
  feature_name: string;
  display_name: string;
  impact_value: number;
  feature_value: string;
  is_positive: boolean;
}

export interface ApiRiskAnalysisData {
  risk_category: string;
  confidence_percentage: number;
  probability_distribution: ApiProbabilityDistribution;
  top_positive_factors: string[];
  risk_factors: string[];
  model_explainability: ApiShapFeatureContribution[];
  model_version?: string;
  evaluated_at?: string;
  disclaimer?: string;
  is_demo?: boolean;
}

export interface ApiFactorScore {
  factor_id: string;
  name: string;
  score: number;
  weight: number;
  status: string;
  description: string;
  impact_detail: string;
}

export interface ApiCreditHealthHistoryPoint {
  month: string;
  score: number;
  utilization: number;
}

export interface ApiCreditHealthData {
  health_score: number;
  score_tier: string;
  score_delta: number;
  calculation_timestamp?: string;
  factors: ApiFactorScore[];
  history: ApiCreditHealthHistoryPoint[];
  disclaimer?: string;
  is_demo?: boolean;
}

export interface ApiCategorySpend {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  month_over_month_change_pct: number;
}

export interface ApiMonthlySpendTrend {
  month: string;
  amount: number;
  budget: number;
}

export interface ApiSpendingAnomaly {
  id: string;
  category: string;
  title: string;
  description: string;
  percentage_above_average: number;
  historical_average: number;
  current_amount: number;
  severity: string;
}

export interface ApiTransactionItem {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  account_type?: string;
  is_anomaly?: boolean;
  anomaly_reason?: string | null;
  transaction_type?: "debit" | "credit";
  original_description?: string;
  confidence?: number;
  classification_method?: string;
  balance?: number | null;
}

export interface ApiRecurringPaymentItem {
  id: string;
  merchant: string;
  category: string;
  estimated_amount: number;
  frequency: string;
  last_payment_date: string;
  next_expected_date?: string | null;
  confidence: number;
  status: string;
}

export interface ApiSpendingIntelligenceData {
  total_spending_current_month: number;
  spending_delta_pct: number;
  average_monthly_spend: number;
  total_income_current_month?: number;
  net_cashflow?: number;
  discretionary_spending?: number;
  essential_spending?: number;
  categories: ApiCategorySpend[];
  monthly_trend: ApiMonthlySpendTrend[];
  anomalies: ApiSpendingAnomaly[];
  recurring_payments?: ApiRecurringPaymentItem[];
  recent_transactions: ApiTransactionItem[];
  total_transactions_count?: number;
  is_demo?: boolean;
}

export interface ApiStatementSummary {
  id: string;
  user_id: number;
  filename: string;
  file_type: "csv" | "pdf";
  file_size_bytes: number;
  uploaded_at: string;
  status: "pending" | "processing" | "completed" | "failed";
  transaction_count: number;
  total_debits: number;
  total_credits: number;
  error_message?: string | null;
}

export interface ApiStatementUploadResponse {
  statement: ApiStatementSummary;
  parsed_transactions_count: number;
  total_debits: number;
  total_credits: number;
}

export interface ApiTransactionListResponse {
  items: ApiTransactionItem[];
  total_count: number;
  offset: number;
  limit: number;
  has_more: boolean;
}

export interface ApiCitationSource {
  id: string;
  title: string;
  publisher: string;
  doc_type: string;
  excerpt: string;
  url?: string | null;
  relevance_score?: number;
}

export interface ApiGroundingFact {
  label: string;
  value: string;
}

export interface ApiCopilotResponsePayload {
  response: string;
  conversation_id: string;
  timestamp: string;
  sources: ApiCitationSource[];
  grounding_facts: ApiGroundingFact[];
  suggested_followups: string[];
  disclaimer?: string;
  is_demo?: boolean;
}
