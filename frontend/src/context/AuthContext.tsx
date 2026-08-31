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
  updateProfile: (fields: { fullName?: string; designation?: string }) => Promise<void>;
  logout: () => void;
  toggleDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Only a persisted session establishes identity. There is NO implicit demo
  // default: a brand-new visitor is unauthenticated (isDemoMode=false) and only
  // enters demo mode by explicitly choosing "Load Demo" (loginAsDemo).
  // A session is valid only when BOTH a saved user object AND a token exist.
  const readSavedUser = (): UserProfile | null => {
    if (typeof window === "undefined") return null;
    try {
      if (!localStorage.getItem("creditlens_token")) return null;
      const savedUserStr = localStorage.getItem("creditlens_user");
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser && savedUser.id) return savedUser as UserProfile;
      }
    } catch {
      /* ignore corrupt storage */
    }
    return null;
  };

  const [user, setUser] = useState<UserProfile | null>(() => readSavedUser());

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = readSavedUser();
    return saved ? saved.isDemo === true : false;
  });

  const endSession = React.useCallback(() => {
    setUser(null);
    setIsDemoMode(false);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("creditlens_user");
        localStorage.removeItem("creditlens_token");
      } catch {
        /* storage unavailable */
      }
    }
  }, []);

  // Verify the stored session against the backend on mount.
  useEffect(() => {
    const token = getAuthToken();
    // No token -> readSavedUser() already returned null in the initializer, so
    // `user` is null and the route guard will redirect. Just tidy any orphan key.
    if (!token) {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("creditlens_user");
        } catch {
          /* ignore */
        }
      }
      return;
    }
    if (token === "demo_token_alex_mercer") return; // offline demo session
    let cancelled = false;
    authService
      .getMe()
      .then((profile) => {
        if (cancelled) return;
        if (profile) {
          setUser(profile);
          setIsDemoMode(profile.isDemo);
          localStorage.setItem("creditlens_user", JSON.stringify(profile));
        } else {
          // Token rejected (expired / invalid) — do NOT keep a phantom
          // authenticated UI whose every API call would 401.
          endSession();
        }
      })
      .catch(() => {
        /* network blip — keep the optimistic session; API calls surface errors */
      });
    return () => {
      cancelled = true;
    };
  }, [endSession]);

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

  const updateProfile = async (fields: { fullName?: string; designation?: string }) => {
    const updated = await authService.updateProfile(fields);
    setUser(updated);
    setIsDemoMode(updated.isDemo);
    if (typeof window !== "undefined") {
      localStorage.setItem("creditlens_user", JSON.stringify(updated));
    }
  };

  const logout = () => {
    // 1. Revoke server-side (idempotent — never blocks, never 401s).
    void authService.logout();
    // 2. Tear down ALL client auth + protected state.
    setUser(null);
    setIsDemoMode(false);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("creditlens_user");
        localStorage.removeItem("creditlens_token");
        sessionStorage.clear();
      } catch {
        /* storage unavailable — nothing to clear */
      }
      // 3. Hard navigation to the public login page. A full document load
      //    guarantees every in-memory React context (including CreditLens
      //    financial data) is destroyed, eliminates any navigate-before-clear
      //    race, and ensures the browser Back button cannot re-expose a
      //    protected screen from the bfcache with stale data.
      window.location.replace("/login");
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
        updateProfile,
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
