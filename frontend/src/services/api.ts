const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  is_demo?: boolean;
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
