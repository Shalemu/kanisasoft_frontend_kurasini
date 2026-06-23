export const SESSION_LAST_ACTIVITY_KEY = "last_activity_at";
export const AUTH_USER_UPDATED_EVENT = "auth-user-updated";

export function updateStoredUser(updates: Record<string, unknown>) {
  if (typeof window === "undefined") return updates;

  let current: Record<string, unknown> = {};

  try {
    const stored = localStorage.getItem("user");
    current = stored && stored !== "undefined" ? JSON.parse(stored) : {};
  } catch {
    current = {};
  }

  const user = { ...current, ...updates };
  localStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new CustomEvent(AUTH_USER_UPDATED_EVENT, { detail: user }));

  return user;
}

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
