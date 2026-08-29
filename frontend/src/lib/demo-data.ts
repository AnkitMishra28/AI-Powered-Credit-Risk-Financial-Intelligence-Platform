import {
  UserProfile,
  FinancialProfile,
  CreditHealthData,
  RiskAnalysisData,
  SpendingIntelligenceData,
  CopilotMessage,
  InsightNotification
} from "@/types";

export const DEMO_USER: UserProfile = {
  id: 1,
  email: "alex.mercer@fintech.demo",
  fullName: "Alex Mercer",
  role: "Senior Product Analyst",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
  isDemo: true,
};

export const DEMO_FINANCIAL_PROFILE: FinancialProfile = {
  monthlyIncome: 65000,
  employmentType: "Salaried (Full-Time)",
  creditLimitTotal: 250000,
  revolvingBalanceTotal: 170000,
  cibilReferenceScore: 755,
  activeLoansCount: 1,
  totalMonthlyEMI: 8500,
};

export const DEMO_CREDIT_HEALTH: CreditHealthData = {
  healthScore: 742,
  scoreTier: "Healthy",
  scoreDelta: 18,
  calculationDate: "2026-03-28T10:00:00Z",
  factors: [
    {
      factorId: "payment_history",
      name: "Payment History",
      score: 92,
      weight: 0.35,
      status: "optimal",
      description: "Consistent on-time payments across all accounts with no missed cycles in 12 months.",
      impactDetail: "+140 pts to score baseline"
    },
    {
      factorId: "credit_utilization",
      name: "Credit Utilization",
      score: 68,
      weight: 0.30,
      status: "warning",
      description: "Using ₹1,70,000 of available ₹2,50,000 aggregate credit card limit (68%).",
      impactDetail: "-35 pts drag on optimal score (<30% recommended)"
    },
    {
      factorId: "debt_to_income",
      name: "Debt-to-Income",
      score: 31,
      weight: 0.15,
      status: "good",
      description: "Monthly debt obligations represent 31.2% of ₹65,000 monthly take-home income.",
      impactDetail: "Well within safe institutional borrowing corridor (<36%)"
    },
    {
      factorId: "repayment_pattern",
      name: "Repayment Pattern",
      score: 94,
      weight: 0.10,
      status: "optimal",
      description: "11 consecutive months of zero delinquencies or minimum-only payment traps.",
      impactDetail: "Strong indicator of cashflow liquidity"
    },
    {
      factorId: "credit_history",
      name: "Credit Line Age",
      score: 71,
      weight: 0.05,
      status: "good",
      description: "Average age of open credit accounts is 4.2 years.",
      impactDetail: "Adequate credit seasoning"
    },
    {
      factorId: "recent_spending",
      name: "Recent Spending Velocity",
      score: 76,
      weight: 0.05,
      status: "good",
      description: "Monthly total outflow is 1.08x of your 6-month historical baseline.",
      impactDetail: "Controlled discretionary expansion"
    }
  ],
  history: [
    { month: "Oct", score: 710, utilization: 74 },
    { month: "Nov", score: 718, utilization: 72 },
    { month: "Dec", score: 725, utilization: 71 },
    { month: "Jan", score: 730, utilization: 70 },
    { month: "Feb", score: 724, utilization: 75 },
    { month: "Mar", score: 742, utilization: 68 },
  ],
  disclaimer: "CreditLens Credit Health Score is an educational and behavioral diagnostic metric. It is not an official CIBIL/Experian score and does not constitute credit underwriting advice."
};

