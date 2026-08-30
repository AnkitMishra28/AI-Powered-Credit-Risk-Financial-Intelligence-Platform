"use client";

import React, { useState } from "react";
import { CitationSource } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { BookOpen, ExternalLink, ChevronDown, ChevronUp, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SourceCitationPanelProps {
  sources: CitationSource[];
  className?: string;
}

export function SourceCitationPanel({ sources, className }: SourceCitationPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(sources[0]?.id || null);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            Grounding Citations & Sources
          </h3>
        </div>
        <Badge variant="emerald" size="sm">
          RAG Verified
        </Badge>
      </div>

      <p className="text-xs text-neutral-400 leading-relaxed">
        Copilot explanations are strictly grounded in regulatory guidelines and credit standards retrieved via semantic vector search.
      </p>

      <div className="space-y-3">
        {sources.map((src) => {
          const isExpanded = expandedId === src.id;

          return (
            <div
              key={src.id}
              className={cn(
                "p-3.5 rounded-xl bg-[#0E1510] border transition-all text-xs",
                isExpanded ? "border-emerald-500/40 shadow-sm shadow-emerald-950/40" : "border-white/[0.07] hover:border-emerald-500/25"
              )}
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : src.id)}
                className="flex items-start justify-between gap-2 cursor-pointer select-none"
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 mt-0.5 shrink-0 border border-emerald-500/20">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-neutral-200 block leading-snug hover:text-emerald-300 transition-colors">
                      {src.title}
                    </span>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs text-neutral-400 font-semibold">{src.publisher}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-[#141F17] text-emerald-300 border border-emerald-500/20 font-medium">
                        {src.docType}
                      </span>
                    </div>
                  </div>
                </div>

                <button className="text-neutral-400 hover:text-white p-1 shrink-0" aria-label="Toggle citation">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-white/[0.08] text-xs text-neutral-300 bg-[#070B08] p-3 rounded-lg leading-relaxed animate-in fade-in space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Grounded Excerpt
                    </span>
                    {src.relevanceScore && (
                      <span className="font-mono text-neutral-400 font-semibold">
                        {(src.relevanceScore * 100).toFixed(0)}% Relevance
                      </span>
                    )}
                  </div>
                  <p className="font-serif italic text-neutral-300">&ldquo;{src.excerpt}&rdquo;</p>
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold mt-1"
                    >
                      <span>Official Regulatory Circular</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
