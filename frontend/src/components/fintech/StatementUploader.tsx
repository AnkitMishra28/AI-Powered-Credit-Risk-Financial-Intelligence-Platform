"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Shield,
  FileSpreadsheet,
} from "lucide-react";
import { uploadStatement } from "@/services/statementService";
import { StatementSummary } from "@/types";

interface StatementUploaderProps {
  onUploadSuccess?: (summary: StatementSummary, count: number) => void;
}

const STAGES = [
  "Uploading statement...",
  "Validating file integrity & schema...",
  "Extracting transaction ledger...",
  "Normalizing merchant entities...",
  "Classifying category taxonomy...",
  "Computing statistical anomalies...",
  "Statement Ingestion Complete!",
];

export function StatementUploader({ onUploadSuccess }: StatementUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    summary: StatementSummary;
    count: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    setSuccessData(null);
    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "pdf") {
      setError("Unsupported format. Please upload a .CSV or .PDF statement.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10 MB limit.");
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setCurrentStage(0);

    // Stage progression animation
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < STAGES.length - 2) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    try {
      const result = await uploadStatement(file);
      clearInterval(stageInterval);
      setCurrentStage(STAGES.length - 1);
      setSuccessData({ summary: result.statement, count: result.transactionCount });
      setFile(null);
      if (onUploadSuccess) {
        onUploadSuccess(result.statement, result.transactionCount);
      }
    } catch (err: unknown) {
      clearInterval(stageInterval);
      const errMsg = err instanceof Error ? err.message : "Failed to process statement";
      setError(errMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[#090D0A] border border-white/[0.08] shadow-xl relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/[0.07]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Statement Ingestion Engine</h3>
            <p className="text-xs text-neutral-400">Drop bank or credit card statements to extract transactions</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-emerald-300 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-emerald-400" /> AES-256 Encrypted
        </span>
      </div>

      {/* Drag & Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-emerald-400 bg-emerald-950/20 scale-[1.01]"
            : file
            ? "border-emerald-500/40 bg-emerald-950/10"
            : "border-white/[0.12] hover:border-white/[0.25] bg-[#0C120E]/50 hover:bg-[#0E1611]"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv,.pdf"
          className="hidden"
        />

        {!file && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-300">
              <UploadCloud className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Drag and drop your financial statement here, or <span className="text-emerald-400 underline underline-offset-2">browse files</span>
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Supported formats: <span className="text-neutral-300 font-medium">CSV, PDF</span> (Max 10 MB)
              </p>
            </div>
          </div>
        )}

        {file && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#0E1510] border border-emerald-500/30 text-left">
            <div className="flex items-center gap-3">
              {file.name.endsWith(".csv") ? (
                <FileSpreadsheet className="w-8 h-8 text-emerald-400 shrink-0" />
              ) : (
                <FileText className="w-8 h-8 text-rose-400 shrink-0" />
              )}
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate max-w-xs">{file.name}</p>
                <p className="text-xs text-neutral-400">{(file.size / 1024).toFixed(1)} KB • Ready to extract</p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="text-xs text-neutral-400 hover:text-rose-400 px-2 py-1 rounded bg-white/[0.05]"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Action Button & Stepper */}
      {file && !uploading && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleUpload}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 text-[#050706] font-bold text-sm hover:opacity-95 transition-opacity flex items-center gap-2 shadow-lg shadow-emerald-950/50"
          >
            <span>Process & Ingest Statement</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Ingestion Stepper Animation */}
      {uploading && (
        <div className="mt-5 p-4 rounded-xl bg-[#0E1510] border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-emerald-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              {STAGES[currentStage]}
            </span>
            <span className="text-neutral-400">Stage {currentStage + 1} of {STAGES.length}</span>
          </div>

          <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all duration-300 ease-out"
              style={{ width: `${((currentStage + 1) / STAGES.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Notification */}
      {successData && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Statement Ingested Successfully!
          </div>
          <p className="text-neutral-300">
            Parsed <span className="font-bold text-white">{successData.count} transactions</span> from{" "}
            <span className="font-semibold text-emerald-300">{successData.summary.filename}</span>. Normalization, category taxonomy, and spending anomaly baselines have been updated.
          </p>
          <div className="flex items-center gap-4 pt-1 text-[11px] text-neutral-400">
            <span>Total Outflows: <strong className="text-rose-400">₹{successData.summary.totalDebits.toLocaleString()}</strong></span>
            <span>Total Inflows: <strong className="text-emerald-400">₹{successData.summary.totalCredits.toLocaleString()}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