export const DEMO_RISK_ANALYSIS: RiskAnalysisData = {
  riskCategory: "LOW RISK",
  confidencePercentage: 87.0,
  probabilityDistribution: {
    lowRisk: 0.82,
    mediumRisk: 0.14,
    highRisk: 0.04,
  },
  topPositiveFactors: [
    "Consistent on-time payment track record (94% repayment consistency ratio)",
    "Stable primary income stream verified at ₹65,000 / month",
    "Moderate debt-to-income ratio (31.2% within standard safety threshold)",
    "No historical charge-offs, loan restructuring, or collection remarks"
  ],
  riskFactors: [
    "Revolving credit utilization is at 68%, exceeding the recommended <30% target",
    "Recent dining & leisure expenditure increased 31% above 3-month trailing average",
    "Single card balance concentration (82% of balance carried on primary card)"
  ],
  modelExplainability: [
    {
      featureName: "payment_consistency_ratio",
      displayName: "Payment Consistency (11 Months)",
      impactValue: 0.42,
      featureValue: "0.94",
      isPositive: true,
    },
    {
      featureName: "debt_to_income_ratio",
      displayName: "Debt-to-Income (DTI)",
      impactValue: 0.28,
      featureValue: "31.2%",
      isPositive: true,
    },
    {
      featureName: "income_stability_index",
      displayName: "Monthly Income Stability",
      impactValue: 0.19,
      featureValue: "₹65,000",
      isPositive: true,
    },
    {
      featureName: "revolving_utilization_pct",
      displayName: "Revolving Credit Utilization",
      impactValue: -0.35,
      featureValue: "68.0%",
      isPositive: false,
    },
    {
      featureName: "discretionary_spend_spike",
      displayName: "Discretionary Dining Volatility",
      impactValue: -0.14,
      featureValue: "+31.0%",
      isPositive: false,
    },
  ],
  modelVersion: "creditlens-risk-xgb-v1.2",
  evaluatedAt: "2026-03-28T10:00:00Z",
  disclaimer: "Machine learning risk categorizations are algorithmic probability estimates intended for risk awareness and financial literacy."
};

export const DEMO_SPENDING_INTELLIGENCE: SpendingIntelligenceData = {
  totalSpendingCurrentMonth: 49230,
  spendingDeltaPct: -4.2,
  averageMonthlySpend: 50055,
  categories: [
    { category: "Food & Dining", amount: 14200, percentage: 28.8, color: "#10B981", monthOverMonthChangePct: 31.0 },
    { category: "Shopping", amount: 11850, percentage: 24.1, color: "#3B82F6", monthOverMonthChangePct: -8.4 },
    { category: "Utilities & Bills", amount: 7600, percentage: 15.4, color: "#8B5CF6", monthOverMonthChangePct: 2.1 },
    { category: "Transport & Fuel", amount: 5400, percentage: 11.0, color: "#F59E0B", monthOverMonthChangePct: -4.5 },
    { category: "Entertainment", amount: 4180, percentage: 8.5, color: "#EC4899", monthOverMonthChangePct: 12.0 },
    { category: "Healthcare", amount: 3200, percentage: 6.5, color: "#06B6D4", monthOverMonthChangePct: -15.0 },
    { category: "Other", amount: 2800, percentage: 5.7, color: "#64748B", monthOverMonthChangePct: 0.0 },
  ],
  monthlyTrend: [
    { month: "Oct", amount: 46200, budget: 50000 },
    { month: "Nov", amount: 51400, budget: 50000 },
    { month: "Dec", amount: 54800, budget: 52000 },
    { month: "Jan", amount: 47300, budget: 50000 },
    { month: "Feb", amount: 51400, budget: 50000 },
    { month: "Mar", amount: 49230, budget: 50000 },
  ],
  anomalies: [
    {
      id: "anom-001",
      category: "Food & Dining",
      title: "Dining Spending Spike",
      description: "Your dining expenditure increased 31% compared with your 3-month rolling average (₹10,840 avg vs ₹14,200 actual).",
      percentageAboveAverage: 31.0,
      historicalAverage: 10840,
      currentAmount: 14200,
      severity: "warning",
    },
    {
      id: "anom-002",
      category: "Entertainment",
      title: "Subscription Renewal Clustered",
      description: "3 digital subscriptions auto-renewed in a 48-hour period totaling ₹1,899.",
      percentageAboveAverage: 12.0,
      historicalAverage: 3700,
      currentAmount: 4180,
      severity: "info",
    }
  ],
  recentTransactions: [
    { id: "tx-101", date: "2026-03-28", merchant: "Swiggy Gourmet", category: "Food & Dining", amount: 1240.00, accountType: "Credit Card (HDFC)", isAnomaly: true, anomalyReason: "Category velocity +31%" },
    { id: "tx-102", date: "2026-03-27", merchant: "Amazon Retail India", category: "Shopping", amount: 3499.00, accountType: "Credit Card (ICICI)", isAnomaly: false },
    { id: "tx-103", date: "2026-03-26", merchant: "Uber Premier", category: "Transport & Fuel", amount: 620.00, accountType: "Credit Card (HDFC)", isAnomaly: false },
    { id: "tx-104", date: "2026-03-25", merchant: "Netflix Premium India", category: "Entertainment", amount: 649.00, accountType: "Credit Card (HDFC)", isAnomaly: false },
    { id: "tx-105", date: "2026-03-24", merchant: "Tata Power Electricity", category: "Utilities & Bills", amount: 2850.00, accountType: "Bank Account (HDFC)", isAnomaly: false },
    { id: "tx-106", date: "2026-03-23", merchant: "Apollo Pharmacy", category: "Healthcare", amount: 1120.00, accountType: "Credit Card (ICICI)", isAnomaly: false },
    { id: "tx-107", date: "2026-03-22", merchant: "Zomato Dining Out", category: "Food & Dining", amount: 2180.00, accountType: "Credit Card (HDFC)", isAnomaly: true, anomalyReason: "Weekend dining spike" },
    { id: "tx-108", date: "2026-03-20", merchant: "HP Petrol Pump", category: "Transport & Fuel", amount: 2500.00, accountType: "Credit Card (ICICI)", isAnomaly: false },
    { id: "tx-109", date: "2026-03-18", merchant: "Cult.fit Fitness Pass", category: "Healthcare", amount: 1800.00, accountType: "Credit Card (HDFC)", isAnomaly: false },
    { id: "tx-110", date: "2026-03-16", merchant: "BookMyShow IMAX", category: "Entertainment", amount: 890.00, accountType: "Credit Card (ICICI)", isAnomaly: false },
  ]
};

