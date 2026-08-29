import React from "react";
import { Button } from "./Button";
import { FolderOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="fintech-card p-10 flex flex-col items-center justify-center text-center max-w-md mx-auto my-6 border-dashed border-slate-700/80">
      <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        {icon || <FolderOpen className="w-7 h-7" />}
      </div>
      <h4 className="text-base font-bold text-slate-100 mb-1.5">{title}</h4>
      <p className="text-xs text-slate-400 max-w-xs mb-5 leading-relaxed">{description}</p>
      
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button size="sm" variant="emerald" rightIcon={<ArrowRight className="w-4 h-4" />}>
            {actionLabel}
          </Button>
        </Link>
      )}

      {actionLabel && onAction && !actionHref && (
        <Button size="sm" variant="emerald" onClick={onAction} rightIcon={<ArrowRight className="w-4 h-4" />}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
