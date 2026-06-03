import type { Metadata } from "next";
import React from "react";

import { UserCard } from "@/components/user/UserDashboard";
import MonthlyTarget from "@/components/user/GuestDashboard";
import MonthlySalesChart from "@/components/user/OfferingDashboard";
import StatisticsChart from "@/components/user/MonthEvent";
import RecentOrders from "@/components/user/RecentOrders";
import DemographicCard from "@/components/user/DemographicCard";

export const metadata: Metadata = {
  title:
    " Dashboard | KanisaSoft - Church Management Software for Efficient Church Operations",
  description: "Welcome to your KanisaSoft dashboard, where you can manage your church's operations efficiently. Access tools for member management, event planning, financial tracking, and more. Stay organized and connected with your congregation using our comprehensive church management software.",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <UserCard />

        <MonthlySalesChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders />
      </div>
    </div>
  );
}