import { fetchApi } from "./api";
import { UserProfile } from "@/types";
import { DEMO_USER } from "@/lib/demo-data";

export const authService = {
  async login(email: string, password?: string): Promise<UserProfile> {
    if (email.toLowerCase().includes("demo") || !password) {
      return DEMO_USER;
    }

    try {
      const result = await fetchApi<{ user: UserProfile; access_token: string }>(
        "/users/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        }
      );
      return result.user || DEMO_USER;
    } catch {
      return {
        id: 2,
        email,
        fullName: email.split("@")[0],
        role: "Financial Member",
        isDemo: false
      };
    }
  },

  async register(email: string, fullName: string, password?: string): Promise<UserProfile> {
    try {
      const result = await fetchApi<{ user: UserProfile; access_token: string }>(
        "/users/register",
        {
          method: "POST",
          body: JSON.stringify({ email, full_name: fullName, password: password || "password123" }),
        }
      );
      return result.user;
    } catch {
      return {
        id: 2,
        email,
        fullName,
        role: "Financial Member",
        isDemo: false
      };
    }
  }
};
