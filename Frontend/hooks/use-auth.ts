'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import type { AuthResponse } from '@/types';

export function useAuth() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading, setAuth, clearAuth, setLoading, hydrate } =
    useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const { data } = await api.post<AuthResponse>('/api/auth/login', {
          email,
          password,
        });
        setAuth(data.user, data.token);
        router.replace('/dashboard');
      } catch (error) {
        clearAuth();
        throw error;
      }
    },
    [setAuth, clearAuth, setLoading, router]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      try {
        const { data } = await api.post<AuthResponse>('/api/auth/signup', {
          name,
          email,
          password,
        });
        setAuth(data.user, data.token);
        router.replace('/dashboard');
      } catch (error) {
        clearAuth();
        throw error;
      }
    },
    [setAuth, clearAuth, setLoading, router]
  );

  const logout = useCallback(() => {
    clearAuth();
    router.replace('/login');
  }, [clearAuth, router]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
  };
}
