export const BRAND = {
  name: "CreditLens",
  tagline: "AI-Powered Credit Risk & Financial Intelligence Platform",
  description: "Transform complex banking statements, credit lines, and cashflow data into explainable credit health metrics and risk signals.",
  version: "1.0.0",
};

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  ONBOARDING: "/onboarding",
  DASHBOARD: "/dashboard",
  CREDIT_HEALTH: "/credit-health",
  RISK_ANALYSIS: "/risk-analysis",
  SPENDING: "/spending",
  COPILOT: "/copilot",
  SETTINGS: "/settings",
};

export const LEGAL_DISCLAIMERS = {
  NON_CIBIL: "CreditLens Credit Health Score is a proprietary educational intelligence metric and is NOT a CIBIL score or official credit bureau rating.",
  NOT_FINANCIAL_ADVICE: "CreditLens provides educational insights and automated financial pattern analysis. It does not provide regulated financial or investment advice.",
  DEMO_MODE_NOTICE: "Demo Profile Active — All financial figures, transactions, and score metrics represent synthetic data for demonstration purposes.",
};

// Generic, non-personalized prompts. These are shown to every visitor — including
// brand-new accounts with no analyzed data — so they must not imply the user
// already has specific figures (utilization %, spending deltas, a score).
export const SUGGESTED_COPILOT_QUESTIONS = [
  "What happens if I only pay the minimum amount on my credit card?",
  "How is revolving credit utilization calculated and why does it matter?",
  "What factors drive the CreditLens Credit Health Score?",
  "How does CreditLens detect spending anomalies against a rolling baseline?",
];
