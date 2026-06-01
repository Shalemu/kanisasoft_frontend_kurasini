export const SESSION_LAST_ACTIVITY_KEY = "last_activity_at";

export function clearSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("keep_logged_in");
  localStorage.removeItem(SESSION_LAST_ACTIVITY_KEY);
}

export function markSessionActivity() {
  if (typeof window === "undefined") return;

  localStorage.setItem(SESSION_LAST_ACTIVITY_KEY, Date.now().toString());
}

