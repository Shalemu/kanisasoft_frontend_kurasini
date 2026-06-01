"use client";

import WaliopoteaList from "./waliopoteaList";
import WaliopoteaFilters from "./waliopoteaFilters";
import { useState } from "react";

export default function Waliopotea() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  return (
    <div className="space-y-6">
      {/* Filters */}
      <WaliopoteaFilters
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
      <WaliopoteaList
        searchTerm={searchTerm}
        selectedMonth={selectedMonth}
        selectedGroup={selectedGroup}
        fromDate={fromDate}
        toDate={toDate}
      />

    </div>
  );
}