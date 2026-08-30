/**
 * CreditLens Financial Statement Ingestion Service
 * Handles statement uploads (CSV/PDF), statement listings, statement detail,
 * transaction ledger queries, and transaction reprocessing with automatic JWT authorization.
 */
import { StatementSummary, Transaction } from "../types";
import {
  ApiStatementSummary,
  ApiStatementUploadResponse,
  ApiTransactionListResponse,
} from "../types/api";
import { mapStatementSummary, mapTransactionItem } from "./mappers";
import { fetchApi } from "./api";

export async function uploadStatement(
  file: File
): Promise<{ statement: StatementSummary; transactionCount: number }> {
  const formData = new FormData();
  formData.append("file", file);

  const data = await fetchApi<ApiStatementUploadResponse>(
    "/statements/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  return {
    statement: mapStatementSummary(data.statement),
    transactionCount: data.parsed_transactions_count,
  };
}

export async function getStatements(): Promise<StatementSummary[]> {
  const rawList = await fetchApi<ApiStatementSummary[]>(
    "/statements",
    { method: "GET" },
    []
  );
  return (rawList || []).map(mapStatementSummary);
}

export async function getStatementDetail(statementId: string): Promise<StatementSummary> {
  const raw = await fetchApi<ApiStatementSummary>(
    `/statements/${statementId}`,
    { method: "GET" }
  );
  return mapStatementSummary(raw);
}

export async function getTransactions(params?: {
  category?: string;
  txnType?: string;
  search?: string;
  limit?: number;
  offset?: number;
  demo?: boolean;
}): Promise<{ items: Transaction[]; totalCount: number }> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== "all") query.set("category", params.category);
  if (params?.txnType && params.txnType !== "all") query.set("txn_type", params.txnType);
  if (params?.search) query.set("search", params.search);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset) query.set("offset", String(params.offset));
  if (params?.demo !== undefined) query.set("demo", String(params.demo));

  const data = await fetchApi<ApiTransactionListResponse>(
    `/transactions?${query.toString()}`,
    { method: "GET" },
    { items: [], total_count: 0, offset: 0, limit: 50, has_more: false }
  );

  return {
    items: (data.items || []).map(mapTransactionItem),
    totalCount: data.total_count,
  };
}

export async function reprocessTransactions(): Promise<{ reprocessedCount: number }> {
  const res = await fetchApi<{ reprocessed_count: number }>(
    "/transactions/reprocess",
    { method: "POST" }
  );
  return { reprocessedCount: res.reprocessed_count ?? 0 };
}
