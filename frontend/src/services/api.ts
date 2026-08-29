const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  is_demo?: boolean;
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
  fallbackData?: T
): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error ${response.status}: ${response.statusText}`);
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
