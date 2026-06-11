import { apiFetch } from "@/lib/api";
import type { DailyWord, DailyWordPayload, DailyWordStats } from "./types";

type ListParams = {
  from?: string;
  to?: string;
  order?: "asc" | "desc";
  search?: string;
};

function getDailyWordList(response: any): DailyWord[] {
  const payload = response?.data ?? response ?? {};
  const records =
    payload.daily_words ??
    payload.dailyWords ??
    payload.entries ??
    payload.data ??
    response?.daily_words ??
    [];

  return Array.isArray(records) ? records : [];
}

export async function fetchTodayDailyWord() {
  const response = await apiFetch("/daily-words/today");

  return {
    date: response?.date as string | undefined,
    dailyWord: (response?.daily_word ?? null) as DailyWord | null,
  };
}

export async function fetchDailyWordStats() {
  const response = await apiFetch("/daily-words/stats");

  return (response?.stats ?? {
    total: 0,
    today_available: false,
    this_month: 0,
    upcoming: 0,
    past: 0,
    next_scheduled_date: null,
  }) as DailyWordStats;
}

export async function fetchDailyWords(params: ListParams = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });

  const query = searchParams.toString();
  const response = await apiFetch(`/daily-words${query ? `?${query}` : ""}`);

  return getDailyWordList(response);
}

export function createDailyWord(payload: DailyWordPayload) {
  return apiFetch("/daily-words", {
    method: "POST",
    body: payload,
  });
}

export function updateDailyWord(id: number, payload: DailyWordPayload) {
  return apiFetch(`/daily-words/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteDailyWord(id: number) {
  return apiFetch(`/daily-words/${id}`, {
    method: "DELETE",
  });
}

export function bulkCreateDailyWords(entries: DailyWordPayload[]) {
  return apiFetch("/daily-words/bulk", {
    method: "POST",
    body: { entries },
  });
}
