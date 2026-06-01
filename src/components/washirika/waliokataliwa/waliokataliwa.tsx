"use client";

import { useState } from "react";
import WaliokataliwaList from "./waliokataliwaList";
import WaliokataliwaFilters from "./waliokataliwaFilters";

export default function Waliopotea() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">

      {/* Loading indicator */}
      {loading && (
        <div className="rounded-xl border bg-white p-4 text-center shadow-sm">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>

          <p className="mt-2 text-sm text-gray-500">
            Inapakia washirika waliopotea...
          </p>
        </div>
      )}

      <WaliokataliwaFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
      />

      <WaliokataliwaList
        searchTerm={searchTerm}
        selectedMonth={selectedMonth}
        selectedGroup={selectedGroup}
        fromDate={fromDate}
        toDate={toDate}
        setLoading={setLoading}
      />
    </div>
  );
}