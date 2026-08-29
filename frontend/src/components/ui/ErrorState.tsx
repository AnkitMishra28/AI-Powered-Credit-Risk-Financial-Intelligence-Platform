import React from "react";
import { Button } from "./Button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function ErrorState({
  title = "Failed to load financial intelligence",
  description = "An unexpected error occurred while communicating with the analysis pipeline. Please check connection and retry.",
  onRetry,
  isRetrying = false,
}: ErrorStateProps) {
  return (
    <div className="fintech-card p-8 flex flex-col items-center justify-center text-center max-w-md mx-auto my-6 border-rose-500/30 bg-rose-500/5">
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-slate-100 mb-1">{title}</h4>
      <p className="text-xs text-slate-400 max-w-xs mb-4 leading-relaxed">{description}</p>
      
      {onRetry && (
        <Button
          size="sm"
          variant="secondary"
          isLoading={isRetrying}
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Retry Pipeline
        </Button>
      )}
    </div>
  );
}
