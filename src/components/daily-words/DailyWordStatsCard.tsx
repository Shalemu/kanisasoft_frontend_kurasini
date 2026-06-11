"use client";

import { CalendarCheck, CalendarClock, CheckCircle2, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchDailyWordStats } from "./api";
import type { DailyWordStats } from "./types";

const fallbackStats: DailyWordStats = {
  total: 0,
  today_available: false,
  this_month: 0,
  upcoming: 0,
  past: 0,
  next_scheduled_date: null,
};

function formatDate(value?: string | null) {
  if (!value) return "Haijapangwa";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("sw-TZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function StatTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof FileText;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-white/3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-white/80">
          <Icon size={17} />
        </span>
      </div>
      <p className="mt-3 text-xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

export default function DailyWordStatsCard() {
  const [stats, setStats] = useState<DailyWordStats>(fallbackStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        setStats(await fetchDailyWordStats());
      } catch (error) {
        console.error("Failed to load daily word stats", error);
      } finally {
        setLoading(false);
      }
    }

    void loadStats();
  }, []);

  const value = (numberValue: number) => (loading ? "..." : numberValue);

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Muhtasari wa Neno la Siku
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Ratiba na takwimu za maandalizi.
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
            stats.today_available
              ? "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20"
              : "bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20"
          }`}
        >
          <CheckCircle2 size={14} />
          {loading
            ? "Inapakia"
            : stats.today_available
            ? "Leo lipo"
            : "Leo halipo"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatTile label="Jumla" value={value(stats.total)} icon={FileText} />
        <StatTile
          label="Mwezi huu"
          value={value(stats.this_month)}
          icon={CalendarCheck}
        />
        <StatTile
          label="Yaliyopangwa"
          value={value(stats.upcoming)}
          icon={CalendarClock}
        />
        <StatTile label="Yaliyopita" value={value(stats.past)} icon={CheckCircle2} />
      </div>

      <div className="mt-3 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:bg-gray-800/60 dark:text-gray-300">
        Neno linalofuata:{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {loading ? "..." : formatDate(stats.next_scheduled_date)}
        </span>
      </div>
    </section>
  );
}
