import {
  RiskAnalysisData,
  CreditHealthData,
  SpendingIntelligenceData,
  HealthTier,
  RiskLevel,
  CopilotMessage,
  CitationSource,
  GroundingFact,
  ShapContribution,
  HealthFactor,
  CreditHealthHistoryPoint,
  CategorySpend,
  MonthlySpendTrend,
  SpendingAnomaly,
  Transaction
} from "@/types";
import {
  ApiRiskAnalysisData,
  ApiCreditHealthData,
  ApiSpendingIntelligenceData,
  ApiCopilotResponsePayload,
  ApiCitationSource,
  ApiGroundingFact
} from "@/types/api";

function isApiRiskData(raw: ApiRiskAnalysisData | RiskAnalysisData): raw is ApiRiskAnalysisData {
  return "risk_category" in raw || "probability_distribution" in raw;
}

function isApiCreditHealthData(raw: ApiCreditHealthData | CreditHealthData): raw is ApiCreditHealthData {
  return "health_score" in raw;
}

function isApiSpendingData(raw: ApiSpendingIntelligenceData | SpendingIntelligenceData): raw is ApiSpendingIntelligenceData {
  return "total_spending_current_month" in raw;
}

/**
 * Maps raw FastAPI risk response (snake_case) to frontend RiskAnalysisData (camelCase)
 */
export function mapRiskAnalysisResponse(
  raw: ApiRiskAnalysisData | RiskAnalysisData
): RiskAnalysisData {
  if (!raw) {
    throw new Error("Risk analysis payload is empty or invalid");
  }

  if (isApiRiskData(raw)) {
    const prob = raw.probability_distribution;
    const lowRisk = typeof prob?.low_risk === "number" ? prob.low_risk : 0.82;
    const mediumRisk = typeof prob?.medium_risk === "number" ? prob.medium_risk : 0.14;
    const highRisk = typeof prob?.high_risk === "number" ? prob.high_risk : 0.04;

    const shapContributions: ShapContribution[] = (raw.model_explainability || []).map((item) => ({
      featureName: item.feature_name,
      displayName: item.display_name,
      impactValue: item.impact_value,
      featureValue: item.feature_value,
      isPositive: Boolean(item.is_positive),
    }));

    return {
      riskCategory: (raw.risk_category || "LOW RISK") as RiskLevel,
      confidencePercentage: raw.confidence_percentage ?? 87.0,
      probabilityDistribution: {
        lowRisk,
        mediumRisk,
        highRisk,
      },
      topPositiveFactors: raw.top_positive_factors || [],
      riskFactors: raw.risk_factors || [],
      modelExplainability: shapContributions,
      modelVersion: raw.model_version || "creditlens-risk-xgb-v1",
      evaluatedAt: raw.evaluated_at || new Date().toISOString(),
      disclaimer:
        raw.disclaimer ||
        "Machine learning risk evaluation is for educational and risk-awareness purposes only.",
    };
  }

  // Already camelCase RiskAnalysisData
  return {
    riskCategory: raw.riskCategory,
    confidencePercentage: raw.confidencePercentage,
    probabilityDistribution: {
      lowRisk: raw.probabilityDistribution?.lowRisk ?? 0.82,
      mediumRisk: raw.probabilityDistribution?.mediumRisk ?? 0.14,
      highRisk: raw.probabilityDistribution?.highRisk ?? 0.04,
    },
    topPositiveFactors: raw.topPositiveFactors || [],
    riskFactors: raw.riskFactors || [],
    modelExplainability: raw.modelExplainability || [],
    modelVersion: raw.modelVersion || "creditlens-risk-xgb-v1",
    evaluatedAt: raw.evaluatedAt || new Date().toISOString(),
    disclaimer: raw.disclaimer || "Machine learning risk evaluation is for educational and risk-awareness purposes only.",
  };
}

/**
 * Maps raw FastAPI credit health response (snake_case) to frontend CreditHealthData (camelCase)
 */
