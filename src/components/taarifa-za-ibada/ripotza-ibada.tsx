"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import { apiFetch } from "@/lib/api";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ServiceEvent {
  id?: number;
  date: string;
  title?: string;
  service_name?: string;
  preacher?: string;
  leaders_on_duty?: string;
  duty_leader?: string;
  attendance_children: number;
  attendance_women: number;
  attendance_men: number;
  total_offerings: number;
}

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const getServiceName = (item: ServiceEvent) =>
  item.service_name || item.title || "-";

const formatDate = (value: string) =>
  value ? new Date(value).toLocaleDateString() : "-";

const toNumber = (value: unknown) => Number(value || 0);

export default function RipotzaIbada() {
  const [events, setEvents] = useState<ServiceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState("");
  const [filterService, setFilterService] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/service-events");

      if (res.status === "success") {
        setEvents(res.service_events || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const years = useMemo(() => {
    const uniqueYears = new Set(
      events
        .map((item) => new Date(item.date).getFullYear())
        .filter((year) => !Number.isNaN(year))
    );

    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [events]);

  const serviceTypes = useMemo(() => {
    const uniqueServices = new Set(events.map(getServiceName).filter(Boolean));
    return Array.from(uniqueServices).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((item) => {
      const itemYear = new Date(item.date).getFullYear();
      const matchesYear = filterYear ? String(itemYear) === filterYear : true;
      const matchesService = filterService
        ? getServiceName(item) === filterService
        : true;

      return matchesYear && matchesService;
    });
  }, [events, filterService, filterYear]);

  const report = useMemo(() => {
    const children = Array(12).fill(0);
    const women = Array(12).fill(0);
    const men = Array(12).fill(0);
    const sadaka = Array(12).fill(0);

    filteredEvents.forEach((item) => {
      const monthIndex = new Date(item.date).getMonth();

      if (Number.isNaN(monthIndex)) return;

      children[monthIndex] += toNumber(item.attendance_children);
      women[monthIndex] += toNumber(item.attendance_women);
      men[monthIndex] += toNumber(item.attendance_men);
      sadaka[monthIndex] += toNumber(item.total_offerings);
    });

    const totalChildren = children.reduce((sum, value) => sum + value, 0);
    const totalWomen = women.reduce((sum, value) => sum + value, 0);
    const totalMen = men.reduce((sum, value) => sum + value, 0);
    const totalAttendance = totalChildren + totalWomen + totalMen;
    const totalOfferings = sadaka.reduce((sum, value) => sum + value, 0);
    const averageAttendance =
      filteredEvents.length > 0 ? Math.round(totalAttendance / filteredEvents.length) : 0;

    return {
      children,
      women,
      men,
      sadaka,
      totalChildren,
      totalWomen,
      totalMen,
      totalAttendance,
      totalOfferings,
      averageAttendance,
    };
  }, [filteredEvents]);

  const attendanceOptions: ApexOptions = {
    colors: ["#f59e0b", "#ec4899", "#2563eb"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 360,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "42%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: months,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { title: { text: "Mahudhurio" } },
    legend: { show: true, position: "top", horizontalAlign: "left" },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: {
      y: { formatter: (value: number) => `${value.toLocaleString()} watu` },
    },
  };

  const sadakaOptions: ApexOptions = {
    colors: ["#16a34a"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      height: 280,
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    xaxis: {
      categories: months,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (value) => value.toLocaleString(),
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0.2,
        opacityFrom: 0.35,
        opacityTo: 0.04,
      },
    },
    tooltip: {
      y: { formatter: (value: number) => `${value.toLocaleString()} TZS` },
    },
  };

  const pieOptions: ApexOptions = {
    colors: ["#f59e0b", "#ec4899", "#2563eb"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "pie",
      toolbar: { show: false },
    },
    labels: ["Watoto", "Wanawake", "Wanaume"],
    legend: { position: "bottom" },
    dataLabels: {
      formatter: (value) => `${Number(value).toFixed(1)}%`,
    },
    tooltip: {
      y: { formatter: (value: number) => `${value.toLocaleString()} watu` },
    },
  };

  const attendanceSeries = [
    { name: "Watoto", data: report.children },
    { name: "Wanawake", data: report.women },
    { name: "Wanaume", data: report.men },
  ];

  const exportRows = filteredEvents.map((item, index) => {
    const children = toNumber(item.attendance_children);
    const women = toNumber(item.attendance_women);
    const men = toNumber(item.attendance_men);

    return {
      "#": index + 1,
      Tarehe: formatDate(item.date),
      Ibada: getServiceName(item),
      Mhubiri: item.preacher || "-",
      "Kiongozi wa Ibada": item.leaders_on_duty || "-",
      Watoto: children,
      Wanawake: women,
      Wanaume: men,
      Jumla: children + women + men,
      Sadaka: toNumber(item.total_offerings),
    };
  });

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Ripoti ya Ibada");
    XLSX.writeFile(workbook, "ripoti-ya-ibada.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF("landscape");

    doc.text("Ripoti ya Ibada", 14, 15);
    doc.setFontSize(10);
    doc.text(`Jumla ya mahudhurio: ${report.totalAttendance.toLocaleString()}`, 14, 23);
    doc.text(`Wastani wa mahudhurio: ${report.averageAttendance.toLocaleString()}`, 95, 23);
    doc.text(`Jumla ya sadaka: ${report.totalOfferings.toLocaleString()} TZS`, 175, 23);

    autoTable(doc, {
      startY: 30,
      head: [
        [
          "#",
          "Tarehe",
          "Ibada",
          "Mhubiri",
          "Kiongozi",
          "Watoto",
          "Wanawake",
          "Wanaume",
          "Jumla",
          "Sadaka",
        ],
      ],
      body: exportRows.map((row) => [
        row["#"],
        row.Tarehe,
        row.Ibada,
        row.Mhubiri,
        row["Kiongozi wa Ibada"],
        row.Watoto,
        row.Wanawake,
        row.Wanaume,
        row.Jumla,
        row.Sadaka.toLocaleString(),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 41, 59] },
    });

    doc.save("ripoti-ya-ibada.pdf");
  };

  return (
    <div className="space-y-6 text-gray-800 dark:text-white/90">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-md dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Ripoti ya Ibada</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Mahudhurio ya watoto, wanawake, wanaume na sadaka kwa kila ibada.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Mwaka
              </label>
              <select
                value={filterYear}
                onChange={(event) => setFilterYear(event.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="">Miaka yote</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Aina ya Ibada
              </label>
              <select
                value={filterService}
                onChange={(event) => setFilterService(event.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="">Ibada zote</option>
                {serviceTypes.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={exportExcel}
              disabled={filteredEvents.length === 0}
              className="inline-flex items-center gap-2 rounded bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaFileExcel />
              Excel
            </button>

            <button
              type="button"
              onClick={exportPDF}
              disabled={filteredEvents.length === 0}
              className="inline-flex items-center gap-2 rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaFilePdf />
              PDF
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        <SummaryItem label="Ibada" value={filteredEvents.length} />
        <SummaryItem label="Wastani wa Mahudhurio" value={report.averageAttendance.toLocaleString()} />
        <SummaryItem label="Watoto" value={report.totalChildren} />
        <SummaryItem label="Wanawake" value={report.totalWomen} />
        <SummaryItem label="Wanaume" value={report.totalMen} />
        <SummaryItem label="Sadaka" value={`${report.totalOfferings.toLocaleString()} TZS`} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-md dark:border-gray-800 dark:bg-white/[0.03] xl:col-span-2">
          <h3 className="mb-4 text-base font-semibold">Mahudhurio kwa Mwezi</h3>
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-175">
              <ReactApexChart
                options={attendanceOptions}
                series={attendanceSeries}
                type="bar"
                height={360}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-md dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-base font-semibold">Mgawanyo wa Mahudhurio</h3>
          {report.totalAttendance > 0 ? (
            <ReactApexChart
              options={pieOptions}
              series={[report.totalChildren, report.totalWomen, report.totalMen]}
              type="pie"
              height={330}
            />
          ) : (
            <EmptyState loading={loading} />
          )}
        </section>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-md dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-4 text-base font-semibold">Sadaka kwa Mwezi</h3>
        <ReactApexChart
          options={sadakaOptions}
          series={[{ name: "Sadaka", data: report.sadaka }]}
          type="area"
          height={280}
        />
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-md dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-4 flex flex-col gap-1">
          <h3 className="text-base font-semibold">Taarifa Zote za Ibada</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Jedwali hili linaonyesha watu wote waliorekodiwa kuhudhuria kwenye ibada zilizopo.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-3 py-2 text-left">Tarehe</th>
                <th className="px-3 py-2 text-left">Ibada</th>
                <th className="px-3 py-2 text-left">Mhubiri</th>
                <th className="px-3 py-2 text-left">Kiongozi</th>
                <th className="px-3 py-2 text-center">Watoto</th>
                <th className="px-3 py-2 text-center">Wanawake</th>
                <th className="px-3 py-2 text-center">Wanaume</th>
                <th className="px-3 py-2 text-center">Jumla</th>
                <th className="px-3 py-2 text-right">Sadaka</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-gray-500">
                    {loading ? "Inapakia..." : "Hakuna taarifa kwenye vichujio hivi."}
                  </td>
                </tr>
              ) : (
                filteredEvents.map((item, index) => {
                  const children = toNumber(item.attendance_children);
                  const women = toNumber(item.attendance_women);
                  const men = toNumber(item.attendance_men);
                  const total = children + women + men;

                  return (
                    <tr
                      key={`${item.id ?? item.date}-${index}`}
                      className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.04]"
                    >
                      <td className="px-3 py-2">{formatDate(item.date)}</td>
                      <td className="px-3 py-2">{getServiceName(item)}</td>
                      <td className="px-3 py-2">{item.preacher || "-"}</td>
                      <td className="px-3 py-2">{item.leaders_on_duty || item.duty_leader || "-"}</td>
                      <td className="px-3 py-2 text-center">{children}</td>
                      <td className="px-3 py-2 text-center">{women}</td>
                      <td className="px-3 py-2 text-center">{men}</td>
                      <td className="px-3 py-2 text-center font-semibold">{total}</td>
                      <td className="px-3 py-2 text-right">
                        {toNumber(item.total_offerings).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function EmptyState({ loading }: { loading: boolean }) {
  return (
    <div className="flex h-[330px] items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 dark:border-gray-700">
      {loading ? "Inapakia..." : "Hakuna taarifa za kuonyesha"}
    </div>
  );
}
