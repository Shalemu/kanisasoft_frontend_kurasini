"use client";

import Link from "next/link";
import { CalendarDays, Edit3, Quote, Sparkles } from "lucide-react";
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

export default function DailyWordCard({
  canManage = false,
}: {
  canManage?: boolean;
}) {
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
    <section className="relative overflow-hidden rounded-lg bg-[#0f172a] p-5 text-white shadow-sm ring-1 ring-white/10">
      <div className="relative flex h-full flex-col">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-200 ring-1 ring-white/15">
              <Sparkles size={14} />
              Neno la Siku
            </div>
            <p className="mt-3 flex items-center gap-2 text-sm font-medium capitalize text-slate-300">
              <CalendarDays size={15} />
              {formatDate(date)}
            </p>
          </div>

          {canManage ? (
            <Link
              href="/neno-la-siku"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-white px-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-100"
            >
              <Edit3 size={15} />
              Simamia
            </Link>
          ) : null}
        </div>

        {loading ? (
          <div className="mt-5 space-y-3">
            <div className="h-5 w-28 rounded bg-white/10" />
            <div className="h-6 w-5/6 rounded bg-white/10" />
            <div className="h-14 rounded bg-white/10" />
            <div className="h-4 w-40 rounded bg-white/10" />
          </div>
        ) : error ? (
          <div className="mt-5 rounded-lg border border-red-300/20 bg-red-400/10 p-4 text-sm leading-6 text-red-100">
            {error}
          </div>
        ) : dailyWord ? (
          <div className="mt-5">
            <Quote className="text-amber-200/80" size={24} />
            <p className="mt-3 line-clamp-2 text-base font-semibold leading-7 text-white">
              {dailyWord.verse_text}
            </p>
            <p className="mt-3 text-sm font-semibold text-amber-200">
              {dailyWord.scripture_reference}
            </p>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-200">
              {dailyWord.explanation}
            </p>
            <p className="mt-4 text-sm font-medium text-slate-300">
              Imetumwa na {dailyWord.author_name}
            </p>
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-white/15 bg-white/[0.04] p-5 text-center">
            <div>
              <Quote className="mx-auto text-amber-200/80" size={28} />
              <h3 className="mt-3 text-base font-semibold text-white">
                Hakuna Neno la Siku kwa leo.
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Litakapoandaliwa, litaonekana hapa kwa washirika wote.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
