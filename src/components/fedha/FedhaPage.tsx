"use client";

import { useState, useCallback } from "react";
import SadakaTab from "./SadakaTab";
import ZakaTab from "./ZakaTab";
import MichangoTab from "./MichangoTab";
import AnkaraTab from "./AnkaraTab";
import { FaChurch, FaHandHoldingUsd, FaMoneyBillWave, FaFileInvoiceDollar } from "react-icons/fa";

type Tab = "sadaka" | "zaka" | "michango" | "ankara";

interface Stats {
  sadaka: number;
  zaka: number;
  michango: number;
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className={`mt-2 text-2xl font-bold ${color}`}>
        TZS {value.toLocaleString()}
      </p>
      <p className="mt-1 text-xs text-gray-400">Mwezi huu</p>
    </div>
  );
}

const TABS: { key: Tab; label: string; icon: React.ReactNode; description: string }[] = [
  { key: "sadaka", label: "Sadaka", icon: <FaChurch />, description: "Sadaka za ibada" },
  { key: "zaka", label: "Zaka", icon: <FaHandHoldingUsd />, description: "Fungu la kumi" },
  { key: "michango", label: "Michango", icon: <FaMoneyBillWave />, description: "Michango ya washirika" },
  { key: "ankara", label: "Ankara za Kanisasoft", icon: <FaFileInvoiceDollar />, description: "Ankara zilizopakiwa" },
];

export default function FedhaPage() {
  const [activeTab, setActiveTab] = useState<Tab>("sadaka");
  const [stats, setStats] = useState<Stats>({ sadaka: 0, zaka: 0, michango: 0 });

  const updateSadaka = useCallback((v: number) => setStats((p) => ({ ...p, sadaka: v })), []);
  const updateZaka = useCallback((v: number) => setStats((p) => ({ ...p, zaka: v })), []);
  const updateMichango = useCallback((v: number) => setStats((p) => ({ ...p, michango: v })), []);

  return (
    <div className="space-y-6 text-gray-800 dark:text-white/90">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Sadaka Mwezi Huu" value={stats.sadaka} color="text-yellow-600 dark:text-yellow-400" />
        <StatCard title="Zaka Mwezi Huu" value={stats.zaka} color="text-blue-600 dark:text-blue-400" />
        <StatCard title="Michango Mwezi Huu" value={stats.michango} color="text-emerald-700 dark:text-emerald-400" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? "border-[#f0ce32] text-[#1e293b] dark:text-[#f0ce32]"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "sadaka" && <SadakaTab onStatsChange={updateSadaka} />}
        {activeTab === "zaka" && <ZakaTab onStatsChange={updateZaka} />}
        {activeTab === "michango" && <MichangoTab onStatsChange={updateMichango} />}
        {activeTab === "ankara" && <AnkaraTab />}
      </div>
    </div>
  );
}
