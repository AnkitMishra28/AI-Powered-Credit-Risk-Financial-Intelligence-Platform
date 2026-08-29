"use client";

import React, { useState } from "react";
import { CitationSource } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { BookOpen, ExternalLink, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SourceCitationPanelProps {
  sources: CitationSource[];
  className?: string;
}

export function SourceCitationPanel({ sources, className }: SourceCitationPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(sources[0]?.id || null);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Grounding Citations & Sources
          </h3>
        </div>
        <Badge variant="violet" size="sm">
          RAG Verified
        </Badge>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">
        Copilot explanations are strictly grounded in regulatory guidelines and credit standards retrieved via semantic search.
      </p>

      <div className="space-y-3">
        {sources.map((src) => {
          const isExpanded = expandedId === src.id;

          return (
            <div
              key={src.id}
              className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition-all text-xs"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : src.id)}
                className="flex items-start justify-between gap-2 cursor-pointer select-none"
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-purple-500/10 text-purple-400 mt-0.5 shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block leading-snug hover:text-purple-300">
                      {src.title}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400 font-semibold">{src.publisher}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium">
                        {src.docType}
                      </span>
                    </div>
                  </div>
                </div>

                <button className="text-slate-500 hover:text-slate-300 p-1 shrink-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {isExpanded && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-300 bg-slate-950/40 p-2.5 rounded-lg leading-relaxed animate-in fade-in">
                  <p className="font-serif italic text-slate-300">&ldquo;{src.excerpt}&rdquo;</p>
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 mt-2 font-medium"
                    >
                      <span>View Official Circular</span>
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
