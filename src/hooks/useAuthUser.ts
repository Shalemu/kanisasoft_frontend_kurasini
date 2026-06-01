"use client";

import { useEffect, useState } from "react";

type User = {
  id?: number;
  full_name?: string;
  role?: string;
};

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (!stored || stored === "undefined") {
      localStorage.removeItem("user");
      return;
    }

    try {
      setUser(JSON.parse(stored));
    } catch (error) {
      console.error("Invalid user in localStorage:", error);
      localStorage.removeItem("user");
    }
  }, []);

  return user;
}