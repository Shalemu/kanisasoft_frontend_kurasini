"use client";

import { useState } from "react";
import RasilimaliForm from "./RasilimaliForm";
import RasilimaliList from "./RasilimaliList";
import { FaSearch } from "react-icons/fa";

export default function Rasilimali() {
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Add Resource Form */}
      <RasilimaliForm onSuccess={handleSuccess} />

      {/* Search Bar */}
      <div className="relative max-w-md">
        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tafuta kwa kichwa..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e293b] dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Resources List */}
      <RasilimaliList searchTerm={searchTerm} refreshKey={refreshKey} />
    </div>
  );
}
