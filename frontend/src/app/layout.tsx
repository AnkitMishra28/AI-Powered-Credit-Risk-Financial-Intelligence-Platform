import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { CreditLensProvider } from "@/context/CreditLensContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreditLens — AI-Powered Credit Risk & Financial Intelligence Platform",
  description: "Transform complex banking statements, credit lines, and cashflow data into explainable credit health metrics and risk signals.",
  keywords: [
    "Credit Risk",
    "Financial Intelligence",
    "Credit Health",
    "Explainable AI",
    "SHAP",
    "RAG",
    "Fintech",
    "XGBoost",
    "Gemini"
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090D16] text-slate-100 antialiased min-h-screen">
        <AuthProvider>
          <CreditLensProvider>
            {children}
          </CreditLensProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
