/**
 * CreditLens API Response Mapper / Adapter Layer
 * Transforms raw backend snake_case DTOs into strongly-typed frontend camelCase models.
 */

import {
  RiskAnalysisData,
  ProbabilityDistribution,
  ShapContribution,
  RiskLevel,
  CreditHealthData,
  HealthFactor,
  HealthTier,
  CreditHealthHistoryPoint,
  SpendingIntelligenceData,
  CategorySpend,
  MonthlySpendTrend,
  SpendingAnomaly,
  Transaction,
  RecurringPayment,
  StatementSummary,
  CopilotMessage,
  CitationSource,
  GroundingFact,
} from "../types";

import {
  ApiRiskAnalysisData,
  ApiCreditHealthData,
  ApiSpendingIntelligenceData,
  ApiCategorySpend,
  ApiSpendingAnomaly,
  ApiCopilotResponsePayload,
  ApiCitationSource,
  ApiGroundingFact,
  ApiStatementSummary,
  ApiTransactionItem,
  ApiRecurringPaymentItem,
} from "../types/api";

function isApiRiskData(data: unknown): data is ApiRiskAnalysisData {
  return (
    typeof data === "object" &&
    data !== null &&
    ("probability_distribution" in data || "risk_category" in data)
  );
}

function isApiCreditData(data: unknown): data is ApiCreditHealthData {
  return (
    typeof data === "object" &&
    data !== null &&
    ("health_score" in data || "score_tier" in data)
  );
}

