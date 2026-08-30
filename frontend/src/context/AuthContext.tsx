"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile } from "@/types";
import { DEMO_USER } from "@/lib/demo-data";
import { authService } from "@/services/authService";
import { getAuthToken } from "@/services/api";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (email: string, fullName: string, password?: string) => Promise<void>;
  loginAsDemo: () => void;
  logout: () => void;
  toggleDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("creditlens_user");
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch {
          return DEMO_USER;
        }
      }
    }
    return DEMO_USER;
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("creditlens_user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          return parsed.isDemo ?? true;
        } catch {
          return true;
        }
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
        // Fallback to existing session or demo
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

  const loginAsDemo = () => {
    setUser(DEMO_USER);
    setIsDemoMode(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("creditlens_user", JSON.stringify(DEMO_USER));
      localStorage.setItem("creditlens_token", "demo_token_alex_mercer");
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
