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
  size = 250,
  className,
}: RadialGaugeProps) {
  const percentage = Math.min(Math.max(score / maxScore, 0), 1);
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  // 240-degree arc from 150 deg to 390 deg
  const startAngle = 150;
  const endAngle = 390;
  const totalAngle = endAngle - startAngle;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (totalAngle / 360) * circumference;
  const strokeDashoffset = arcLength - percentage * arcLength;

  // Tier styling configuration
  const getTierColor = (s: number) => {
    if (s >= 750) {
      return {
        text: "text-emerald-400",
        badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
        gradient: "url(#emerald-grad)",
        glow: "rgba(16, 185, 129, 0.25)",
      };
    }
    if (s >= 650) {
      return {
        text: "text-emerald-300",
        badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
        gradient: "url(#emerald-grad)",
        glow: "rgba(16, 185, 129, 0.25)",
      };
    }
    if (s >= 500) {
      return {
        text: "text-amber-400",
        badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
        gradient: "url(#amber-grad)",
        glow: "rgba(245, 158, 11, 0.25)",
      };
    }
    return {
      text: "text-rose-400",
      badgeBg: "bg-rose-500/10 text-rose-300 border-rose-500/30",
      gradient: "url(#rose-grad)",
      glow: "rgba(244, 63, 94, 0.25)",
    };
  };

  const styleConfig = getTierColor(score);

  return (
    <div className={cn("relative flex flex-col items-center justify-center select-none py-2", className)}>
      <svg
        width={size}
        height={size * 0.88}
        viewBox={`0 0 ${size} ${size * 0.88}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="60%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
          <linearGradient id="amber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="rose-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E11D48" />
            <stop offset="100%" stopColor="#F43F5E" />
          </linearGradient>
          <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor={styleConfig.glow} />
          </filter>
        </defs>

        {/* Background Dark Track Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#141D17"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
        />

        {/* Active Controlled Value Arc */}
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

        {/* Range boundary labels */}
        <text x="24" y={size * 0.82} fill="#6B7280" fontSize="12" fontWeight="600" fontFamily="monospace">0</text>
        <text x={size - 52} y={size * 0.82} fill="#6B7280" fontSize="12" fontWeight="600" fontFamily="monospace">1000</text>
      </svg>

      {/* Center Value and Tier Diagnostics */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-3">
        <span className="text-xs uppercase tracking-widest font-bold text-neutral-400">
          Credit Health
        </span>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-5xl md:text-6xl font-black tracking-tight text-white font-mono">
            {score}
          </span>
          <span className="text-base font-bold text-neutral-500 font-mono">/ 1000</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className={cn("text-xs font-bold px-3 py-0.5 rounded-full border", styleConfig.badgeBg)}>
            {tier}
          </span>
          {delta !== 0 && (
            <span className={cn("text-xs font-bold flex items-center", delta > 0 ? "text-emerald-400" : "text-rose-400")}>
              {delta > 0 ? "↑" : "↓"} {Math.abs(delta)} this month
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
