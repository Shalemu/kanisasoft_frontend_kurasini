export type DailyWord = {
  id: number;
  scheduled_date: string;
  scripture_reference: string;
  verse_text: string;
  explanation: string;
  author_name: string;
  created_by?: number;
  author?: {
    id: number;
    full_name: string;
    role: string;
  } | null;
};

export type DailyWordPayload = {
  scheduled_date: string;
  scripture_reference: string;
  verse_text: string;
  explanation: string;
  author_name: string;
};

export type DailyWordStats = {
  total: number;
  today_available: boolean;
  this_month: number;
  upcoming: number;
  past: number;
  next_scheduled_date: string | null;
};

