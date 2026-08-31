"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile } from "@/types";
import { DEMO_USER } from "@/lib/demo-data";
import { authService } from "@/services/authService";
import { getAuthToken, setAuthToken } from "@/services/api";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (email: string, fullName: string, password?: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => void;
  toggleDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedUserStr = localStorage.getItem("creditlens_user");
        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser && savedUser.id) return savedUser;
        }
      } catch {
        // Fallback to DEMO_USER
      }
    }
    return DEMO_USER;
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedUserStr = localStorage.getItem("creditlens_user");
        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          return savedUser.isDemo ?? true;
        }
      } catch {
        return true;
      }
    }
    return true;
  });

  // Verify stored session on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token && token !== "demo_token_alex_mercer") {
      authService.getMe().then((profile) => {
        if (profile) {
          setUser(profile);
          setIsDemoMode(profile.isDemo);
          localStorage.setItem("creditlens_user", JSON.stringify(profile));
        }
      }).catch(() => {
        // Stale token, keep existing state
      });
    }
  }, []);

  const login = async (email: string, password?: string) => {
    const loggedUser = await authService.login(email, password);
    setUser(loggedUser);
    setIsDemoMode(loggedUser.isDemo);
    if (typeof window !== "undefined") {
      localStorage.setItem("creditlens_user", JSON.stringify(loggedUser));
    }
  };

  const register = async (email: string, fullName: string, password?: string) => {
    const newUser = await authService.register(email, fullName, password);
    setUser(newUser);
    setIsDemoMode(newUser.isDemo);
    if (typeof window !== "undefined") {
      localStorage.setItem("creditlens_user", JSON.stringify(newUser));
    }
  };

  const loginAsDemo = async () => {
    // Prefer a real backend session for the seeded demo analyst account so that
    // demo dashboards are served by the live API (spending / credit-health / risk
    // all honour `demo=true` for this user). authService.login already falls back
    // to an offline demo token + bundled dataset if the backend is unreachable.
    let demoUser = DEMO_USER;
    try {
      demoUser = await authService.login("alex.mercer@fintech.demo", "password123");
    } catch {
      setAuthToken("demo_token_alex_mercer");
      demoUser = DEMO_USER;
    }
    setUser(demoUser);
    setIsDemoMode(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("creditlens_user", JSON.stringify(demoUser));
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsDemoMode(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("creditlens_user");
      localStorage.removeItem("creditlens_token");
    }
  };

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isDemoMode,
        login,
        register,
        loginAsDemo,
        logout,
        toggleDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
