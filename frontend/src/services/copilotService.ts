import { fetchApi } from "./api";
import { CopilotMessage, CitationSource, GroundingFact } from "@/types";
import { ApiCopilotResponsePayload } from "@/types/api";
import { mapCopilotResponse } from "./mappers";

export interface CopilotHistoryItem {
  id: number;
  conversation_id: string;
  query: string;
  answer: string;
  sources?: Record<string, unknown>[];
  key_points?: string[];
  personalized_insights?: string[];
  created_at: string;
}

export const copilotService = {
  /**
   * Sends a question to the RAG + Gemini Copilot. There is intentionally NO
   * client-side fabricated fallback: if the pipeline is unreachable this rejects
   * and the caller renders an error state. A real user must never be shown
   * invented personal figures (utilization, score, balances) in place of a real
   * grounded answer.
   */
  async askQuestion(
    query: string,
    conversationId?: string
  ): Promise<{
    message: CopilotMessage;
    sources: CitationSource[];
    groundingFacts: GroundingFact[];
    suggestedFollowups: string[];
  }> {
    const raw = await fetchApi<ApiCopilotResponsePayload>(
      "/copilot/query",
      {
        method: "POST",
        body: JSON.stringify({
          query,
          conversation_id: conversationId,
          include_sources: true,
          include_personal_context: true,
        }),
      }
    );

    return mapCopilotResponse(raw);
  },

  async getHistory(limit: number = 20): Promise<CopilotHistoryItem[]> {
    try {
      const data = await fetchApi<CopilotHistoryItem[]>(
        `/copilot/history?limit=${limit}`,
        { method: "GET" },
        []
      );
      return data || [];
    } catch {
      return [];
    }
  }
};
