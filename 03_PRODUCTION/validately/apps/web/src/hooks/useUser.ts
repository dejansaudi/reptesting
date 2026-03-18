"use client";
import { useSession } from "next-auth/react";

export function useUser() {
  const { data, status } = useSession();
  const user = data?.user
    ? {
        id: data.user.id ?? "",
        email: data.user.email ?? "",
        name: data.user.name ?? "",
        plan: ((data as Record<string, unknown>).plan as string ?? "free").toLowerCase(),
        hasApiKey: !!(data as Record<string, unknown>).hasApiKey,
        image: data.user.image ?? undefined,
      }
    : null;
  return { user, loading: status === "loading", isAuthenticated: !!user };
}