export function mapCreditHealthResponse(
  raw: ApiCreditHealthData | CreditHealthData
): CreditHealthData {
  if (!raw) {
    throw new Error("Credit health payload is empty or invalid");
  }

  if (isApiCreditHealthData(raw)) {
    const factors: HealthFactor[] = (raw.factors || []).map((f) => ({
      factorId: f.factor_id,
      name: f.name,
      score: f.score,
      weight: f.weight,
      status: (f.status || "good") as "optimal" | "good" | "warning" | "critical",
      description: f.description,
      impactDetail: f.impact_detail,
    }));

    const history: CreditHealthHistoryPoint[] = (raw.history || []).map((h) => ({
      month: h.month,
      score: h.score,
      utilization: h.utilization,
    }));

    return {
      healthScore: raw.health_score ?? 742,
      scoreTier: (raw.score_tier || "Healthy") as HealthTier,
      scoreDelta: raw.score_delta ?? 18,
      calculationDate: raw.calculation_timestamp || "Mar 2026",
      factors,
      history,
      disclaimer:
        raw.disclaimer ||
        "Educational & Financial Intelligence score calculated by CreditLens proprietary indicators.",
    };
  }

  // Already camelCase CreditHealthData
  return {
    healthScore: raw.healthScore,
    scoreTier: raw.scoreTier,
    scoreDelta: raw.scoreDelta,
    calculationDate: raw.calculationDate,
    factors: raw.factors || [],
    history: raw.history || [],
    disclaimer: raw.disclaimer,
  };
}

/**
 * Maps raw FastAPI spending response (snake_case) to frontend SpendingIntelligenceData (camelCase)
 */
export function mapSpendingResponse(
  raw: ApiSpendingIntelligenceData | SpendingIntelligenceData
): SpendingIntelligenceData {
  if (!raw) {
    throw new Error("Spending payload is empty or invalid");
  }

  if (isApiSpendingData(raw)) {
    const categories: CategorySpend[] = (raw.categories || []).map((c) => ({
      category: c.category,
      amount: c.amount,
      percentage: c.percentage,
      color: c.color,
      monthOverMonthChangePct: c.month_over_month_change_pct,
    }));

    const monthlyTrend: MonthlySpendTrend[] = (raw.monthly_trend || []).map((t) => ({
      month: t.month,
      amount: t.amount,
      budget: t.budget,
    }));

    const anomalies: SpendingAnomaly[] = (raw.anomalies || []).map((a) => ({
      id: a.id,
      category: a.category,
      title: a.title,
      description: a.description,
      percentageAboveAverage: a.percentage_above_average,
      historicalAverage: a.historical_average,
      currentAmount: a.current_amount,
      severity: (a.severity || "warning") as "info" | "warning" | "critical",
    }));

    const recentTransactions: Transaction[] = (raw.recent_transactions || []).map((tx) => ({
      id: tx.id,
      date: tx.date,
      merchant: tx.merchant,
      category: tx.category,
      amount: tx.amount,
      accountType: tx.account_type,
      isAnomaly: Boolean(tx.is_anomaly),
      anomalyReason: tx.anomaly_reason || undefined,
    }));

    return {
      totalSpendingCurrentMonth: raw.total_spending_current_month,
      spendingDeltaPct: raw.spending_delta_pct,
      averageMonthlySpend: raw.average_monthly_spend,
      categories,
      monthlyTrend,
      anomalies,
      recentTransactions,
    };
  }

  // Already camelCase SpendingIntelligenceData
  return {
    totalSpendingCurrentMonth: raw.totalSpendingCurrentMonth,
    spendingDeltaPct: raw.spendingDeltaPct,
    averageMonthlySpend: raw.averageMonthlySpend,
    categories: raw.categories || [],
    monthlyTrend: raw.monthlyTrend || [],
    anomalies: raw.anomalies || [],
    recentTransactions: raw.recentTransactions || [],
  };
}

/**
 * Maps raw FastAPI Copilot response to frontend types
 */
export function mapCopilotResponse(
  raw: ApiCopilotResponsePayload
): {
  message: CopilotMessage;
  sources: CitationSource[];
  groundingFacts: GroundingFact[];
  suggestedFollowups: string[];
} {
  const sources: CitationSource[] = (raw.sources || []).map((s: ApiCitationSource) => ({
    id: s.id,
    title: s.title,
    publisher: s.publisher,
    docType: s.doc_type || "Regulatory Document",
    excerpt: s.excerpt,
    url: s.url || undefined,
    relevanceScore: s.relevance_score,
  }));

  const groundingFacts: GroundingFact[] = (raw.grounding_facts || []).map((g: ApiGroundingFact) => ({
    label: g.label,
    value: g.value,
  }));

  const suggestedFollowups: string[] = raw.suggested_followups || [];

  const message: CopilotMessage = {
    id: `msg-${raw.conversation_id || Date.now()}`,
    sender: "assistant",
    text: raw.response,
    timestamp: "Just now",
    sources,
    groundingFacts,
    suggestedFollowups,
    isDemoResponse: Boolean(raw.is_demo),
  };

  return {
    message,
    sources,
    groundingFacts,
    suggestedFollowups,
  };
}
