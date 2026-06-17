"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Quote } from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  FolderIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";
import { useAuthUser } from "@/hooks/useAuthUser";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Mwanzo",
    path: "/dashboard" // dashboard route
  },

  {
    icon: <UserCircleIcon />,
    name: "Washirika",
    subItems: [
      { name: "Orodha ya Washirika", path: "/washirika", pro: false },
      { name: "Ongeza Mshirika", path: "/washirika/ongeza-washirika", pro: false },
      { name: "Washirika Waliokataliwa", path: "/washirika/waliokataliwa", pro: false },
      { name: "Washirika Waliopotea", path: "/washirika/waliopotea", pro: false },
      { name: "Ndoa za Washirika", path: "/washirika/ndoa", pro: false },
      { name: "Kutafuta & Kuchuja Washirika", path: "/washirika/ripoti", pro: false },
    ],
  },
  {
    icon: <CalenderIcon />,
    name: "Taarifa za Ibada",
      subItems: [
      { name: "Taarifa Za Ibada", path: "/taarifa-za-ibada", pro: false },
        { name: "Ongeza taarifa", path: "/taarifa-za-ibada/ongeza-taarifa", pro: false },
     { name: "Tazama ripoti", path: "/taarifa-za-ibada/ripot", pro: false },
    
    ],
   
  },
  {
    icon: <ListIcon />,
    name: "Wageni",
    subItems: [
       { name: "Orodha ya wageni", path: "/wageni", pro: false },
      //  { name: "Takwimu", path: "/form-elements", pro: false },
    ],
   
  },
  {
    icon: <PieChartIcon />,
    name: "Fedha",
    subItems: [
      { name: "Fedha", path: "/fedha", pro: false },
      { name: "Ripoti ya Fedha", path: "/fedha/ripoti", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Viongozi",
    subItems: [{ name: "viongozi", path: "/viongozi", pro: false },
              {
      name: "Waliostaafu",
      path: "/viongozi/waliostaafu",
      pro: false
    }
    ],

  },
  {
    icon: <PageIcon />,
    name: "SMS",
    subItems: [

      { name: "Tuma Ujumbe", path: "/sms/tuma-ujumbe", pro: false },
      { name: "Ripoti ya Ujumbe", path: "/sms", pro: false },
    
      // { name: "SMS zilizotumwa", path: "/error-404", pro: false },
    ],
  },
  {
    icon: <Quote />,
    name: "Neno la Siku",
    path: "/neno-la-siku",
  },
];

const othersItems: NavItem[] = [
  {
    icon: <FolderIcon />,
    name: "Rasilimali",
    path: "/rasilimali",
  },
  {
    icon: <CalenderIcon />,
    name: "Matangazo & Matukio",
    subItems: [
      { name: "Matangazo & Matukio", path: "/matukio", pro: false },
      //  { name: "matukio", path: "/matukio", pro: false },
      { name: "Matangazo & Matukio yaliyopita", path: "/matukio/matukio-yaliyopita", pro: false },
     
    ],
  },
  {
    icon: <GridIcon />,
    name: "Makundi",
    subItems: [
      { name: "Orodha ya Makundi", path: "/makundi", pro: false },
      // { name: "Avatar", path: "/alerts", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const user = useAuthUser();
  const canManageDailyWords = ["admin", "mchungaji"].includes(
    String(user?.role ?? "").toLowerCase()
  );
  const visibleNavItems = useMemo(
    () =>
      canManageDailyWords
        ? navItems
        : navItems.filter((item) => item.path !== "/neno-la-siku"),
    [canManageDailyWords]
  );

  const renderMenuItems = (
  navItems: NavItem[],
  menuType: "main" | "others"
) => (
  <ul className="flex flex-col gap-4">
    {navItems.map((nav, index) => (
      <li key={nav.name}>
        {nav.subItems ? (
          <button
            onClick={() => handleSubmenuToggle(index, menuType)}
            className={`menu-item group transition-colors duration-200 ${
              openSubmenu?.type === menuType &&
              openSubmenu?.index === index
                ? "bg-[#334155] text-[#f0ce32]"
                : "text-white hover:bg-[#334155]"
            } cursor-pointer ${
              !isExpanded && !isHovered
                ? "lg:justify-center"
                : "lg:justify-start"
            }`}
          >
            <span
              className={`${
                openSubmenu?.type === menuType &&
                openSubmenu?.index === index
                  ? "text-[#f0ce32]"
                  : "text-white"
              }`}
            >
              {nav.icon}
            </span>

            {(isExpanded || isHovered || isMobileOpen) && (
              <span className="text-white font-medium">
                {nav.name}
              </span>
            )}

            {(isExpanded || isHovered || isMobileOpen) && (
              <span
                className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                  openSubmenu?.type === menuType &&
                  openSubmenu?.index === index
                    ? "rotate-180 text-[#f0ce32]"
                    : "text-white"
                }`}
              >
                <ChevronDownIcon />
              </span>
            )}
          </button>
        ) : (
          nav.path && (
            <Link
              href={nav.path}
              className={`menu-item group transition-colors duration-200 ${
                isActive(nav.path)
                  ? "bg-[#334155] text-[#f0ce32]"
                  : "text-white hover:bg-[#334155]"
              }`}
            >
              <span
                className={`${
                  isActive(nav.path)
                    ? "text-[#f0ce32]"
                    : "text-white"
                }`}
              >
                {nav.icon}
              </span>

              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="text-white font-medium">
                  {nav.name}
                </span>
              )}
            </Link>
          )
        )}

        {nav.subItems &&
          (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType &&
                  openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item transition-colors duration-200 ${
                        isActive(subItem.path)
                          ? "text-[#f0ce32] bg-[#334155]"
                          : "text-slate-300 hover:text-white hover:bg-[#334155]"
                      }`}
                    >
                      {subItem.name}

                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span className="text-xs text-[#f0ce32]">
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span className="text-xs text-[#f0ce32]">
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
      </li>
    ))}
  </ul>
);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
 const isActive = useCallback(
  (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`),
  [pathname]
);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? visibleNavItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname,isActive, visibleNavItems]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
   <aside
  className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0
    bg-[#1e293b] text-white h-screen
    transition-all duration-300 ease-in-out z-50
    border-r border-slate-700
    ${
      isExpanded || isMobileOpen
        ? "w-72.5"
        : isHovered
        ? "w-72.5"
        : "w-22.5"
    }
    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0`}
>
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
      <Link href="/">
        {isExpanded || isHovered || isMobileOpen ? (
        <Image
        src="/images/logo/logo.png"
        alt="KanisaSoft Logo"
        width={170}
        height={50}
        priority
        className="object-contain"
      />
        ) : (
          <Image
            src="/images/logo/logo-mini.png"
            alt="KanisaSoft Logo"
            width={40}
            height={40}
            priority
            className="object-contain"
          />
        )}
      </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-slate-300 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  ""
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(visibleNavItems, "main")}
            </div>

            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-slate-300 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  ""
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
