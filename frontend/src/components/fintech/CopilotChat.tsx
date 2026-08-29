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
  RefreshCw
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
        text: "I experienced an error connecting to the intelligence pipeline. Please try asking again.",
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[640px] bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-800 bg-[#0B101B] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 p-[1px] flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100">Ask CreditLens Intelligence</h3>
              <Badge variant="violet" size="sm">GenAI + RAG</Badge>
            </div>
            <p className="text-[10px] text-slate-400">Grounded strictly in financial metrics and regulatory citations</p>
          </div>
        </div>

        <button
          onClick={() => setMessages(initialMessages)}
          className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          title="Reset conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";

          return (
            <div
              key={msg.id}
              className={cn(
                "flex items-start gap-3 text-xs leading-relaxed max-w-3xl",
                isUser ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold",
                  isUser
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                    : "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                )}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div
                className={cn(
                  "p-3.5 rounded-2xl",
                  isUser
                    ? "bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/20"
                    : "bg-slate-950/80 text-slate-200 border border-slate-800 rounded-tl-none space-y-2.5 shadow-sm"
                )}
              >
                <div className="whitespace-pre-line prose prose-invert max-w-none text-xs">
                  {msg.text}
                </div>

                {/* Grounding Facts Highlight if present */}
                {msg.groundingFacts && msg.groundingFacts.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Deterministic Pipeline Inputs
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {msg.groundingFacts.map((fact, idx) => (
                        <div key={idx} className="bg-slate-900 p-1.5 rounded-lg border border-slate-800 text-[10px]">
                          <span className="text-slate-400 block">{fact.label}</span>
                          <span className="font-mono font-semibold text-emerald-400">{fact.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Followups */}
                {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Suggested Follow-Ups
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedFollowups.map((followup, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(followup)}
                          className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700/80 text-left transition-colors flex items-center gap-1"
                        >
                          <span>{followup}</span>
                          <ArrowRight className="w-3 h-3 text-purple-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className={cn("text-[10px] text-right mt-1", isUser ? "text-blue-200" : "text-slate-500")}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] text-slate-400 ml-2">Retrieving sources & synthesizing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          Topics:
        </span>
        {SUGGESTED_COPILOT_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-[11px] whitespace-nowrap bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-800 transition-colors"
          >
            {q.length > 36 ? `${q.substring(0, 36)}...` : q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-[#0B101B] border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about your credit utilization, risk factors, or RBI guidelines..."
            className="flex-1 bg-slate-900 text-slate-100 text-xs placeholder:text-slate-500 rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
          <Button
            type="submit"
            size="md"
            variant="primary"
            disabled={!inputValue.trim() || isTyping}
            className="bg-purple-600 hover:bg-purple-500 border-purple-500/30 px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
