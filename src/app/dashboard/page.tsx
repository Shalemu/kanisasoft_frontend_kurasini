import type { Metadata } from "next";
import { UserCard } from "@/components/user/UserDashboard";
import React from "react";
import Wageni from "@/components/user/GuestDashboard";
import Sadaka from "@/components/user/OfferingDashboard";
import Matukio from "@/components/user/MonthEvent";
import RecentOrders from "@/components/user/RecentOrders";
import DemographicCard from "@/components/user/DemographicCard";

export const metadata: Metadata = {
  title:
    "",
  description: "",
     icons: {
    icon: "/logo.png",
  },
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">

      {/* Full width user cards */}
      <div className="col-span-12">
        <UserCard />
      </div>

      {/* Matukio section */}
       <div className="col-span-12">
        <Matukio />
      </div>

      {/* Sadaka section */}
    <div className="col-span-12 xl:col-span-12">
    <Sadaka />
  </div>

    

    </div>
  );
}