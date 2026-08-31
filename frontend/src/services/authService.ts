import { fetchApi, setAuthToken, getAuthToken } from "./api";
import { UserProfile } from "@/types";
import { DEMO_USER } from "@/lib/demo-data";

// The single seeded demo identity. Demo treatment (offline fallback, demo dataset)
// is gated on this EXACT address so an arbitrary real email containing "demo"
// can never be treated as the demo account.
const DEMO_ACCOUNT_EMAIL = "alex.mercer@fintech.demo";
const OFFLINE_DEMO_TOKEN = "demo_token_alex_mercer";

interface ApiUser {
  id: number;
  email: string;
  full_name: string;
  designation?: string | null;
  is_active: boolean;
  is_demo: boolean;
  created_at: string;
}

export interface TokenResponsePayload {
  access_token: string;
  token_type: string;
  user: ApiUser;
}

function toUserProfile(u: ApiUser): UserProfile {
  return {
    id: u.id,
    email: u.email,
    fullName: u.full_name,
    designation: u.designation ?? undefined,
    role: u.is_demo ? "Demo Financial Analyst" : "Financial Member",
    isDemo: u.is_demo,
  };
}

export const authService = {
  async login(email: string, password?: string): Promise<UserProfile> {
    const isSeededDemo = email.trim().toLowerCase() === DEMO_ACCOUNT_EMAIL;
    if (isSeededDemo && !password) {
      setAuthToken(OFFLINE_DEMO_TOKEN);
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

      return toUserProfile(result.user);
    } catch (error) {
      // Offline resilience for the portfolio demo ONLY — never for a real account.
      if (isSeededDemo) {
        setAuthToken(OFFLINE_DEMO_TOKEN);
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

    return toUserProfile(result.user);
  },

  async getMe(): Promise<UserProfile | null> {
    try {
      const user = await fetchApi<ApiUser>("/users/me");
      return toUserProfile(user);
    } catch {
      return null;
    }
  },

  /**
   * Persists mutable profile fields. Email is the auth identity and is not
   * sent — the backend rejects any attempt to change it here.
   */
  async updateProfile(fields: { fullName?: string; designation?: string }): Promise<UserProfile> {
    const body: Record<string, string> = {};
    if (fields.fullName !== undefined) body.full_name = fields.fullName;
    if (fields.designation !== undefined) body.designation = fields.designation;
    const user = await fetchApi<ApiUser>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return toUserProfile(user);
  },

  async logout(): Promise<void> {
    const token = getAuthToken();
    try {
      // The offline demo token is not a real JWT — there is no server session to
      // end, so skip the round-trip entirely. For real sessions the backend
      // /logout is idempotent and never 401s, keeping the browser console clean.
      if (token && token !== OFFLINE_DEMO_TOKEN) {
        await fetchApi("/users/logout", { method: "POST" });
      }
    } catch {
      // Never let a logout network hiccup block clearing local state.
    } finally {
      setAuthToken(null);
    }
  }
};
