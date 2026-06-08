"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiAuthError, apiFetch } from "@/lib/api";
import { Dropdown } from "../ui/dropdown/Dropdown";

interface PendingUser {
  id: number;
  full_name: string;
  created_at?: string;
  role?: string | null;
  membership_status?: string | null;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);

  useEffect(() => {
    async function loadPendingUsers() {
      try {
        const response = await apiFetch("/users");
        const users = response?.users ?? response?.data?.users ?? [];
        setPendingUsers(users.filter((user: PendingUser) => user.role !== "mchungaji" && user.membership_status === "pending"));
      } catch (error) {
        if (error instanceof ApiAuthError) return;

        console.error("Failed to load pending registrations", error);
      }
    }
    void loadPendingUsers();
  }, []);

  return (
    <div className="relative">
      <button
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={`Usajili unaosubiri: ${pendingUsers.length}`}
      >
        {pendingUsers.length > 0 && <span className="absolute -right-1 -top-1 z-10 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{pendingUsers.length > 99 ? "99+" : pendingUsers.length}</span>}
        <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20">
          <path fillRule="evenodd" clipRule="evenodd" d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z" />
        </svg>
      </button>
      <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="absolute -right-[240px] mt-[17px] flex max-h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0">
        <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
          <div><h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Usajili Mpya</h5><p className="text-xs text-gray-500">{pendingUsers.length} wanasubiri kuidhinishwa</p></div>
          <Link onClick={() => setIsOpen(false)} href="/washirika?status=pending" className="text-sm font-medium text-blue-600 hover:underline">Tazama wote</Link>
        </div>
        <div className="overflow-y-auto">
          {pendingUsers.length === 0 ? <p className="p-5 text-center text-sm text-gray-500">Hakuna usajili unaosubiri.</p> : pendingUsers.map((user) => (
            <Link key={user.id} href={`/washirika/detail?id=${user.id}`} onClick={() => setIsOpen(false)} className="block rounded-lg border-b border-gray-100 px-4 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5">
              <p className="font-medium text-gray-800 dark:text-white/90">{user.full_name}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "Usajili mpya"}</p>
            </Link>
          ))}
        </div>
      </Dropdown>
    </div>
  );
}
