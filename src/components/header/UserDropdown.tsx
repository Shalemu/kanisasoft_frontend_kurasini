"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { clearSession } from "@/lib/session";
import ChangePasswordModal from "@/components/modals/ChangePasswordModal";

export default function UserDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const toggleDropdown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsOpen((p) => !p);
  };

  const closeDropdown = () => setIsOpen(false);

  const handleSignOut = () => {
    clearSession();
    closeDropdown();
    router.replace("/login");
  };

  const itemClass =
    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition " +
    "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5";

  return (
    <>
      {/* TRIGGER */}
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="flex items-center justify-center p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5 transition"
        >
          <svg
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            viewBox="0 0 18 20"
            fill="none"
          >
            <path
              d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* DROPDOWN */}
        <Dropdown
          isOpen={isOpen}
          onClose={closeDropdown}
          className="absolute right-0 mt-3 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-800 dark:bg-gray-900"
        >
          <ul className="flex flex-col gap-1">

            {/* SETTINGS */}
            <li>
              <DropdownItem
                onItemClick={closeDropdown}
                tag="a"
                href="/profile"
                className={itemClass}
              >
                <IconSettings />
                Account Settings
              </DropdownItem>
            </li>

            {/* SUPPORT */}
            <li>
              <DropdownItem
                onItemClick={closeDropdown}
                tag="a"
                href="/pata-usaidizi"
                className={itemClass}
              >
                <IconHelp />
                Support
              </DropdownItem>
            </li>

            {/* CHANGE PASSWORD */}
            <li>
              <button
                onClick={() => {
                  closeDropdown();
                  router.push("/change-password");
                }}
                className={itemClass}
              >
                <IconLock />
                Change Password
              </button>
            </li>
          </ul>

          {/* DIVIDER */}
          <div className="my-2 border-t border-gray-200 dark:border-gray-800" />

          {/* SIGN OUT */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
          >
            <IconLogout />
            Sign out
          </button>
        </Dropdown>
      </div>

      {/* MODAL (optional) */}
      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </>
  );
}



function IconSettings() {
  return (
    <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none">
      <path
        d="M19.4 13a7.8 7.8 0 0 0 0-2l2-1.5-2-3.5-2.4 1a7.7 7.7 0 0 0-1.7-1l-.3-2.6h-4l-.3 2.6a7.7 7.7 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7.8 7.8 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7.7 7.7 0 0 0 1.7 1l.3 2.6h4l.3-2.6a7.7 7.7 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function IconHelp() {
  return (
    <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-2h2zm1.07-7.75-.9.92A1.49 1.49 0 0 0 12 11h-1v-1a3 3 0 1 1 3-3z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function IconLock() {
  return (
    <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 1C8.7 1 6 3.7 6 7v3H5c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2h-1V7c0-3.3-2.7-6-6-6zm-4 9V7c0-2.2 1.8-4 4-4s4 1.8 4 4v3H8zm4 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none">
      <path d="M16 13v-2H7V8l-5 4 5 4v-3z" fill="currentColor" />
      <path
        d="M20 3h-8a2 2 0 0 0-2 2v3h2V5h8v14h-8v-3H10v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"
        fill="currentColor"
      />
    </svg>
  );
}