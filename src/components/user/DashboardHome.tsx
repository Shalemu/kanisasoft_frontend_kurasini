"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  DollarSign,
  Grid2X2,
  MapPin,
  Megaphone,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useDashboard } from "@/hooks/useDashboard";
import { useAuthUser } from "@/hooks/useAuthUser";
import DailyWordCard from "@/components/daily-words/DailyWordCard";
import DailyWordStatsCard from "@/components/daily-words/DailyWordStatsCard";

type AudienceGroup = {
  id: number;
  name: string;
};

type EventRecord = {
  id: number;
  title: string;
  type?: "Tangazo" | "Tukio" | string | null;
  description?: string | null;
  date?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  start_time?: string | null;
  location?: string | null;
  audience_groups?: AudienceGroup[];
};

function getEventRecords(response: any): EventRecord[] {
  const payload = response?.data ?? response ?? {};
  const records = payload.events ?? payload.data ?? response?.events ?? [];

  return Array.isArray(records) ? records : [];
}

function getEventDate(event: EventRecord) {
  return event.start_date ?? event.date ?? "";
}

function getEventTimestamp(event: EventRecord) {
  const date = getEventDate(event);
  const parsed = date ? new Date(date) : null;

  return parsed && !Number.isNaN(parsed.getTime()) ? parsed.getTime() : 0;
}

