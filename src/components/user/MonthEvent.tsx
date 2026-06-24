"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { EventRecord } from "@/components/matukio/event-utils";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

function countByMonth(events: EventRecord[], type: string) {
  const counts = Array(12).fill(0);

  events.forEach((event) => {
    if (event.type !== type || !event.start_date) return;

    const date = new Date(event.start_date);
    if (!Number.isNaN(date.getTime())) counts[date.getMonth()] += 1;
  });

  return counts;
}

export default function EventsStatisticsChart({ events }: { events: EventRecord[] }) {
  const series = useMemo(
    () => [
      { name: "Matangazo", data: countByMonth(events, "Tangazo") },
      { name: "Matukio", data: countByMonth(events, "Tukio") },
    ],
    [events]
  );

  const options: ApexOptions = {
    legend: { show: true, position: "top", horizontalAlign: "right" },
    colors: ["#6366F1", "#10B981"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: { show: false },
    },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.35, opacityTo: 0 },
    },
    markers: { size: 0 },
    grid: { yaxis: { lines: { show: true } } },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (value: number) => `${value}` } },
    xaxis: {
      type: "category",
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Ago", "Sep", "Okt", "Nov", "Des"],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      labels: {
        formatter: (value) => Math.round(value).toString(),
        style: { fontSize: "12px", colors: ["#6B7280"] },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Matangazo na Matukio kwa Mwezi
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Idadi ya matangazo na matukio kulingana na tarehe ya kuanza
        </p>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-250 xl:min-w-full">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}
