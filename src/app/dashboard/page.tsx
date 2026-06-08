import type { Metadata } from "next";
import React from "react";
import DashboardHome from "@/components/user/DashboardHome";
import Sadaka from "@/components/user/OfferingDashboard";
import Matukio from "@/components/user/MonthEvent";

export const metadata: Metadata = {
  title: "Dashboard | KanisaSoft",
  description: "KanisaSoft Dashboard - Manage your church activities efficiently with our comprehensive dashboard. Access key metrics, track events, and stay organized with ease.",
     icons: {
    icon: "/logo.png",
  },
};

export default function Ecommerce() {
  return (
    <div className="space-y-6">
      <DashboardHome />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <Matukio />
        </div>

        <div className="col-span-12">
          <Sadaka />
        </div>
      </div>
    </div>
  );
}
