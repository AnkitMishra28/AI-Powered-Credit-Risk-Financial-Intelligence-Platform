"use client";

import React, { createContext, useContext, useState } from "react";
import { UserProfile } from "@/types";
import { DEMO_USER } from "@/lib/demo-data";
import { authService } from "@/services/authService";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  login: (email: string, password?: string) => Promise<void>;
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

  const login = async (email: string, password?: string) => {
    const loggedUser = await authService.login(email, password);
    setUser(loggedUser);
    setIsDemoMode(loggedUser.isDemo);
    if (typeof window !== "undefined") {
      localStorage.setItem("creditlens_user", JSON.stringify(loggedUser));
    }
  };

  const loginAsDemo = () => {
    setUser(DEMO_USER);
    setIsDemoMode(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("creditlens_user", JSON.stringify(DEMO_USER));
    }
  };

  const logout = () => {
    setUser(null);
    setIsDemoMode(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("creditlens_user");
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