function isApiSpendingData(data: unknown): data is ApiSpendingIntelligenceData {
  return (
    typeof data === "object" &&
    data !== null &&
    ("total_spending_current_month" in data || "monthly_trend" in data)
  );
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
    const rawDist = raw.probability_distribution;
    const probabilityDistribution: ProbabilityDistribution = rawDist
      ? {
          lowRisk: rawDist.low_risk ?? 0,
          mediumRisk: rawDist.medium_risk ?? 0,
          highRisk: rawDist.high_risk ?? 0,
        }
      : {
          lowRisk: 0,
          mediumRisk: 0,
          highRisk: 0,
        };

    const modelExplainability: ShapContribution[] = (
      raw.model_explainability || []
    ).map((item) => ({
      featureName: item.feature_name,
      displayName: item.display_name,
      impactValue: item.impact_value,
      featureValue: item.feature_value,
      isPositive: item.is_positive,
    }));

    return {
      // The backend always sends risk_category on a real result and fetchSection
      // only maps "ok"/"demo" payloads, so this default is unreachable in
      // practice. If it is ever hit the response is malformed — fall back to the
      // NON-reassuring middle category rather than fabricating "LOW RISK".
      riskCategory: (raw.risk_category || "MEDIUM RISK") as RiskLevel,
      confidencePercentage: raw.confidence_percentage ?? 0,
      probabilityDistribution,
      topPositiveFactors: raw.top_positive_factors || [],
      riskFactors: raw.risk_factors || [],
      modelExplainability,
      modelVersion: raw.model_version || "creditlens-risk-xgb-v1.2",
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
    probabilityDistribution: raw.probabilityDistribution,
    topPositiveFactors: raw.topPositiveFactors || [],
    riskFactors: raw.riskFactors || [],
    modelExplainability: raw.modelExplainability || [],
    modelVersion: raw.modelVersion,
    evaluatedAt: raw.evaluatedAt,
    disclaimer: raw.disclaimer,
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

  if (isApiCreditData(raw)) {
    const factors: HealthFactor[] = (raw.factors || []).map((f) => ({
      factorId: f.factor_id,
      name: f.name,
      score: f.score,
      weight: f.weight,
      status: (f.status || "optimal") as "optimal" | "good" | "warning" | "critical",
      description: f.description,
      impactDetail: f.impact_detail,
    }));

    const history: CreditHealthHistoryPoint[] = (raw.history || []).map((h) => ({
      month: h.month,
      score: h.score,
      utilization: h.utilization,
    }));

    return {
      healthScore: raw.health_score ?? 0,
      scoreTier: (raw.score_tier || "Healthy") as HealthTier,
      scoreDelta: raw.score_delta ?? 0,
      calculationDate: raw.calculation_timestamp || "",
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
 * Maps raw transaction item to frontend model
 */
export function mapTransactionItem(tx: ApiTransactionItem): Transaction {
  return {
    id: tx.id,
    date: tx.date,
    merchant: tx.merchant,
    category: tx.category,
    amount: tx.amount,
    accountType: tx.account_type || "Credit Card",
    isAnomaly: Boolean(tx.is_anomaly),
    anomalyReason: tx.anomaly_reason || undefined,
    transactionType: tx.transaction_type || "debit",
    originalDescription: tx.original_description,
    confidence: tx.confidence ?? 0.95,
    classificationMethod: tx.classification_method || "merchant_rule",
    balance: tx.balance ?? undefined,
  };
}

/**
 * Maps raw statement summary
 */
export function mapStatementSummary(s: ApiStatementSummary): StatementSummary {
  return {
    id: s.id,
    userId: s.user_id,
    filename: s.filename,
    fileType: s.file_type,
    fileSizeBytes: s.file_size_bytes,
    uploadedAt: s.uploaded_at,
    status: s.status,
    transactionCount: s.transaction_count,
    totalDebits: s.total_debits,
    totalCredits: s.total_credits,
    errorMessage: s.error_message || undefined,
  };
}

export function mapCategorySpend(c: ApiCategorySpend): CategorySpend {
  return {
    category: c.category,
    amount: c.amount,
    percentage: c.percentage,
    color: c.color,
    monthOverMonthChangePct: c.month_over_month_change_pct,
  };
}

export function mapSpendingAnomaly(a: ApiSpendingAnomaly): SpendingAnomaly {
  return {
    id: a.id,
    category: a.category,
    title: a.title,
    description: a.description,
    percentageAboveAverage: a.percentage_above_average,
    historicalAverage: a.historical_average,
    currentAmount: a.current_amount,
    severity: (a.severity || "warning") as "info" | "warning" | "critical",
  };
}

export function mapRecurringPayment(r: ApiRecurringPaymentItem): RecurringPayment {
  return {
    id: r.id,
    merchant: r.merchant,
    category: r.category,
    estimatedAmount: r.estimated_amount,
    frequency: r.frequency,
    lastPaymentDate: r.last_payment_date,
    nextExpectedDate: r.next_expected_date || undefined,
    confidence: r.confidence,
    status: r.status,
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
    const categories: CategorySpend[] = (raw.categories || []).map(mapCategorySpend);

    const monthlyTrend: MonthlySpendTrend[] = (raw.monthly_trend || []).map((t) => ({
      month: t.month,
      amount: t.amount,
      budget: t.budget,
    }));

    const anomalies: SpendingAnomaly[] = (raw.anomalies || []).map(mapSpendingAnomaly);

    const recentTransactions: Transaction[] = (raw.recent_transactions || []).map(mapTransactionItem);

    const recurringPayments: RecurringPayment[] = (raw.recurring_payments || []).map(mapRecurringPayment);

    return {
      totalSpendingCurrentMonth: raw.total_spending_current_month,
      spendingDeltaPct: raw.spending_delta_pct,
      averageMonthlySpend: raw.average_monthly_spend,
      totalIncomeCurrentMonth: raw.total_income_current_month,
      netCashflow: raw.net_cashflow,
      discretionarySpending: raw.discretionary_spending,
      essentialSpending: raw.essential_spending,
      categories,
      monthlyTrend,
      anomalies,
      recurringPayments,
      recentTransactions,
    };
  }

  // Already camelCase SpendingIntelligenceData
  return {
    totalSpendingCurrentMonth: raw.totalSpendingCurrentMonth,
    spendingDeltaPct: raw.spendingDeltaPct,
    averageMonthlySpend: raw.averageMonthlySpend,
    totalIncomeCurrentMonth: raw.totalIncomeCurrentMonth,
    netCashflow: raw.netCashflow,
    discretionarySpending: raw.discretionarySpending,
    essentialSpending: raw.essentialSpending,
    categories: raw.categories || [],
    monthlyTrend: raw.monthlyTrend || [],
    anomalies: raw.anomalies || [],
    recurringPayments: raw.recurringPayments || [],
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
    id: `copilot-${Date.now()}`,
    sender: "assistant",
    text: raw.response,
    timestamp: raw.timestamp || new Date().toISOString(),
    sources,
    groundingFacts,
    suggestedFollowups,
    keyPoints: raw.key_points || [],
    personalizedInsights: raw.personalized_insights || [],
    groundingSummary: raw.grounding_summary
      ? {
          retrievedChunksCount: raw.grounding_summary.retrieved_chunks_count,
          retrievalUsed: raw.grounding_summary.retrieval_used,
          personalContextUsed: raw.grounding_summary.personal_context_used,
          retrievalLatencyMs: raw.grounding_summary.retrieval_latency_ms,
          totalLatencyMs: raw.grounding_summary.total_latency_ms,
        }
      : undefined,
    disclaimer: raw.disclaimer,
    isDemoResponse: raw.is_demo ?? true,
  };

  return {
    message,
    sources,
    groundingFacts,
    suggestedFollowups,
  };
}
