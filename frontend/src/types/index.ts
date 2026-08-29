export type RiskLevel = "LOW RISK" | "MEDIUM RISK" | "HIGH RISK";

export type HealthTier = "Excellent" | "Healthy" | "Fair" | "Needs Attention";

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
  isDemo: boolean;
}

export interface FinancialProfile {
  monthlyIncome: number;
  employmentType: string;
  creditLimitTotal: number;
  revolvingBalanceTotal: number;
  cibilReferenceScore?: number;
  activeLoansCount: number;
  totalMonthlyEMI: number;
}

export interface HealthFactor {
  factorId: string;
  name: string;
  score: number; // 0 - 100
  weight: number; // e.g. 0.35
  status: "optimal" | "good" | "warning" | "critical";
  description: string;
  impactDetail: string;
}

export interface CreditHealthHistoryPoint {
  month: string;
  score: number;
  utilization: number;
}

export interface CreditHealthData {
  healthScore: number; // 0 - 1000
  scoreTier: HealthTier;
  scoreDelta: number; // e.g. +18
  calculationDate: string;
  factors: HealthFactor[];
  history: CreditHealthHistoryPoint[];
  disclaimer: string;
}

export interface ShapContribution {
  featureName: string;
  displayName: string;
  impactValue: number;
  featureValue: string;
  isPositive: boolean;
}

export interface ProbabilityDistribution {
  lowRisk: number; // 0 - 1.0
  mediumRisk: number;
  highRisk: number;
}

export interface RiskAnalysisData {
  riskCategory: RiskLevel;
  confidencePercentage: number;
  probabilityDistribution: ProbabilityDistribution;
  topPositiveFactors: string[];
  riskFactors: string[];
  modelExplainability: ShapContribution[];
  modelVersion: string;
  evaluatedAt: string;
  disclaimer: string;
}

export interface CategorySpend {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  monthOverMonthChangePct: number;
}

export interface MonthlySpendTrend {
  month: string;
  amount: number;
  budget: number;
}

export interface SpendingAnomaly {
  id: string;
  category: string;
  title: string;
  description: string;
  percentageAboveAverage: number;
  historicalAverage: number;
  currentAmount: number;
  severity: "info" | "warning" | "critical";
}

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  accountType: string;
  isAnomaly: boolean;
  anomalyReason?: string;
}

export interface SpendingIntelligenceData {
  totalSpendingCurrentMonth: number;
  spendingDeltaPct: number;
  averageMonthlySpend: number;
  categories: CategorySpend[];
  monthlyTrend: MonthlySpendTrend[];
  anomalies: SpendingAnomaly[];
  recentTransactions: Transaction[];
}

export interface CitationSource {
  id: string;
  title: string;
  publisher: string;
  docType: string;
  excerpt: string;
  url?: string;
  relevanceScore?: number;
}

export interface GroundingFact {
  label: string;
  value: string;
}

export interface CopilotMessage {
  id: string;
  sender: "user" | "assistant" | "system";
  text: string;
  timestamp: string;
  sources?: CitationSource[];
  groundingFacts?: GroundingFact[];
  suggestedFollowups?: string[];
  isDemoResponse?: boolean;
}

export interface InsightNotification {
  id: string;
  type: "anomaly" | "risk" | "health" | "tip";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  metricReference?: string;
}
