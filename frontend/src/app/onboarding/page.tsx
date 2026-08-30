"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCreditLens } from "@/context/CreditLensContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  UploadCloud,
  FileText,
  Sparkles,
  Building2,
  CreditCard,
  Wallet
} from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const { loginAsDemo } = useAuth();
  const { updateFinancialProfile } = useCreditLens();

  const [currentStep, setCurrentStep] = useState(1);
  const [employmentType, setEmploymentType] = useState("Salaried (Full-Time)");
  const [monthlyIncome, setMonthlyIncome] = useState("65000");
  const [creditLimit, setCreditLimit] = useState("250000");
  const [revolvingBalance, setRevolvingBalance] = useState("170000");
  const [monthlyEMI, setMonthlyEMI] = useState("8500");
  const [uploadedFileName] = useState<string | null>("bank_statement_q1_2026.pdf");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsProcessing(true);
      // Save to context
      updateFinancialProfile({
        employmentType,
        monthlyIncome: parseFloat(monthlyIncome) || 65000,
        creditLimitTotal: parseFloat(creditLimit) || 250000,
        revolvingBalanceTotal: parseFloat(revolvingBalance) || 170000,
        totalMonthlyEMI: parseFloat(monthlyEMI) || 8500,
      });

      setTimeout(() => {
        setIsProcessing(false);
        router.push("/dashboard");
      }, 1000);
    }
  };

  const handleDemoPreset = () => {
    loginAsDemo();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#050706] text-[#F9FAFB] flex flex-col justify-between p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between py-2 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-lime-400 p-[1px]">
            <div className="w-full h-full bg-[#050706] rounded-[10px] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-base text-white tracking-tight">CreditLens</span>
            <p className="text-xs text-neutral-400">Financial Profile Setup Wizard</p>
          </div>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={handleDemoPreset}
          className="text-xs border-white/10 bg-[#0E1510] text-neutral-300 hover:text-white"
          leftIcon={<Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
        >
          Skip & Explore Demo
        </Button>
      </div>

      {/* Center Wizard Container */}
      <div className="max-w-2xl mx-auto w-full my-8">
        {/* Step Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-400 mb-2">
            <span>Step {currentStep} of 4</span>
            <span className="text-emerald-400 font-bold">
              {currentStep === 1 && "Welcome & Employment"}
              {currentStep === 2 && "Financial Profile"}
              {currentStep === 3 && "Connect Data"}
              {currentStep === 4 && "Ready to Analyze"}
            </span>
          </div>
          <ProgressBar value={(currentStep / 4) * 100} variant="emerald" size="sm" />
        </div>

        <Card className="p-6 md:p-8 bg-[#0B110D] border-white/10 shadow-2xl">
          {/* STEP 1: Welcome & Employment */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Welcome to CreditLens
                </h2>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Let&apos;s start by configuring your employment and primary cashflow source.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-neutral-300">
                  Select Employment Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Salaried (Full-Time)",
                    "Self-Employed / Business",
                    "Freelance / Independent Contractor",
                    "Other / Liquid Asset Portfolio",
                  ].map((type) => (
                    <div
                      key={type}
                      onClick={() => setEmploymentType(type)}
                      className={`p-4 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                        employmentType === type
                          ? "bg-emerald-950/40 border-emerald-500 text-white shadow-sm"
                          : "bg-[#0E1510] border-white/[0.06] text-neutral-300 hover:border-emerald-500/30"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold">{type}</span>
                      </div>
                      {employmentType === type && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Financial Numbers */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Your Financial Profile Metrics
                </h2>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Enter your take-home cashflow and credit line structure in INR (₹).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Monthly Net Income (₹)"
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  leftIcon={<Wallet className="w-4 h-4" />}
                  helperText="Take-home after taxes and deductions"
                />

                <Input
                  label="Aggregate Credit Limit (₹)"
                  type="number"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  leftIcon={<CreditCard className="w-4 h-4" />}
                  helperText="Sum of limits across all active cards"
                />

                <Input
                  label="Current Revolving Balance (₹)"
                  type="number"
                  value={revolvingBalance}
                  onChange={(e) => setRevolvingBalance(e.target.value)}
                  leftIcon={<CreditCard className="w-4 h-4" />}
                  helperText="Current outstanding balance on cards"
                />

                <Input
                  label="Monthly Loan EMI Obligations (₹)"
                  type="number"
                  value={monthlyEMI}
                  onChange={(e) => setMonthlyEMI(e.target.value)}
                  leftIcon={<Building2 className="w-4 h-4" />}
                  helperText="Personal loans, auto loans, or home loans"
                />
              </div>

              {/* Calculated Ratio Preview */}
              <div className="p-3.5 bg-[#0E1510] rounded-xl border border-white/[0.08] text-xs flex items-center justify-between">
                <span className="text-neutral-400">Calculated Utilization Ratio:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {((parseFloat(revolvingBalance) / parseFloat(creditLimit)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: Connect Financial Data */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Connect Financial Statements
                </h2>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Upload bank statement PDFs or credit transaction CSVs for NLP classification and anomaly detection.
                </p>
              </div>

              <div className="border-2 border-dashed border-white/15 hover:border-emerald-500 rounded-2xl p-8 text-center bg-[#0E1510] transition-colors cursor-pointer group">
                <UploadCloud className="w-10 h-10 text-emerald-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="text-sm font-bold text-white mb-1">
                  Drag and drop bank statement (PDF / CSV)
                </h4>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4 leading-relaxed">
                  Encrypted server-side. No plain passwords or credentials stored.
                </p>
                <div className="inline-block px-4 py-1.5 bg-[#141F17] rounded-lg text-xs text-emerald-300 border border-emerald-500/30 font-semibold">
                  Select File from Computer
                </div>
              </div>

              {uploadedFileName && (
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-white">{uploadedFileName}</span>
                  </div>
                  <Badge variant="emerald" size="sm">
                    Verified Sample
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Ready to Analyze */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Profile Configured & Ready
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  CreditLens is ready to compute your deterministic credit health score and ML risk rating.
                </p>
              </div>

              {/* Profile Summary Card */}
              <div className="p-4 bg-[#0E1510] rounded-xl border border-white/[0.08] space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                  <span className="text-neutral-400">Monthly Net Income:</span>
                  <span className="font-mono font-bold text-white text-xs">{formatINR(parseFloat(monthlyIncome))}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                  <span className="text-neutral-400">Credit Limit / Balance:</span>
                  <span className="font-mono font-bold text-white text-xs">
                    {formatINR(parseFloat(revolvingBalance))} / {formatINR(parseFloat(creditLimit))}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-400">Monthly Loan EMI:</span>
                  <span className="font-mono font-bold text-white text-xs">{formatINR(parseFloat(monthlyEMI))}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-white/[0.08] mt-6">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(currentStep - 1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            <Button
              variant="emerald"
              size="md"
              isLoading={isProcessing}
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {currentStep === 4 ? "Launch Dashboard Analysis" : "Continue"}
            </Button>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-neutral-600 pb-2">
        CreditLens Responsible AI Framework • Data remains private & server-side
      </div>
    </div>
  );
}
