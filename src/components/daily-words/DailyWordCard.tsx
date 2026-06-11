"use client";

import { CalendarDays, Quote, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchTodayDailyWord } from "./api";
import type { DailyWord } from "./types";

function formatDate(value?: string | null) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) return value ?? "";

  return new Intl.DateTimeFormat("sw-TZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function DailyWordCard() {
  const [dailyWord, setDailyWord] = useState<DailyWord | null>(null);
  const [date, setDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDailyWord() {
      try {
        setLoading(true);
        setError("");
        const response = await fetchTodayDailyWord();

        setDate(response.date ?? response.dailyWord?.scheduled_date ?? "");
        setDailyWord(response.dailyWord);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Imeshindikana kupakia Neno la Siku."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadDailyWord();
  }, []);

  return (
    <section className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-5 text-gray-900 shadow-sm dark:border-white/10 dark:bg-[#0f172a] dark:text-white">
      <div className="relative">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100 dark:bg-white/10 dark:text-amber-200 dark:ring-white/15">
            <Sparkles size={14} />
            Neno la Siku
          </div>

          <div className="text-left sm:text-right">
            <p className="flex items-center gap-2 text-sm font-medium capitalize text-gray-600 dark:text-slate-300 sm:justify-end">
              <CalendarDays size={15} />
              {formatDate(date)}
            </p>
            {dailyWord?.author_name ? (
              <p className="mt-2 text-sm font-medium text-gray-500 dark:text-slate-300">
                Imetumwa na {dailyWord.author_name}
              </p>
            ) : null}
          </div>
        </div>

        {loading ? (
          <div className="mt-5 space-y-3">
            <div className="h-5 w-28 rounded bg-gray-100 dark:bg-white/10" />
            <div className="h-6 w-5/6 rounded bg-gray-100 dark:bg-white/10" />
            <div className="h-14 rounded bg-gray-100 dark:bg-white/10" />
            <div className="h-4 w-40 rounded bg-gray-100 dark:bg-white/10" />
          </div>
        ) : error ? (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700 dark:border-red-300/20 dark:bg-red-400/10 dark:text-red-100">
            {error}
          </div>
        ) : dailyWord ? (
          <div className="mt-5 text-left">
            <Quote className="text-amber-500 dark:text-amber-200/80" size={24} />
            <p className="mt-3 line-clamp-2 text-base font-semibold leading-7 text-gray-900 dark:text-white">
              {dailyWord.verse_text}
            </p>
            <p className="mt-3 text-sm font-semibold text-amber-700 dark:text-amber-200">
              {dailyWord.scripture_reference}
            </p>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-slate-200">
              {dailyWord.explanation}
            </p>
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-5 text-center dark:border-white/15 dark:bg-white/[0.04]">
            <div>
              <Quote className="mx-auto text-amber-500 dark:text-amber-200/80" size={28} />
              <h3 className="mt-3 text-base font-semibold text-gray-900 dark:text-white">
                Hakuna Neno la Siku kwa leo.
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-slate-300">
                Litakapoandaliwa, litaonekana hapa kwa washirika wote.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
