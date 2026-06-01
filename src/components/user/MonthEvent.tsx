"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import flatpickr from "flatpickr";
import { CalenderIcon } from "../../icons";
import { apiFetch } from "@/lib/api";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function EventsStatisticsChart() {
  const datePickerRef = useRef<HTMLInputElement>(null);

  const [series, setSeries] = useState([
    {
      name: "Matukio",
      data: Array(12).fill(0),
    },
  ]);

  const [categories] = useState([
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ]);

 
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await apiFetch("/events/monthly");

        // expected backend:
        // { data: [2, 5, 1, 0, 3, 7, ...] }

        if (res?.data) {
          setSeries([
            {
              name: "Matukio",
              data: res.data,
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to load events stats", err);
      }
    }

    fetchEvents();
  }, []);

  // 📅 Flatpickr (keep same UI)
  useEffect(() => {
    if (!datePickerRef.current) return;

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    const fp = flatpickr(datePickerRef.current, {
      mode: "range",
      static: true,
      monthSelectorType: "static",
      dateFormat: "M d",
      defaultDate: [sevenDaysAgo, today],
      clickOpens: true,
    });

    return () => {
      if (!Array.isArray(fp)) fp.destroy();
    };
  }, []);

  const options: ApexOptions = {
    legend: {
      show: false,
    },
    colors: ["#10B981"], // green for events
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.4,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      x: {
        format: "MMM",
      },
      y: {
        formatter: (val: number) => `${val} tukio`,
      },
    },
    xaxis: {
      type: "category",
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6">

      {/* HEADER */}
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Matukio ya Mwezi (Events Statistics)
          </h3>
          <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
            Idadi ya matukio yaliyopangwa kila mwezi
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative inline-flex items-center">
            <CalenderIcon className="absolute left-3 text-gray-500" />
            <input
              ref={datePickerRef}
              className="h-10 w-40 pl-10 pr-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer"
              placeholder="Chagua tarehe"
            />
          </div>
        </div>
      </div>

      {/* CHART */}
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-250 xl:min-w-full">
          <Chart
            options={options}
            series={series}
            type="area"
            height={310}
          />
        </div>
      </div>
    </div>
  );
}