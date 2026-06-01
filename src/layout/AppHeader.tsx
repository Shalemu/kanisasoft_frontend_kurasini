"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);

  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();


  const user = useAuthUser();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">

        {/* LEFT SECTION */}
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">

          <button
            className="items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-99999 dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? "X" : "☰"}
          </button>

          <Link href="/" className="lg:hidden">
            <Image width={154} height={32} src="./images/logo/logo.svg" alt="Logo" />
          </Link>

          {/* SEARCH */}
          <div className="hidden lg:block">
            <form>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Tafuta Hapa..."
                  className="h-11 w-full rounded-lg border px-4 text-sm"
                />
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } items-center justify-between w-full gap-4 px-5 py-4 lg:flex lg:justify-end lg:px-0`}
        >

          <ThemeToggleButton />
          <NotificationDropdown />

          {/* USER INFO ADDED HERE */}
          <div className="flex items-center gap-3">

            {/* NAME + ROLE */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {user?.full_name || "Guest User"}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role || "No role"}
              </p>
            </div>

            {/* AVATAR */}
            <div className="w-9 h-9 rounded-full bg-[#f0ce32] flex items-center justify-center font-bold text-black">
              {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            {/* EXISTING DROPDOWN */}
            <UserDropdown />
          </div>

        </div>
      </div>
    </header>
  );
};

export default AppHeader;