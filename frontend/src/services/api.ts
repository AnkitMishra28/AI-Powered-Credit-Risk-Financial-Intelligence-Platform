/**
 * Resolves the backend API base URL.
 *
 * The FastAPI backend mounts every route under `settings.API_V1_STR` (`/api/v1`),
 * so the effective base URL must always end with that segment. A very common
 * deployment mistake (and the cause of production 404s on Render) is setting
 * `NEXT_PUBLIC_API_URL` to the bare backend host, e.g.
 * `https://xxx.onrender.com`, which makes calls resolve to
 * `https://xxx.onrender.com/users/register` instead of
 * `https://xxx.onrender.com/api/v1/users/register`.
 *
 * This normalizer keeps the intended architecture (direct Vercel -> Render calls)
 * but is tolerant of either form:
 *   - `https://xxx.onrender.com`         -> `https://xxx.onrender.com/api/v1`
 *   - `https://xxx.onrender.com/api/v1`  -> unchanged
 *   - `https://xxx.onrender.com/api/v1/` -> `https://xxx.onrender.com/api/v1`
 *   - `/api/v1` (same-origin / proxy)    -> unchanged
 *   - `http://localhost:8000/api/v1`     -> unchanged
 */
function resolveApiBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL || "/api/v1").trim();
  const withoutTrailingSlash = raw.replace(/\/+$/, "");
  if (!withoutTrailingSlash) {
    return "/api/v1";
  }
  // Already targets a versioned API base (e.g. /api/v1, /api/v2) — leave as-is.
  if (/\/api\/v\d+$/.test(withoutTrailingSlash)) {
    return withoutTrailingSlash;
  }
  // Any other explicit `/api/...` mount is respected as configured.
  if (/\/api(\/|$)/.test(withoutTrailingSlash)) {
    return withoutTrailingSlash;
  }
  return `${withoutTrailingSlash}/api/v1`;
}

const API_BASE_URL = resolveApiBaseUrl();

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  is_demo?: boolean;
}

/**
 * Explicit data-state the backend reports so the UI can tell apart:
 *   "ok"                - real, user-owned computed data is present
 *   "demo"              - intentional demo/canonical dataset (demo session only)
 *   "no_data"           - authenticated real user has uploaded nothing yet
 *   "insufficient_data" - real user has some data but not enough for this metric
 */
export type DataStatus = "ok" | "demo" | "no_data" | "insufficient_data";

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T | null;
  is_demo?: boolean;
  data_status?: DataStatus | null;
  has_financial_data?: boolean | null;
}

/**
 * Like `fetchApi` but returns the FULL response envelope (including `data_status`,
 * `is_demo`, `has_financial_data`) without unwrapping `data`. Used by the
 * dashboard data services so a "no data yet" state is never confused with real
 * zero-valued data and demo data is never substituted for a real user.
 * Throws on network failure / non-2xx (callers map that to an "error" state).
 */
export async function fetchEnvelope<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiEnvelope<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    ...(options?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...((options?.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    setAuthToken(null);
    throw new Error("Authentication required. Please log in.");
  }
  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    const errorMsg =
      errorJson?.detail || errorJson?.message || `API error ${response.status}: ${response.statusText}`;
    throw new Error(errorMsg);
  }

  const result = (await response.json()) as ApiEnvelope<T>;
  return {
    success: result.success ?? true,
    message: result.message ?? "",
    data: result.data ?? null,
    is_demo: result.is_demo ?? false,
    data_status: result.data_status ?? null,
    has_financial_data: result.has_financial_data ?? null,
  };
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("creditlens_token");
  }
  return null;
}

export function setAuthToken(token: string | null): void {
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("creditlens_token", token);
    } else {
      localStorage.removeItem("creditlens_token");
    }
  }
}

export type SectionStatus =
  | "loading"
  | "ok"
  | "demo"
  | "no_data"
  | "insufficient_data"
  | "error";

export interface DataResult<T> {
  status: Exclude<SectionStatus, "loading">;
  data: T | null;
  message: string;
  isDemo: boolean;
}

/**
 * Fetches a dashboard section and maps the backend envelope into an explicit
 * DataResult. Real "no data" / "insufficient data" states are preserved as-is
 * (data === null) and are NEVER replaced with demo/canonical values. A network
 * failure becomes status "error" (the caller decides whether an offline demo
 * fallback is appropriate — only for an actual demo session).
 */
export async function fetchSection<TRaw, TMapped>(
  endpoint: string,
  map: (raw: TRaw) => TMapped
): Promise<DataResult<TMapped>> {
  try {
    const env = await fetchEnvelope<TRaw>(endpoint);
    const status = env.data_status ?? (env.data ? "ok" : "no_data");
    if ((status === "ok" || status === "demo") && env.data != null) {
      return { status, data: map(env.data), message: env.message, isDemo: !!env.is_demo };
    }
    // no_data / insufficient_data (or missing data) -> keep it explicit, no substitution
    return {
      status: status === "ok" ? "no_data" : status,
      data: null,
      message: env.message,
      isDemo: !!env.is_demo,
    };
  } catch (err) {
    return {
      status: "error",
      data: null,
      message: err instanceof Error ? err.message : "Unable to reach the CreditLens API.",
      isDemo: false,
    };
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
  fallbackData?: T
): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const token = getAuthToken();

    const headers: Record<string, string> = {
      ...(options?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(options?.headers as Record<string, string> || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Clear token on authentication expiry
      setAuthToken(null);
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        // Option to redirect to login if session expired
      }
      throw new Error("Authentication required. Please log in.");
    }

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      const errorMsg = errorJson?.detail || errorJson?.message || `API error ${response.status}: ${response.statusText}`;
      throw new Error(errorMsg);
    }

    const result: ApiResponse<T> = await response.json();
    return result.data ?? (result as unknown as T);
  } catch (error) {
    if (fallbackData !== undefined) {
      return fallbackData;
    }
    throw error;
  }
}
