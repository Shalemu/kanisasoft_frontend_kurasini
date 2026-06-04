"use client";

import React from "react";
import {
  BoxIconLine,
  GroupIcon,
} from "@/icons";
import { useDashboard } from "@/hooks/useDashboard";

export const UserCard = () => {
  const { totalMembers, groupsCount,visitorCount,leaderCount,loading } = useDashboard();

  return (
   <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">

      {/* ===== WASHIRIKA CARD ===== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">

        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Idadi ya Washirika
            </span>

            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loading ? "..." : totalMembers}
            </h4>
          </div>

        </div>
      </div>

      {/* ===== MAKUNDI CARD ===== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">

        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>

        <div className="mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Idadi ya Makundi
            </span>

            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loading ? "..." : groupsCount}
            </h4>
          </div>

        </div>
      </div>

      {/* ===== WAGENI CARD ===== */}
<div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">

  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
    <BoxIconLine className="text-gray-800 dark:text-white/90" />
  </div>

  <div className="mt-5">
    <div>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Idadi ya Wageni
      </span>

      <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
        {loading ? "..." : visitorCount}
      </h4>
    </div>

  </div>
</div>
    
      {/* ===== VIONGOZI CARD ===== */}
<div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">

  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
    <BoxIconLine className="text-gray-800 dark:text-white/90" />
  </div>

  <div className="mt-5">
    <div>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Idadi ya Viongozi
      </span>

      <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
        {loading ? "..." : leaderCount}
      </h4>
    </div>

  </div>
</div>

    </div>
  );
};
