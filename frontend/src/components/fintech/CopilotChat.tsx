"use client";

import React, { useState, useRef, useEffect } from "react";
import { CopilotMessage, CitationSource, GroundingFact } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Bot,
  User,
  Send,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  BookOpen,
  ExternalLink,
  Shield,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { copilotService } from "@/services/copilotService";
import { SUGGESTED_COPILOT_QUESTIONS } from "@/lib/constants";

export interface CopilotChatProps {
  initialMessages: CopilotMessage[];
  onSourcesUpdated?: (sources: CitationSource[]) => void;
  onFactsUpdated?: (facts: GroundingFact[]) => void;
}

let messageSeq = 1000;
function createMessageId(prefix: string): string {
  messageSeq += 1;
  return `${prefix}-${messageSeq}`;
}

const ONBOARDING_PROMPTS = [
  {
    title: "What happens if I only pay the minimum?",
    desc: "Examine revolving interest compounding, daily APR, and RBI disclosure mandates.",
    icon: CreditCard,
    query: "What happens if I only pay the minimum amount on my credit card?",
  },
  {
    title: "Why did my Credit Health Score reach 775?",
    desc: "Analyze factor weights: 94% payment consistency vs 68% credit utilization drag.",
    icon: TrendingUp,
    query: "Why is my Credit Health Score 775 and what drives it?",
  },
  {
    title: "Where is my spending surging this month?",
    desc: "Investigate the +31% Food & Dining surge vs your 3-month rolling baseline.",
    icon: AlertTriangle,
    query: "Why did my dining spending increase 31% this month?",
  },
  {
    title: "How can I reduce utilization to <30%?",
    desc: "Formulate optimal repayment and mid-cycle statement management strategies.",
    icon: ShieldCheck,
    query: "How can I reduce my revolving credit utilization below 30%?",
  },
];

const PROCESSING_STEPS = [
  "Retrieving authoritative regulatory sources (RBI / Credit Standards)...",
  "Extracting deterministic CreditLens profile metrics...",
  "Synthesizing grounded financial intelligence...",
];