export const INITIAL_COPILOT_MESSAGES: CopilotMessage[] = [
  {
    id: "msg-welcome",
    sender: "assistant",
    text: "Welcome to **Ask CreditLens**. I am your financial intelligence copilot, grounded strictly in your structured financial metrics, verified credit guidelines, and regulatory frameworks.\n\nHow can I help you analyze your credit health, spending patterns, or risk factors today?",
    timestamp: "10:00 AM",
    suggestedFollowups: [
      "What happens if I only pay the minimum amount on my credit card?",
      "Why is my credit utilization at 68%?",
      "How can I improve my Credit Health Score above 800?",
      "What caused my 31% dining spending increase?"
    ],
    isDemoResponse: true
  }
];

export const DEMO_NOTIFICATIONS: InsightNotification[] = [
  {
    id: "notif-1",
    type: "anomaly",
    title: "Dining Spend Anomaly Detected",
    message: "Food & Dining spending reached ₹14,200 (+31% over 3-month average).",
    timestamp: "2 hours ago",
    read: false,
    metricReference: "Spending Intelligence"
  },
  {
    id: "notif-2",
    type: "health",
    title: "Credit Health Score Gained +18 Pts",
    message: "Your score reached 742 / 1000 due to 11 consecutive months of on-time payments.",
    timestamp: "Yesterday",
    read: false,
    metricReference: "Credit Health"
  },
  {
    id: "notif-3",
    type: "risk",
    title: "Utilization Advisory",
    message: "Revolving card utilization is 68%. Bringing balance below ₹75,000 will reduce risk.",
    timestamp: "3 days ago",
    read: true,
    metricReference: "Risk Analysis"
  }
];
