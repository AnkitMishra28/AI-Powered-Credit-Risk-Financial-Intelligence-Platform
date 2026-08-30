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
  FileSpreadsheet
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
    title: "Why did my Credit Health Score change?",
    desc: "Analyze factor impacts and the +18 pt gain from on-time payment consistency.",
    icon: TrendingUp,
    query: "Why did my Credit Health Score change and what factors contributed most?",
  },
  {
    title: "What happens if I only pay the minimum?",
    desc: "Calculate revolving interest compounding and APR penalties under RBI rules.",
    icon: CreditCard,
    query: "What happens if I only pay the minimum amount on my credit card?",
  },
  {
    title: "Where did I overspend this month?",
    desc: "Examine the +31% dining surge vs 3-month trailing benchmark.",
    icon: AlertTriangle,
    query: "Explain my 31% dining spending increase vs my 3-month average.",
  },
  {
    title: "How can I reduce utilization to 30%?",
    desc: "Formulate an optimal repayment strategy for the ₹1,70,000 balance.",
    icon: ShieldCheck,
    query: "How fast will my credit health improve if I reduce utilization to 30%?",
  },
];

export function CopilotChat({
  initialMessages,
  onSourcesUpdated,
  onFactsUpdated,
}: CopilotChatProps) {
  const [messages, setMessages] = useState<CopilotMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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

    try {
      const response = await copilotService.askQuestion(textToSend);
      setMessages((prev) => [...prev, response.message]);
      if (onSourcesUpdated && response.sources) {
        onSourcesUpdated(response.sources);
      }
      if (onFactsUpdated && response.groundingFacts) {
        onFactsUpdated(response.groundingFacts);
      }
    } catch {
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
    <div className="flex flex-col h-[700px] bg-[#070B08] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
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
              <h3 className="text-sm font-bold text-white tracking-tight">CreditLens Intelligence Copilot</h3>
              <Badge variant="emerald" size="sm">Grounded AI</Badge>
            </div>
            <p className="text-xs text-neutral-400">Strictly grounded in deterministic financial data & regulatory sources</p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="text-neutral-400 hover:text-white p-2 rounded-xl hover:bg-[#101712] transition-colors border border-transparent hover:border-white/10"
          title="Reset conversation"
          aria-label="Reset conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages / Intelligence Scroll Canvas */}
      <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 bg-[#050706]">
        {/* Onboarding Suggestion Cards if conversation has only initial greeting */}
        {messages.length <= 1 && (
          <div className="space-y-4 my-2">
            <div className="p-5 rounded-2xl bg-[#090E0A] border border-emerald-500/20 text-center space-y-2 relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Financial Intelligence Workspace</span>
              </div>
              <h4 className="text-base font-bold text-white tracking-tight">
                Ask CreditLens — Understand the Signals Behind Your Financial Profile
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
                {/* Main Text Content */}
                <div className="whitespace-pre-line prose prose-invert max-w-none text-sm leading-relaxed">
                  {msg.text}
                </div>

                {/* Grounding Facts Highlight Matrix */}
                {msg.groundingFacts && msg.groundingFacts.length > 0 && (
                  <div className="pt-3 border-t border-white/[0.08] mt-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      Deterministic Pipeline Inputs
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {msg.groundingFacts.map((fact, idx) => (
                        <div key={idx} className="bg-[#0E1510] p-2.5 rounded-xl border border-white/[0.06] text-xs">
                          <span className="text-neutral-400 block text-xs">{fact.label}</span>
                          <span className="font-mono font-bold text-emerald-400 text-xs mt-0.5 block">{fact.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Followups */}
                {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                  <div className="pt-3 border-t border-white/[0.08] space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
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

                <div className={cn("text-xs text-right mt-1.5", isUser ? "text-emerald-400/80" : "text-neutral-400")}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isTyping && (
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <div className="w-8 h-8 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#0B110D] border border-white/10 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-neutral-400 ml-2">Retrieving regulatory sources & synthesizing grounded answer...</span>
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
