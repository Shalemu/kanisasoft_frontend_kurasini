"use client";

import WashirikaList from "./WashirikaList";
import WashirikaCalendar from "./washirikaCalendar";
import WashirikaFilters from "./WashirikaFilters";
import { useState } from "react";

export default function Washirika() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  return (
    <div className="space-y-6">
      {/* Filters */}
      <WashirikaFilters
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

      {/* Members List */}
      <WashirikaList
        searchTerm={searchTerm}
        selectedMonth={selectedMonth}
        selectedGroup={selectedGroup}
        fromDate={fromDate}
        toDate={toDate}
      />

    </div>
  );
}