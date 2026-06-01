"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearSession,
  markSessionActivity,
  SESSION_LAST_ACTIVITY_KEY,
} from "@/lib/session";

const INACTIVITY_LIMIT_MS = 5 * 60 * 1000;
const ACTIVITY_EVENTS = [
  "click",
  "keydown",
  "mousemove",
  "pointerdown",
  "scroll",
  "touchstart",
] as const;

export default function InactivityLogout() {
  const router = useRouter();
  const pathname = usePathname();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const logout = () => {
      clearSession();
      router.replace("/login");
    };

    const scheduleLogout = () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      const lastActivity = Number(
        localStorage.getItem(SESSION_LAST_ACTIVITY_KEY) ?? Date.now()
      );
      const remainingTime = Math.max(0, INACTIVITY_LIMIT_MS - (Date.now() - lastActivity));

      timeoutRef.current = window.setTimeout(logout, remainingTime);
    };

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!localStorage.getItem(SESSION_LAST_ACTIVITY_KEY)) {
      markSessionActivity();
    }

    const handleActivity = () => {
      markSessionActivity();
      scheduleLogout();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const lastActivity = Number(
          localStorage.getItem(SESSION_LAST_ACTIVITY_KEY) ?? Date.now()
        );

        if (Date.now() - lastActivity >= INACTIVITY_LIMIT_MS) {
          logout();
          return;
        }

        scheduleLogout();
      }
    };

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    scheduleLogout();

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname, router]);

  return null;
}
