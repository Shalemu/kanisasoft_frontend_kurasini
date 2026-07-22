"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { AUTH_USER_UPDATED_EVENT } from "@/lib/session";

type User = {
  id?: number;
  full_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  church?: string | null;
  church_name?: string | null;
  profile_picture_url?: string | null;
  profile_picture_path?: string | null;
};

function unwrapProfile(response: any): Partial<User> | null {
  return response?.profile ?? response?.data?.profile ?? response?.data ?? null;
}

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const readStoredUser = () => {
      const stored = localStorage.getItem("user");

      if (!stored || stored === "undefined") {
        localStorage.removeItem("user");
        setUser(null);
        return;
      }

      try {
        setUser(JSON.parse(stored));
      } catch (error) {
        console.error("Invalid user in localStorage:", error);
        localStorage.removeItem("user");
        setUser(null);
      }
    };

    const handleUserUpdated = (event: Event) => {
      setUser((event as CustomEvent<User>).detail);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "user") readStoredUser();
    };

    window.addEventListener(AUTH_USER_UPDATED_EVENT, handleUserUpdated);
    window.addEventListener("storage", handleStorage);

    const stored = localStorage.getItem("user");

    if (!stored || stored === "undefined") {
      localStorage.removeItem("user");
      return () => {
        window.removeEventListener(AUTH_USER_UPDATED_EVENT, handleUserUpdated);
        window.removeEventListener("storage", handleStorage);
      };
    }

    try {
      const storedUser = JSON.parse(stored);
      setUser(storedUser);
    } catch (error) {
      console.error("Invalid user in localStorage:", error);
      localStorage.removeItem("user");
      return () => {
        window.removeEventListener(AUTH_USER_UPDATED_EVENT, handleUserUpdated);
        window.removeEventListener("storage", handleStorage);
      };
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

    return () => {
      window.removeEventListener(AUTH_USER_UPDATED_EVENT, handleUserUpdated);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return user;
}
