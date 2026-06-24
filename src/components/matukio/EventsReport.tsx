"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaCalendarCheck, FaCalendarTimes, FaFileExcel, FaFilePdf, FaLayerGroup } from "react-icons/fa";
import { apiFetch } from "@/lib/api";
import { useAuthUser } from "@/hooks/useAuthUser";
import EventsStatisticsChart from "@/components/user/MonthEvent";
import {
  EventRecord,
  getEventRecords,
  getLocalDateKey,
  isPastEvent,
  normalizeEventDate,
} from "@/components/matukio/event-utils";

function audienceNames(event: EventRecord) {
  return event.audience_groups?.map((group) => group.name).join(", ") || "-";
}

export default function EventsReport() {
  const user = useAuthUser();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [today, setToday] = useState(getLocalDateKey);
  const isAdmin = ["admin", "super_admin"].includes(
    String(user?.role ?? "").toLowerCase()
  );

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError("");
        setEvents(getEventRecords(await apiFetch("/events?scope=all")));
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Imeshindikana kupakia ripoti."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadEvents();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setToday(getLocalDateKey()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const past = events.filter((event) => isPastEvent(event, today)).length;
    return { current: events.length - past, past, total: events.length };
  }, [events, today]);

  const exportRows = useMemo(
    () =>
      events.map((event) => ({
        Kichwa: event.title,
        Aina: event.type,
        Hali: isPastEvent(event, today) ? "Limepita" : "Linapatikana",
        "Tarehe ya kuanza": normalizeEventDate(event.start_date),
        "Tarehe ya mwisho": normalizeEventDate(event.end_date) || "-",
        Saa: event.start_time?.slice(0, 5) || "-",
        Mahali: event.location || "-",
        Wahusika: audienceNames(event),
      })),
    [events, today]
  );

  const exportExcel = () => {
    const workbook = XLSX.utils.book_new();
    const summary = XLSX.utils.json_to_sheet([
      { Kipimo: "Yanayopatikana", Idadi: stats.current },
      { Kipimo: "Yaliyopita", Idadi: stats.past },
      { Kipimo: "Jumla", Idadi: stats.total },
    ]);
    const details = XLSX.utils.json_to_sheet(exportRows);

    XLSX.utils.book_append_sheet(workbook, summary, "Muhtasari");
    XLSX.utils.book_append_sheet(workbook, details, "Matangazo na Matukio");
    XLSX.writeFile(workbook, `ripoti-matangazo-matukio-${today}.xlsx`);
  };

  const exportPDF = () => {
    const document = new jsPDF({ orientation: "landscape" });
    document.setFontSize(16);
    document.text("Ripoti ya Matangazo na Matukio", 14, 16);
    document.setFontSize(10);
    document.text(
      `Yanayopatikana: ${stats.current}   Yaliyopita: ${stats.past}   Jumla: ${stats.total}`,
      14,
      23
    );

    autoTable(document, {
      startY: 29,
      head: [["Kichwa", "Aina", "Hali", "Kuanza", "Mwisho", "Saa", "Mahali", "Wahusika"]],
      body: exportRows.map((row) => [
        row.Kichwa,
        row.Aina,
        row.Hali,
        row["Tarehe ya kuanza"],
        row["Tarehe ya mwisho"],
        row.Saa,
        row.Mahali,
        row.Wahusika,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] },
    });

    document.save(`ripoti-matangazo-matukio-${today}.pdf`);
  };

  if (loading) {
    return <p className="py-12 text-center text-gray-500 dark:text-gray-400">Inapakia ripoti...</p>;
  }

  if (error) {
    return <p className="rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid flex-1 gap-4 sm:grid-cols-3">
          <StatCard label="Yanayopatikana" value={stats.current} icon={<FaCalendarCheck />} color="emerald" />
          <StatCard label="Yaliyopita" value={stats.past} icon={<FaCalendarTimes />} color="amber" />
          <StatCard label="Jumla" value={stats.total} icon={<FaLayerGroup />} color="indigo" />
        </div>

        {isAdmin && (
          <div className="flex shrink-0 gap-3">
            <button
              type="button"
              onClick={exportExcel}
              disabled={events.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaFileExcel /> Excel
            </button>
            <button
              type="button"
              onClick={exportPDF}
              disabled={events.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaFilePdf /> PDF
            </button>
          </div>
        )}
      </div>

      <EventsStatisticsChart events={events} />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "emerald" | "amber" | "indigo";
}) {
  const colors = {
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${colors[color]}`}>
        {icon}
      </span>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-white/90">{value}</p>
      </div>
    </div>
  );
}