function formatDate(value?: string | null) {
  if (!value) return "Tarehe haijawekwa";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tarehe haijawekwa";

  return new Intl.DateTimeFormat("sw-TZ", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateRange(event: EventRecord) {
  const start = getEventDate(event);
  const end = event.end_date;

  if (!end || end.slice(0, 10) === start.slice(0, 10)) {
    return formatDate(start);
  }

  return `${formatDate(start)} - ${formatDate(end)}`;
}

function formatTime(value?: string | null) {
  if (!value) return "Muda haujawekwa";

  return value.slice(0, 5);
}

function getEventStatus(event: EventRecord) {
  const start = getEventTimestamp(event);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (!start) return "Tarehe haijawekwa";

  const days = Math.ceil((start - now.getTime()) / (1000 * 60 * 60 * 24));

  if (days <= 0) return "Limeanza!";
  if (days === 1) return "Siku 1";

  return `Siku ${days}`;
}

function getBadgeStyle(type?: string | null) {
  return type === "Tukio"
    ? "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20"
    : "bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20";
}

function MetricCard({
  title,
  value,
  icon: Icon,
  loading,
  helper,
}: {
  title: string;
  value: string | number;
  icon: typeof Users;
  loading: boolean;
  helper?: string;
}) {
  return (
    <div className="min-h-36 rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-white/3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-white/80">
        <Icon size={18} strokeWidth={2.2} />
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium leading-5 text-gray-600 dark:text-gray-400">
          {title}
        </p>
        <p className="mt-2 text-2xl font-bold leading-8 text-gray-900 dark:text-white">
          {loading ? "..." : value}
        </p>
        {helper ? (
          <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
            {loading ? "Inapakia..." : helper}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const user = useAuthUser();
  const {
    totalMembers,
    groupsCount,
    visitorCount,
    leaderCount,
    monthlyContributions,
    totalContributions,
    loading,
  } = useDashboard();

  const [events, setEvents] = useState<EventRecord[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");

  useEffect(() => {
    async function fetchEvents() {
      try {
        setEventsLoading(true);
        setEventsError("");
        const response = await apiFetch("/events?scope=all");
        setEvents(getEventRecords(response));
      } catch (error) {
        setEventsError(
          error instanceof Error
            ? error.message
            : "Imeshindikana kupakia matangazo na matukio."
        );
      } finally {
        setEventsLoading(false);
      }
    }

    void fetchEvents();
  }, []);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events
      .filter((event) => getEventTimestamp(event) >= today.getTime())
      .sort((a, b) => getEventTimestamp(a) - getEventTimestamp(b));
  }, [events]);

  const featuredEvent = upcomingEvents[0] ?? events[0];
  const sideEvents = upcomingEvents
    .filter((event) => event.id !== featuredEvent?.id)
    .slice(0, 5);
  const canManageDailyWords = ["admin", "mchungaji"].includes(
    String(user?.role ?? "").toLowerCase()
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Idadi ya Washirika"
          value={totalMembers}
          icon={Users}
          loading={loading}
        />
        <MetricCard
          title="Idadi ya Makundi"
          value={groupsCount}
          icon={Grid2X2}
          loading={loading}
        />
        <MetricCard
          title="Idadi ya Wageni"
          value={visitorCount}
          icon={UserCheck}
          loading={loading}
        />
        <MetricCard
          title="Idadi ya Viongozi"
          value={leaderCount}
          icon={ShieldCheck}
          loading={loading}
        />
        <MetricCard
          title="Michango Mwezi Huu"
          value={`TZS ${monthlyContributions.toLocaleString()}`}
          icon={DollarSign}
          loading={loading}
          helper={`Jumla: TZS ${totalContributions.toLocaleString()}`}
        />
      </div>

      <div
        className={`grid grid-cols-1 gap-4 ${
          canManageDailyWords ? "xl:grid-cols-2" : ""
        }`}
      >
        <DailyWordCard canManage={canManageDailyWords} />
        {canManageDailyWords ? <DailyWordStatsCard /> : null}
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Matangazo na Matukio
            </h2>
            <div className="mt-3 flex items-center gap-4 text-xs font-medium text-gray-600 dark:text-gray-400">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Tukio
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Tangazo
              </span>
            </div>
          </div>

          <Link
            href="/matukio"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-800 dark:bg-white/3 dark:text-gray-200 dark:hover:bg-white/6"
          >
            Ona yote
            <ArrowRight size={16} />
          </Link>
        </div>

        {eventsError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {eventsError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-lg border border-emerald-500 bg-white p-5 shadow-sm dark:border-emerald-500/60 dark:bg-white/3">
            {eventsLoading ? (
              <div className="space-y-4">
                <div className="h-5 w-32 rounded bg-gray-100 dark:bg-gray-800" />
                <div className="h-7 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
                <div className="h-20 rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            ) : featuredEvent ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">
                    <Sparkles size={13} />
                    Linafuata
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getBadgeStyle(featuredEvent.type)}`}>
                    {featuredEvent.type === "Tukio" ? (
                      <CalendarDays size={13} />
                    ) : (
                      <Megaphone size={13} />
                    )}
                    {featuredEvent.type || "Tangazo"}
                  </span>
                </div>

                <h3 className="mt-4 text-xl font-bold leading-7 text-gray-900 dark:text-white">
                  {featuredEvent.title}
                </h3>

                <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  {featuredEvent.description || "Maelezo hayajawekwa kwa sasa."}
                </p>

                <div className="mt-5 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p className="flex items-center gap-2">
                    <CalendarDays size={16} className="text-gray-500" />
                    {formatDateRange(featuredEvent)}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-500" />
                    {formatTime(featuredEvent.start_time)}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-500" />
                    {featuredEvent.location || "Eneo halijawekwa"}
                  </p>
                </div>

                {featuredEvent.audience_groups?.length ? (
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Wahusika:
                    </span>
                    {featuredEvent.audience_groups.map((group) => (
                      <span
                        key={group.id}
                        className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      >
                        {group.name}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Inabaki: {getEventStatus(featuredEvent)}
                </div>
              </>
            ) : (
              <div className="flex min-h-64 items-center justify-center text-center">
                <div>
                  <CalendarDays className="mx-auto text-gray-400" size={34} />
                  <p className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Hakuna tangazo au tukio lililopo.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Matangazo na matukio yanayokuja
            </h3>

            <div className="mt-5 space-y-4">
              {eventsLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-gray-100 dark:bg-gray-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 rounded bg-gray-100 dark:bg-gray-800" />
                      <div className="h-3 w-1/2 rounded bg-gray-100 dark:bg-gray-800" />
                    </div>
                  </div>
                ))
              ) : sideEvents.length ? (
                sideEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                        event.type === "Tukio" ? "bg-emerald-500" : "bg-blue-500"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="line-clamp-1 text-sm font-semibold text-gray-900 dark:text-white">
                          {event.title}
                        </p>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${getBadgeStyle(event.type)}`}>
                          {event.type || "Tangazo"}
                        </span>
                      </div>
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatDate(getEventDate(event))}</span>
                        {event.location ? <span>{event.location}</span> : null}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-lg bg-gray-50 px-4 py-6 text-center text-sm text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
                  Hakuna matukio mengine yanayokuja kwa sasa.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
