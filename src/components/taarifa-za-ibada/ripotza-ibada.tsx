"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { apiFetch } from "@/lib/api";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ServiceEvent {
  date: string;
  attendance_children: number;
  attendance_women: number;
  attendance_men: number;
  total_offerings: number;
}

export default function RipotzaIbada() {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const [childrenData, setChildrenData] = useState<number[]>(Array(12).fill(0));
  const [womenData, setWomenData] = useState<number[]>(Array(12).fill(0));
  const [menData, setMenData] = useState<number[]>(Array(12).fill(0));
  const [sadakaData, setSadakaData] = useState<number[]>(Array(12).fill(0));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await apiFetch("/service-events");

    if (res.status === "success") {
      const events: ServiceEvent[] = res.service_events || [];

      const children = Array(12).fill(0);
      const women = Array(12).fill(0);
      const men = Array(12).fill(0);
      const sadaka = Array(12).fill(0);

      events.forEach((item) => {
        const monthIndex = new Date(item.date).getMonth();

        children[monthIndex] += Number(item.attendance_children || 0);
        women[monthIndex] += Number(item.attendance_women || 0);
        men[monthIndex] += Number(item.attendance_men || 0);
        sadaka[monthIndex] += Number(item.total_offerings || 0);
      });

      setChildrenData(children);
      setWomenData(women);
      setMenData(men);
      setSadakaData(sadaka);
    }
  };

  const options: ApexOptions = {
    colors: ["#f59e0b", "#ec4899", "#3b82f6", "#22c55e"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: months,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: "Idadi / Fedha",
      },
    },
    grid: {
      yaxis: { lines: { show: true } },
    },
    fill: { opacity: 1 },
    tooltip: {
      y: {
        formatter: (val: number, { seriesIndex }) => {
          if (seriesIndex === 3) return `${val.toLocaleString()} TZS`;
          return `${val} watu`;
        },
      },
    },
  };

  const series = [
    { name: "Watoto", data: childrenData },
    { name: "Wanawake", data: womenData },
    { name: "Wanaume", data: menData },
    { name: "Sadaka", data: sadakaData },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 text-gray-800 shadow-md dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90">
      
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Ripoti ya Ibada
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Mahudhurio na Sadaka kwa kila mwezi
        </p>
      </div>

      {/* CHART */}
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-175">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={350}
          />
        </div>
      </div>

    </div>
  );
}
