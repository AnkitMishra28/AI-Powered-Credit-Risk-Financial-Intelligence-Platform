import React from "react";
import { cn } from "@/lib/utils";

export interface RadialGaugeProps {
  score: number; // 0 - 1000
  maxScore?: number;
  tier?: string;
  delta?: number;
  size?: number;
  className?: string;
}

export function RadialGauge({
  score,
  maxScore = 1000,
  tier = "Healthy",
  delta = 18,
  size = 240,
  className,
}: RadialGaugeProps) {
  const percentage = Math.min(Math.max(score / maxScore, 0), 1);
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  // We use a 240-degree arc from 150 deg to 390 deg
  const startAngle = 150;
  const endAngle = 390;
  const totalAngle = endAngle - startAngle;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (totalAngle / 360) * circumference;
  const strokeDashoffset = arcLength - percentage * arcLength;

  // Tier color mapping
  const getTierColor = (s: number) => {
    if (s >= 750) return { text: "text-emerald-400", gradient: "url(#emerald-grad)", glow: "rgba(16, 185, 129, 0.4)" };
    if (s >= 650) return { text: "text-blue-400", gradient: "url(#blue-grad)", glow: "rgba(59, 130, 246, 0.4)" };
    if (s >= 500) return { text: "text-amber-400", gradient: "url(#amber-grad)", glow: "rgba(245, 158, 11, 0.4)" };
    return { text: "text-rose-400", gradient: "url(#rose-grad)", glow: "rgba(244, 63, 94, 0.4)" };
  };

  const styleConfig = getTierColor(score);

  return (
    <div className={cn("relative flex flex-col items-center justify-center select-none", className)}>
      <svg
        width={size}
        height={size * 0.85}
        viewBox={`0 0 ${size} ${size * 0.85}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="amber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FB923C" />
          </linearGradient>
          <linearGradient id="rose-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F43F5E" />
            <stop offset="100%" stopColor="#BE123C" />
          </linearGradient>
          <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={styleConfig.glow} />
          </filter>
        </defs>

        {/* Background Track Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
        />

        {/* Active Value Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={styleConfig.gradient}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter="url(#gauge-glow)"
          transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
          className="transition-all duration-1000 ease-out"
        />

        {/* Min & Max Labels */}
        <text x="25" y={size * 0.8} fill="#64748b" fontSize="11" fontWeight="600">0</text>
        <text x={size - 48} y={size * 0.8} fill="#64748b" fontSize="11" fontWeight="600">1000</text>
      </svg>

      {/* Center Value Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <span className="text-xs uppercase tracking-widest font-semibold text-slate-400">
          Credit Health
        </span>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-4xl md:text-5xl font-black tracking-tight text-white font-mono">
            {score}
          </span>
          <span className="text-sm font-semibold text-slate-500 font-mono">/ 1000</span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60", styleConfig.text)}>
            {tier}
          </span>
          {delta !== 0 && (
            <span className={cn("text-xs font-semibold flex items-center", delta > 0 ? "text-emerald-400" : "text-rose-400")}>
              {delta > 0 ? "↑" : "↓"} {Math.abs(delta)} pts
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