export function CopilotChat({
  initialMessages,
  onSourcesUpdated,
  onFactsUpdated,
}: CopilotChatProps) {
  const [messages, setMessages] = useState<CopilotMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, processingStep]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputValue.trim();
    if (!textToSend || isTyping) return;

    const userMsgId = createMessageId("msg-user");
    const userMessage: CopilotMessage = {
      id: userMsgId,
      sender: "user",
      text: textToSend,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInputValue("");
    setIsTyping(true);
    setProcessingStep(0);

    // Multi-stage thinking animation
    const stepInterval = setInterval(() => {
      setProcessingStep((prev) => (prev < PROCESSING_STEPS.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      const response = await copilotService.askQuestion(textToSend);
      clearInterval(stepInterval);
      setMessages((prev) => [...prev, response.message]);
      if (onSourcesUpdated && response.sources) {
        onSourcesUpdated(response.sources);
      }
      if (onFactsUpdated && response.groundingFacts) {
        onFactsUpdated(response.groundingFacts);
      }
    } catch {
      clearInterval(stepInterval);
      const errMsgId = createMessageId("msg-err");
      const errorMessage: CopilotMessage = {
        id: errMsgId,
        sender: "assistant",
        text: "I experienced an error communicating with the financial intelligence pipeline. Please try asking again.",
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    setMessages(initialMessages);
  };

  return (
    <div className="flex flex-col h-[750px] bg-[#070B08] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Workspace Header */}
      <div className="px-5 py-4 border-b border-white/[0.08] bg-[#090E0A] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-lime-400 p-[1.5px] shadow-md shadow-emerald-950/60 flex items-center justify-center">
            <div className="w-full h-full bg-[#070B08] rounded-[10px] flex items-center justify-center">
              <Bot className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">Ask CreditLens Intelligence</h3>
              <Badge variant="emerald" size="sm">
                RAG + Grounded
              </Badge>
            </div>
            <p className="text-xs text-neutral-400">
              Grounded in RBI Master Directions & your deterministic profile
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-400 font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Shield className="w-3 h-3 text-emerald-400" /> Zero Hallucination Guardrails
          </span>
          <button
            onClick={handleReset}
            className="text-neutral-400 hover:text-white p-2 rounded-xl hover:bg-[#101712] transition-colors border border-transparent hover:border-white/10"
            title="Reset conversation"
            aria-label="Reset conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Canvas */}
      <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 bg-[#050706]">
        {/* Onboarding Suggestion Cards */}
        {messages.length <= 1 && (
          <div className="space-y-4 my-2">
            <div className="p-5 rounded-2xl bg-[#090E0A] border border-emerald-500/20 text-center space-y-2 relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Financial Research Workspace</span>
              </div>
              <h4 className="text-base font-bold text-white tracking-tight">
                Ask CreditLens — Grounded Intelligence Behind Your Financial Profile
              </h4>
              <p className="text-xs text-neutral-400 max-w-xl mx-auto leading-relaxed">
                Select a recommended query below to explore deterministic credit calculations, utilization impact simulations, and regulatory disclosures.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ONBOARDING_PROMPTS.map((prompt, idx) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt.query)}
                    className="p-4 rounded-xl bg-[#0B110D] border border-white/[0.08] hover:border-emerald-500/40 text-left transition-all group hover:bg-[#0E1510] flex items-start gap-3 shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-xs text-white block group-hover:text-emerald-300 transition-colors">
                        {prompt.title}
                      </span>
                      <p className="text-xs text-neutral-400 mt-1 leading-snug">
                        {prompt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((msg) => {
          const isUser = msg.sender === "user";

          return (
            <div
              key={msg.id}
              className={cn(
                "flex items-start gap-3.5 text-sm leading-relaxed max-w-3xl",
                isUser ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold border",
                  isUser
                    ? "bg-[#101712] text-emerald-300 border-emerald-500/30 shadow-sm"
                    : "bg-emerald-950/60 text-emerald-300 border-emerald-500/30 shadow-md shadow-emerald-950/50"
                )}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble Container */}
              <div
                className={cn(
                  "p-4 md:p-5 rounded-2xl transition-all",
                  isUser
                    ? "bg-[#101712] text-white rounded-tr-none border border-emerald-500/30 shadow-lg shadow-black/40"
                    : "bg-[#0B110D] text-neutral-200 border border-white/[0.08] rounded-tl-none space-y-4 shadow-xl"
                )}
              >
                {/* Main Grounded Narrative */}
                <div className="whitespace-pre-line prose prose-invert max-w-none text-xs md:text-sm leading-relaxed text-neutral-200">
                  {msg.text}
                </div>

                {/* Key Points Takeaway Box */}
                {msg.keyPoints && msg.keyPoints.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-[#0E1510] border border-white/[0.06] space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Key Grounded Takeaways
                    </span>
                    <ul className="space-y-1.5 text-xs text-neutral-300">
                      {msg.keyPoints.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Personalized Insights Highlight Banner */}
                {msg.personalizedInsights && msg.personalizedInsights.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      Personalized Profile Insights
                    </span>
                    {msg.personalizedInsights.map((insight, iIdx) => (
                      <p key={iIdx} className="text-xs text-neutral-200 leading-relaxed">
                        {insight}
                      </p>
                    ))}
                  </div>
                )}

                {/* Grounding Facts Highlight Matrix */}
                {msg.groundingFacts && msg.groundingFacts.length > 0 && (
                  <div className="pt-3 border-t border-white/[0.08]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      Deterministic Pipeline Inputs
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {msg.groundingFacts.map((fact, idx) => (
                        <div key={idx} className="bg-[#0E1510] p-2.5 rounded-xl border border-white/[0.06] text-xs">
                          <span className="text-neutral-400 block text-[11px]">{fact.label}</span>
                          <span className="font-mono font-bold text-emerald-400 text-xs mt-0.5 block">{fact.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grounded Sources Chips */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-3 border-t border-white/[0.08] space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                      Verified Knowledge Sources ({msg.sources.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((src, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-2 rounded-lg bg-[#0E1510] border border-white/[0.07] text-xs flex items-center gap-2"
                        >
                          <span className="text-emerald-400 font-bold text-[10px]">[{sIdx + 1}]</span>
                          <span className="text-neutral-300 font-medium text-[11px] truncate max-w-[200px]" title={src.title}>
                            {src.title}
                          </span>
                          {src.url && (
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-neutral-400 hover:text-emerald-400"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Followups */}
                {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                  <div className="pt-3 border-t border-white/[0.08] space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Recommended Follow-Up Inquiries
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {msg.suggestedFollowups.map((followup, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(followup)}
                          className="text-xs bg-[#0E1510] hover:bg-[#141F17] text-neutral-300 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 hover:border-emerald-500/40 text-left transition-colors flex items-center gap-2"
                        >
                          <span>{followup}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Timestamp & Grounding Badge */}
                <div className="flex items-center justify-between pt-2 text-[11px] text-neutral-500">
                  <span className="flex items-center gap-1 text-emerald-400/90 font-medium">
                    <Layers className="w-3 h-3 text-emerald-400" />
                    {msg.sources && msg.sources.length > 0
                      ? `Grounded in ${msg.sources.length} verified sources`
                      : "Grounded in CreditLens Intelligence"}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator with Multi-Stage Animation */}
        {isTyping && (
          <div className="flex items-start gap-3.5 text-sm max-w-2xl">
            <div className="w-8 h-8 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-[#0B110D] border border-emerald-500/30 px-5 py-4 rounded-2xl rounded-tl-none space-y-2.5 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{PROCESSING_STEPS[processingStep]}</span>
              </div>
              <div className="w-48 bg-white/[0.08] h-1 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all duration-300 ease-out"
                  style={{ width: `${((processingStep + 1) / PROCESSING_STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-2.5 bg-[#090E0A] border-t border-white/[0.08] flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider shrink-0">
          Topics:
        </span>
        {SUGGESTED_COPILOT_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-xs whitespace-nowrap bg-[#0E1510] hover:bg-[#141F17] text-neutral-300 hover:text-white px-3 py-1 rounded-lg border border-white/10 hover:border-emerald-500/30 transition-colors"
          >
            {q.length > 40 ? `${q.substring(0, 40)}...` : q}
          </button>
        ))}
      </div>

      {/* Premium Message Composer */}
      <div className="p-4 bg-[#090E0A] border-t border-white/[0.08] space-y-2">
        <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-neutral-300 font-medium">Grounding Matrix:</span> Alex Mercer Profile + RBI Master Directions
          </span>
          <span className="hidden sm:inline text-neutral-400">Press Enter to Send</span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2.5"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask CreditLens about your credit utilization, risk factors, or RBI guidelines..."
            className="flex-1 bg-[#050706] text-white text-sm placeholder:text-neutral-500 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
          <Button
            type="submit"
            size="md"
            variant="primary"
            disabled={!inputValue.trim() || isTyping}
            className="px-5 py-3 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
