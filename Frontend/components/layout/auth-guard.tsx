"use client";

import { useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const hydrate = useAuthStore((s) => s.hydrate);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // useLayoutEffect fires before the browser paints (client-side only),
  // so isLoading → false happens before any render is visible.
  // This prevents hydration mismatches: server renders null (isLoading:true),
  // client also renders null initially, then useLayoutEffect updates state
  // pre-paint, invisible to the user.
  useLayoutEffect(() => {
    hydrate();
  }, [hydrate]);

  // Redirect unauthenticated users after auth state is known
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // While isLoading — render nothing (same on server + client → no mismatch)
  if (isLoading) {
    return null;
  }

  // Auth resolved: not logged in — redirect is in-flight, show nothing
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
