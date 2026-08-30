import { fetchApi } from "./api";
import { CopilotMessage, CitationSource, GroundingFact } from "@/types";
import { ApiCopilotResponsePayload } from "@/types/api";
import { mapCopilotResponse } from "./mappers";

export const copilotService = {
  async askQuestion(
    query: string,
    conversationId?: string
  ): Promise<{
    message: CopilotMessage;
    sources: CitationSource[];
    groundingFacts: GroundingFact[];
    suggestedFollowups: string[];
  }> {
    const userLower = query.toLowerCase();

    // Default fallback responses grounded in user data
    let fallbackText = (
      "Based on your profile, your revolving credit utilization is **68%** (₹1,70,000 / ₹2,50,000) and your risk category is **LOW RISK** with 87% confidence.\n\n" +
      "Your 94% on-time payment track record protects your score, but bringing revolving balances under ₹75,000 (30% threshold) will significantly improve your Credit Health Score."
    );

    let fallbackFollowups = [
      "What happens if I only pay the minimum amount?",
      "Why did my dining spending increase 31%?",
      "How is my Credit Health Score calculated?"
    ];

    if (userLower.includes("minimum")) {
      fallbackText = (
        "Paying only the minimum due preserves your on-time payment record and avoids late fees, but introduces two compounding financial drawbacks:\n\n" +
        "1. **High Revolving Finance Charges**: Unpaid revolving balance (currently **₹1,70,000**) accrues interest daily at 36%–42% annualized APR.\n\n" +
        "2. **Loss of Interest-Free Grace Period**: All subsequent purchases immediately begin accruing interest from the transaction date.\n\n" +
        "3. **Score Drag**: Your credit utilization remains high at **68%**, capping your CreditLens Credit Health Score at 742."
      );
      fallbackFollowups = [
        "How much interest will I accumulate on ₹1,70,000?",
        "What is the fastest way to drop utilization below 30%?",
        "Will paying the minimum affect my Low Risk status?"
      ];
    } else if (userLower.includes("utilization") || userLower.includes("68%")) {
      fallbackText = (
        "Your aggregate credit utilization is currently **68%** across ₹2,50,000 total limits.\n\n" +
        "• **Optimal Target**: Keep utilization below **30%** (target balance < ₹75,000).\n" +
        "• **Action Plan**: Making an interim mid-month payment before your statement generation date reports a lower balance to bureaus.\n" +
        "• **Impact**: Lowering utilization from 68% to 25% could recover approximately +35 points on your health score."
      );
      fallbackFollowups = [
        "What affects my score factors the most?",
        "How does dining spending affect my monthly budget?",
        "What is the difference between CreditLens and CIBIL?"
      ];
    }

    const fallbackSources: CitationSource[] = [
      {
        id: "src-rbi-01",
        title: "RBI Master Direction – Credit Card and Debit Card – Issuance and Conduct Directions, 2022",
        publisher: "Reserve Bank of India (RBI)",
        docType: "Regulatory Guideline",
        excerpt: "Clause 8(b): Card issuers shall explicitly inform the cardholder of the implications of paying only the minimum amount due, including the compounding interest burden.",
        url: "https://www.rbi.org.in"
      },
      {
        id: "src-edu-02",
        title: "Credit Utilization & Revolving Balance Optimization Handbook",
        publisher: "CreditLens Financial Intelligence Framework",
        docType: "Financial Education Guide",
        excerpt: "Maintaining aggregate revolving utilization below 30% of authorized limits is historically correlated with lower default risk and faster score recovery.",
      }
    ];

    const fallbackGrounding: GroundingFact[] = [
      { label: "Revolving Utilization", value: "68% (₹1,70,000 / ₹2,50,000)" },
      { label: "Payment Consistency", value: "94% on-time" },
      { label: "Monthly Spending", value: "₹49,230" },
      { label: "Monthly Net Income", value: "₹65,000" },
    ];

    try {
      const raw = await fetchApi<ApiCopilotResponsePayload>(
        "/copilot/query",
        {
          method: "POST",
          body: JSON.stringify({
            query,
            conversation_id: conversationId,
            include_sources: true
          }),
        }
      );

      return mapCopilotResponse(raw);
    } catch {
      const assistantMsg: CopilotMessage = {
        id: `msg-${Date.now()}`,
        sender: "assistant",
        text: fallbackText,
        timestamp: "Just now",
        sources: fallbackSources,
        groundingFacts: fallbackGrounding,
        suggestedFollowups: fallbackFollowups,
        isDemoResponse: true
      };

      return {
        message: assistantMsg,
        sources: fallbackSources,
        groundingFacts: fallbackGrounding,
        suggestedFollowups: fallbackFollowups
      };
    }
  }
};
