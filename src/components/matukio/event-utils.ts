export interface EventGroup {
  id: number;
  name: string;
}

export interface EventRecord {
  id: number;
  title: string;
  type: "Tangazo" | "Tukio" | string;
  description?: string | null;
  start_date: string;
  end_date?: string | null;
  start_time?: string | null;
  location?: string | null;
  audience_groups?: EventGroup[];
  audience_group_ids?: number[];
}

export function normalizeEventDate(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

export function getEventRecords(response: any): EventRecord[] {
  const payload = response?.data ?? response ?? {};
  const records = payload.events ?? payload.data ?? response?.events ?? [];

  return Array.isArray(records) ? records : [];
}

export function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isPastEvent(event: EventRecord, today = getLocalDateKey()) {
  const finalDate =
    normalizeEventDate(event.end_date) || normalizeEventDate(event.start_date);

  return Boolean(finalDate && finalDate < today);
}
