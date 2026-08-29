"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { TrendingUp, Sparkles, ArrowRight, ShieldCheck, Mail, Lock, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email || "alex.mercer@fintech.demo", password);
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = () => {
    loginAsDemo();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#090D16] flex flex-col justify-between p-4 sm:p-6 text-slate-100">
      {/* Top Brand Link */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-extrabold text-base text-white">CreditLens</span>
        </Link>

        <button
          onClick={handleDemoClick}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Instant Demo Access</span>
        </button>
      </div>

      {/* Center Auth Box */}
      <div className="w-full max-w-md mx-auto my-8">
        <Card className="p-6 md:p-8 bg-slate-900/95 border-slate-700/80 shadow-2xl">
          {/* Header */}
          <div className="text-center pb-5 mb-5 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isSignUp ? "Create Your CreditLens Account" : "Sign In to CreditLens"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isSignUp
                ? "Access personalized credit health diagnostics and risk models"
                : "Enter your credentials or test with 1-click Demo Mode"}
            </p>
          </div>

          {/* 1-Click Recruiter Demo Access Banner */}
          <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 mb-5 text-xs text-blue-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-100 block">Recruiter / Interviewer Demo</span>
              <span className="text-[11px] text-slate-400">Preloads complete synthetic portfolio dataset</span>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={handleDemoClick}
              className="text-xs py-1.5 px-3 font-semibold shrink-0"
              leftIcon={<Sparkles className="w-3 h-3" />}
            >
              Load Demo
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <Input
                label="Full Name"
                placeholder="Alex Mercer"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="alex.mercer@fintech.demo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            {!isSignUp && (
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-800" />
                  <span>Remember session</span>
                </label>
                <span className="text-blue-400 hover:underline cursor-pointer">Forgot password?</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full mt-2 font-bold"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isSignUp ? "Create Account & Start Onboarding" : "Sign In to Workspace"}
            </Button>
          </form>

          {/* Switch Login / Sign Up */}
          <div className="mt-5 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            {isSignUp ? (
              <span>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-blue-400 hover:underline font-semibold"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-blue-400 hover:underline font-semibold"
                >
                  Create Account
                </button>
              </span>
            )}
          </div>
        </Card>

        {/* Security Notice */}
        <div className="text-center mt-4 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Server-side encryption & zero credential exposure</span>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="text-center text-[11px] text-slate-600 pb-2">
        © 2026 CreditLens Technologies. Open-source educational portfolio platform.
      </div>
    </div>
  );
}
