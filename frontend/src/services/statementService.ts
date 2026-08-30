/**
 * CreditLens Financial Statement Ingestion Service
 * Handles statement uploads (CSV/PDF), statement listings, and transaction ledger queries.
 */
import { StatementSummary, Transaction } from "../types";
import {
  ApiStatementSummary,
  ApiStatementUploadResponse,
  ApiTransactionListResponse,
} from "../types/api";
import { mapStatementSummary, mapTransactionItem } from "./mappers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function uploadStatement(
  file: File,
  userId: number = 1
): Promise<{ statement: StatementSummary; transactionCount: number }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", String(userId));

  const response = await fetch(`${API_BASE}/statements/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.detail || `Upload failed with HTTP ${response.status}`
    );
  }

  const result = await response.json();
  const data: ApiStatementUploadResponse = result.data;

  return {
    statement: mapStatementSummary(data.statement),
    transactionCount: data.parsed_transactions_count,
  };
}

export async function getStatements(
  userId: number = 1
): Promise<StatementSummary[]> {
  const response = await fetch(`${API_BASE}/statements?user_id=${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch statements (${response.status})`);
  }

  const result = await response.json();
  const rawList: ApiStatementSummary[] = result.data || [];
  return rawList.map(mapStatementSummary);
}

export async function getTransactions(params?: {
  category?: string;
  txnType?: string;
  search?: string;
  limit?: number;
  offset?: number;
  userId?: number;
}): Promise<{ items: Transaction[]; totalCount: number }> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== "all") query.set("category", params.category);
  if (params?.txnType && params.txnType !== "all") query.set("txn_type", params.txnType);
  if (params?.search) query.set("search", params.search);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset) query.set("offset", String(params.offset));
  if (params?.userId) query.set("user_id", String(params.userId));

  const response = await fetch(`${API_BASE}/transactions?${query.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch transactions (${response.status})`);
  }

  const result = await response.json();
  const data: ApiTransactionListResponse = result.data;

  return {
    items: (data.items || []).map(mapTransactionItem),
    totalCount: data.total_count,
  };
}
