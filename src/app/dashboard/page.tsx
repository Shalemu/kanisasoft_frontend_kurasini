import type { Metadata } from "next";
import React from "react";
import DashboardHome from "@/components/user/DashboardHome";

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
    </div>
  );
}
