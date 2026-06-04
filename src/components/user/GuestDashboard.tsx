"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useDashboard } from "@/hooks/useDashboard";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function WageniCard() {
  const { visitorCount, loading } = useDashboard();

  const percentage = visitorCount > 100 ? 100 : visitorCount; // optional logic

  const series = [percentage];

  const options: ApexOptions = {
    colors: ["#F59E0B"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: function () {
              return `${visitorCount}`;
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#F59E0B"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Wageni"],
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/3">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">

        {/* Header */}
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Wageni (Visitors)
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Jumla ya Wageni 
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="relative mt-6">
          <div className="max-h-82.5">
            <ReactApexChart
              options={options}
              series={series}
              type="radialBar"
              height={330}
            />
          </div>

        </div>

        <p className="mx-auto mt-4 w-full max-w-95 text-center text-sm text-gray-500 sm:text-base">
          Mfumo una wageni <b>{loading ? "..." : visitorCount}</b> waliorekodiwa.
        </p>
      </div>
    </div>
  );
}
