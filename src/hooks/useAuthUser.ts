"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type User = {
  id?: number;
  full_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  profile_picture_url?: string | null;
  profile_picture_path?: string | null;
};

function unwrapProfile(response: any): Partial<User> | null {
  return response?.profile ?? response?.data?.profile ?? response?.data ?? null;
}

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (!stored || stored === "undefined") {
      localStorage.removeItem("user");
      return;
    }

    try {
      const storedUser = JSON.parse(stored);
      setUser(storedUser);
    } catch (error) {
      console.error("Invalid user in localStorage:", error);
      localStorage.removeItem("user");
      return;
    }

    async function refreshProfile() {
      try {
        const profile = unwrapProfile(await apiFetch("/admin/profile"));

        if (!profile) return;

        setUser((current) => {
          const nextUser = {
            ...(current ?? {}),
            ...profile,
          };

          localStorage.setItem("user", JSON.stringify(nextUser));
          return nextUser;
        });
      } catch {
        // Keep the locally stored user if profile refresh is unavailable.
      }
    }

    refreshProfile();
  }, []);

  return user;
}
