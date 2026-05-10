"use client";

import { create } from "zustand";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  // ─── IMPORTANT: always start as true ────────────────────────────────────
  // Server and client must render identically on the first pass.
  // localStorage is unavailable on the server, so we cannot determine
  // isAuthenticated at store creation time without causing a hydration
  // mismatch. hydrate() resolves this synchronously via useLayoutEffect.
  isAuthenticated: false,
  isLoading: true,
  // ────────────────────────────────────────────────────────────────────────

  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("traveloop_token", token);
    }
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("traveloop_token");
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  // Reads localStorage synchronously — called from useLayoutEffect so it
  // resolves before the browser paints, meaning the user never sees a flash.
  hydrate: () => {
    if (typeof window === "undefined") {
      set({ isLoading: false });
      return;
    }
    try {
      const token = localStorage.getItem("traveloop_token");
      set({ token, isAuthenticated: !!token, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
