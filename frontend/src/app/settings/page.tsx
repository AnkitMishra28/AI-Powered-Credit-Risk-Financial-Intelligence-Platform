"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { EducationalDisclaimer } from "@/components/fintech/EducationalDisclaimer";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Shield,
  Lock,
  Database,
  Trash2,
  Sparkles
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "privacy" | "ai">("profile");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Settings & Data Governance"
        subtitle="Manage your profile, security credentials, AI explanation depth, and financial data privacy."
      />

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 pb-4 mb-6 border-b border-slate-800 overflow-x-auto">
        {[
          { id: "profile", label: "Profile & Identity", icon: User },
          { id: "security", label: "Security & Access", icon: Shield },
          { id: "privacy", label: "Data & Privacy", icon: Database },
          { id: "ai", label: "AI & Explanation Settings", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "profile" | "security" | "privacy" | "ai")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="max-w-4xl">
        {/* TAB 1: Profile */}
        {activeTab === "profile" && (
          <Card className="p-6 md:p-8 bg-slate-900/90 border-slate-800 space-y-6 animate-in fade-in">
            <div className="pb-4 border-b border-slate-800">
              <CardTitle className="text-base text-slate-100">Financial Member Profile</CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Your personal details used for session management and risk profile context.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4 max-w-xl">
              <Input
                label="Full Name"
                defaultValue={user?.fullName || "Alex Mercer"}
                leftIcon={<User className="w-4 h-4" />}
              />
              <Input
                label="Email Address"
                type="email"
                defaultValue={user?.email || "alex.mercer@fintech.demo"}
                leftIcon={<Lock className="w-4 h-4" />}
              />
              <Input
                label="Designation / Financial Profile"
                defaultValue="Senior Product Analyst"
                helperText="Used to categorize risk cohort benchmarking"
              />

              <div className="pt-3">
                <Button type="submit" variant="primary" size="md">
                  {isSaved ? "Profile Updated!" : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* TAB 2: Security */}
        {activeTab === "security" && (
          <Card className="p-6 md:p-8 bg-slate-900/90 border-slate-800 space-y-6 animate-in fade-in">
            <div className="pb-4 border-b border-slate-800">
              <CardTitle className="text-base text-slate-100">Security & Authentication</CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Configure credential protections and API access tokens.
              </p>
            </div>

            <div className="space-y-4 max-w-xl">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Two-Factor Authentication (2FA)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Secure biometric or authenticator app login</p>
                </div>
                <Badge variant="emerald" size="sm">Enabled</Badge>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">REST API Key Access</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">FastAPI backend developer token</p>
                </div>
                <Badge variant="slate" size="sm">Active (Phase 1)</Badge>
              </div>

              <div className="pt-2">
                <Button variant="outline" size="sm">
                  Change Password
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* TAB 3: Data & Privacy */}
        {activeTab === "privacy" && (
          <div className="space-y-6 animate-in fade-in">
            <Card className="p-6 md:p-8 bg-slate-900/90 border-slate-800 space-y-4">
              <div className="pb-4 border-b border-slate-800">
                <CardTitle className="text-base text-slate-100">Financial Data Governance</CardTitle>
                <p className="text-xs text-slate-400 mt-1">
                  Responsible data management principles applied across CreditLens.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-xs text-slate-300 leading-relaxed space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-400">
                  <Shield className="w-4 h-4" />
                  <span>Your financial data is treated as sensitive information.</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  CreditLens never shares, sells, or exposes your raw transactional ledgers to third-party ad networks. 
                  All vector embeddings for RAG and ML feature vectors are stored strictly in dedicated tenant-isolated PostgreSQL schemas.
                </p>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-800" />
                  <span>Allow anonymized telemetry for XGBoost risk model retraining</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-800" />
                  <span>Retain statement transaction history for 12 months</span>
                </label>
              </div>
            </Card>

            {/* Danger Zone: Delete My Data */}
            <Card className="p-6 bg-rose-500/5 border-rose-500/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    Danger Zone: Purge Financial Data
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md">
                    Permanently delete all uploaded statements, computed credit metrics, and vector search embeddings.
                  </p>
                </div>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                  className="shrink-0"
                >
                  Delete My Data
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 4: AI Explanation Preferences */}
        {activeTab === "ai" && (
          <Card className="p-6 md:p-8 bg-slate-900/90 border-slate-800 space-y-6 animate-in fade-in">
            <div className="pb-4 border-b border-slate-800">
              <CardTitle className="text-base text-slate-100">AI & Copilot Explanations</CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Customize how Gemini 1.5 and SHAP explainability insights are structured.
              </p>
            </div>

            <div className="space-y-4 max-w-xl text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Explanation Depth
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-blue-600/20 border border-blue-500 text-white font-medium cursor-pointer">
                    <span className="font-bold block">Executive / Plain English</span>
                    <span className="text-[10px] text-slate-300">Actionable advice & key highlights</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 hover:border-slate-700 cursor-pointer">
                    <span className="font-bold block">Quantitative / SHAP Attribution</span>
                    <span className="text-[10px] text-slate-400">Feature weights & exact mathematical deltas</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-800" />
                  <span>Always display official regulatory citations (RBI master directions)</span>
                </label>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete All Financial Data?"
        description="This action will purge your transactional records, score metrics, and copilot history."
      >
        <div className="space-y-4 text-xs text-slate-300">
          <p className="leading-relaxed">
            In production, this initiates a complete cascade deletion of your records across PostgreSQL and pgvector tables. 
            During Phase 1 Demo Mode, your synthetic session will simply reset to default state.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setShowDeleteModal(false);
                alert("Demo data reset successfully.");
              }}
            >
              Confirm Purge
            </Button>
          </div>
        </div>
      </Modal>

      {/* Educational Disclaimer */}
      <div className="mt-8">
        <EducationalDisclaimer />
      </div>
    </AppLayout>
  );
}
