"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFileExcel, FaFilePdf, FaChartBar } from "react-icons/fa";
import { apiFetch } from "@/lib/api";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface FinancialRecord {
  id?: number;
  date?: string | null;
  service_date?: string | null;
  tithe_date?: string | null;
  contribution_date?: string | null;
  created_at?: string | null;
  amount: number | string;
}

function getDate(r: FinancialRecord) {
  return r.date ?? r.service_date ?? r.tithe_date ?? r.contribution_date ?? r.created_at ?? "";
}

function getAmount(r: FinancialRecord) {
  return Number(r.amount ?? 0) || 0;
}

function normalizeList(res: any, keys: string[]): FinancialRecord[] {
  for (const key of keys) {
    const data = res?.[key] ?? res?.data?.[key] ?? res?.data ?? res ?? [];
    if (Array.isArray(data) && data.length > 0) return data;
  }
  return [];
}

export default function FedhaRipoti() {
  const [sadaka, setSadaka] = useState<FinancialRecord[]>([]);
  const [zaka, setZaka] = useState<FinancialRecord[]>([]);
  const [michango, setMichango] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, zRes, mRes] = await Promise.allSettled([
        apiFetch("/sadaka"),
        apiFetch("/zaka"),
        apiFetch("/contributions"),
      ]);

      if (sRes.status === "fulfilled") {
        setSadaka(normalizeList(sRes.value, ["sadaka", "data"]));
      }
      if (zRes.status === "fulfilled") {
        setZaka(normalizeList(zRes.value, ["zaka", "tithe", "data"]));
      }
      if (mRes.status === "fulfilled") {
        setMichango(normalizeList(mRes.value, ["contributions", "michango", "data"]));
      }
    } finally {
      setLoading(false);
    }
  };

  const years = useMemo(() => {
    const allDates = [...sadaka, ...zaka, ...michango].map((r) => getDate(r)).filter(Boolean);
    const uniqueYears = new Set(allDates.map((d) => new Date(d).getFullYear()).filter((y) => !Number.isNaN(y)));
    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [sadaka, zaka, michango]);

  const filterByYear = (records: FinancialRecord[]) => {
    if (!filterYear) return records;
    return records.filter((r) => {
      const d = new Date(getDate(r));
      return !Number.isNaN(d.getFullYear()) && String(d.getFullYear()) === filterYear;
    });
  };

  const sadakaFiltered = useMemo(() => filterByYear(sadaka), [sadaka, filterYear]);
  const zakaFiltered = useMemo(() => filterByYear(zaka), [zaka, filterYear]);
  const michangoFiltered = useMemo(() => filterByYear(michango), [michango, filterYear]);

  const report = useMemo(() => {
    const sadakaMonthly = Array(12).fill(0);
    const zakaMonthly = Array(12).fill(0);
    const michangoMonthly = Array(12).fill(0);

    sadakaFiltered.forEach((r) => {
      const idx = new Date(getDate(r)).getMonth();
      if (!Number.isNaN(idx)) sadakaMonthly[idx] += getAmount(r);
    });
    zakaFiltered.forEach((r) => {
      const idx = new Date(getDate(r)).getMonth();
      if (!Number.isNaN(idx)) zakaMonthly[idx] += getAmount(r);
    });
    michangoFiltered.forEach((r) => {
      const idx = new Date(getDate(r)).getMonth();
      if (!Number.isNaN(idx)) michangoMonthly[idx] += getAmount(r);
    });

    const totalSadaka = sadakaMonthly.reduce((a, b) => a + b, 0);
    const totalZaka = zakaMonthly.reduce((a, b) => a + b, 0);
    const totalMichango = michangoMonthly.reduce((a, b) => a + b, 0);
    const grandTotal = totalSadaka + totalZaka + totalMichango;

    return {
      sadakaMonthly,
      zakaMonthly,
      michangoMonthly,
      totalSadaka,
      totalZaka,
      totalMichango,
      grandTotal,
    };
  }, [sadakaFiltered, zakaFiltered, michangoFiltered]);

  const barOptions: ApexOptions = {
    colors: ["#f59e0b", "#2563eb", "#16a34a"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 360,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
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
    yaxis: {
      labels: { formatter: (value) => value.toLocaleString() },
    },
    legend: { show: true, position: "top", horizontalAlign: "left" },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: {
      y: { formatter: (value: number) => `${value.toLocaleString()} TZS` },
    },
  };

  const barSeries = [
    { name: "Sadaka", data: report.sadakaMonthly },
    { name: "Zaka", data: report.zakaMonthly },
    { name: "Michango", data: report.michangoMonthly },
  ];

  const areaOptions: ApexOptions = {
    colors: ["#7c3aed"],
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
      labels: { formatter: (value) => value.toLocaleString() },
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

  const totalMonthly = report.sadakaMonthly.map((v, i) => v + report.zakaMonthly[i] + report.michangoMonthly[i]);

  const pieOptions: ApexOptions = {
    colors: ["#f59e0b", "#2563eb", "#16a34a"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "pie",
      toolbar: { show: false },
    },
    labels: ["Sadaka", "Zaka", "Michango"],
    legend: { position: "bottom" },
    dataLabels: {
      formatter: (value) => `${Number(value).toFixed(1)}%`,
    },
    tooltip: {
      y: { formatter: (value: number) => `${value.toLocaleString()} TZS` },
    },
  };

  const exportRows = useMemo(() => {
    const rows: any[] = [];
    const addRows = (records: FinancialRecord[], category: string) => {
      records.forEach((r, i) => {
        rows.push({
          "#": rows.length + 1,
          Kategoria: category,
          Tarehe: getDate(r) ? new Date(getDate(r)).toLocaleDateString("sw-TZ") : "-",
          Kiasi: getAmount(r),
        });
      });
    };
    addRows(sadakaFiltered, "Sadaka");
    addRows(zakaFiltered, "Zaka");
    addRows(michangoFiltered, "Michango");
    return rows.sort((a, b) => new Date(a.Tarehe).getTime() - new Date(b.Tarehe).getTime());
  }, [sadakaFiltered, zakaFiltered, michangoFiltered]);

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ripoti ya Fedha");
    XLSX.writeFile(workbook, "ripoti-ya-fedha.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF("landscape");
    doc.setFontSize(14);
    doc.text("Ripoti ya Fedha za Kanisa", 14, 12);
    doc.setFontSize(9);

    // Summary stats in a 2x2 grid layout to avoid overflow
    const leftCol = 14;
    const rightCol = 150;
    const row1Y = 20;
    const row2Y = 26;

    doc.text(`Jumla ya Sadaka: ${report.totalSadaka.toLocaleString()} TZS`, leftCol, row1Y);
    doc.text(`Jumla ya Zaka: ${report.totalZaka.toLocaleString()} TZS`, rightCol, row1Y);
    doc.text(`Jumla ya Michango: ${report.totalMichango.toLocaleString()} TZS`, leftCol, row2Y);
    doc.text(`Jumla Kuu: ${report.grandTotal.toLocaleString()} TZS`, rightCol, row2Y);

    autoTable(doc, {
      startY: 32,
      head: [["#", "Kategoria", "Tarehe", "Kiasi (TZS)"]],
      body: exportRows.map((row) => [row["#"], row.Kategoria, row.Tarehe, row.Kiasi.toLocaleString()]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 41, 59] },
    });

    doc.save("ripoti-ya-fedha.pdf");
  };

  return (
    <div className="space-y-6 text-gray-800 dark:text-white/90">
      {/* Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-md dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Ripoti ya Fedha</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Muhtasari wa sadaka, zaka na michango kwa kipindi kilichochaguliwa.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">Miaka yote</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={exportExcel}
              disabled={exportRows.length === 0}
              className="inline-flex items-center gap-2 rounded bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaFileExcel /> Excel
            </button>

            <button
              type="button"
              onClick={exportPDF}
              disabled={exportRows.length === 0}
              className="inline-flex items-center gap-2 rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaFilePdf /> PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryItem label="Sadaka" value={`${report.totalSadaka.toLocaleString()} TZS`} color="text-yellow-600 dark:text-yellow-400" />
        <SummaryItem label="Zaka" value={`${report.totalZaka.toLocaleString()} TZS`} color="text-blue-600 dark:text-blue-400" />
        <SummaryItem label="Michango" value={`${report.totalMichango.toLocaleString()} TZS`} color="text-emerald-700 dark:text-emerald-400" />
        <SummaryItem label="Jumla Kuu" value={`${report.grandTotal.toLocaleString()} TZS`} color="text-[#1e293b] dark:text-white" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-md dark:border-gray-800 dark:bg-white/[0.03] lg:col-span-2">
          <h3 className="mb-4 text-base font-semibold">Makusanyo kwa Mwezi</h3>
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[600px] h-[360px]">
              {loading ? (
                <EmptyState loading />
              ) : (
                <ReactApexChart
                  key={`bar-${filterYear}-${report.grandTotal}`}
                  options={barOptions}
                  series={barSeries}
                  type="bar"
                  height={360}
                />
              )}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-md dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-base font-semibold">Mgawanyo wa Makusanyo</h3>
          <div className="h-[330px]">
            {report.grandTotal > 0 ? (
              <ReactApexChart
                key={`pie-${filterYear}-${report.grandTotal}`}
                options={pieOptions}
                series={[report.totalSadaka, report.totalZaka, report.totalMichango]}
                type="pie"
                height={330}
              />
            ) : (
              <EmptyState loading={loading} />
            )}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-md dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-4 text-base font-semibold">Jumla ya Makusanyo kwa Mwezi</h3>
        <div className="h-[280px]">
          {loading ? (
            <EmptyState loading />
          ) : (
            <ReactApexChart
              key={`area-${filterYear}-${report.grandTotal}`}
              options={areaOptions}
              series={[{ name: "Jumla", data: totalMonthly }]}
              type="area"
              height={280}
            />
          )}
        </div>
      </section>

      {/* Data Table */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-md dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-4 flex flex-col gap-1">
          <h3 className="text-base font-semibold">Taarifa Zote za Fedha</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Jedwali hili linaonyesha sadaka, zaka na michango zilizorekodiwa.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-[#1e293b] text-white">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Kategoria</th>
                <th className="px-3 py-2 text-left">Tarehe</th>
                <th className="px-3 py-2 text-right">Kiasi (TZS)</th>
              </tr>
            </thead>
            <tbody>
              {exportRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-gray-500">
                    {loading ? "Inapakia..." : "Hakuna taarifa kwenye vichujio hivi."}
                  </td>
                </tr>
              ) : (
                exportRows.map((row) => (
                  <tr key={row["#"]}
                    className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.04]"
                  >
                    <td className="px-3 py-2">{row["#"]}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        row.Kategoria === "Sadaka" ? "bg-yellow-100 text-yellow-700" :
                        row.Kategoria === "Zaka" ? "bg-blue-100 text-blue-700" :
                        "bg-emerald-100 text-emerald-700"
                      }`}>
                        {row.Kategoria}
                      </span>
                    </td>
                    <td className="px-3 py-2">{row.Tarehe}</td>
                    <td className="px-3 py-2 text-right font-semibold">{row.Kiasi.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SummaryItem({ label, value, color }: { label: string; value: React.ReactNode; color: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${color} break-words`}>{value}</p>
    </div>
  );
}

function EmptyState({ loading }: { loading: boolean }) {
  return (
    <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 dark:border-gray-700">
      {loading ? "Inapakia..." : "Hakuna taarifa za kuonyesha"}
    </div>
  );
}
