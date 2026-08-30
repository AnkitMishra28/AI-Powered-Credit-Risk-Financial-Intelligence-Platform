import { fetchApi, setAuthToken } from "./api";
import { UserProfile } from "@/types";
import { DEMO_USER } from "@/lib/demo-data";

export interface TokenResponsePayload {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    full_name: string;
    is_active: boolean;
    is_demo: boolean;
    created_at: string;
  };
}

export const authService = {
  async login(email: string, password?: string): Promise<UserProfile> {
    const isDemo = email.toLowerCase().includes("demo") && !password;
    if (isDemo) {
      setAuthToken("demo_token_alex_mercer");
      return DEMO_USER;
    }

    try {
      const result = await fetchApi<TokenResponsePayload>(
        "/users/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password: password || "password123" }),
        }
      );

      if (result.access_token) {
        setAuthToken(result.access_token);
      }

      return {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.full_name,
        role: result.user.is_demo ? "Demo Financial Analyst" : "Financial Member",
        isDemo: result.user.is_demo
      };
    } catch (error) {
      if (email.toLowerCase().includes("demo")) {
        setAuthToken("demo_token_alex_mercer");
        return DEMO_USER;
      }
      throw error;
    }
  },

  async register(email: string, fullName: string, password?: string): Promise<UserProfile> {
    const result = await fetchApi<TokenResponsePayload>(
      "/users/register",
      {
        method: "POST",
        body: JSON.stringify({ email, full_name: fullName, password: password || "password123" }),
      }
    );

    if (result.access_token) {
      setAuthToken(result.access_token);
    }

    return {
      id: result.user.id,
      email: result.user.email,
      fullName: result.user.full_name,
      role: "Financial Member",
      isDemo: result.user.is_demo
    };
  },

  async getMe(): Promise<UserProfile | null> {
    try {
      const user = await fetchApi<{
        id: number;
        email: string;
        full_name: string;
        is_active: boolean;
        is_demo: boolean;
        created_at: string;
      }>("/users/me");

      return {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.is_demo ? "Demo Financial Analyst" : "Financial Member",
        isDemo: user.is_demo
      };
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await fetchApi("/users/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout
    } finally {
      setAuthToken(null);
    }
  }
};
