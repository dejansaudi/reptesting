"use client";
import { getSession, signIn } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function apiFetch(path: string, options?: RequestInit) {
  const session = await getSession();
  const token = session?.accessToken;
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  // Redirect to login on auth failure (expired/invalid session)
  // FIX P0: Guard against SSR context where window is not available
  if (res.status === 401 && typeof window !== "undefined") {
    signIn(undefined, { callbackUrl: window.location.pathname });
  }

  return res;
}
