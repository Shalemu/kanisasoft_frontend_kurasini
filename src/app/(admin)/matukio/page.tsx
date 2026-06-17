import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Matukio from "@/components/matukio/matukio-yaliyopo/matukio";
import EventsStatisticsChart from "@/components/user/MonthEvent";


export const metadata: Metadata = {
  title: "Matangazo & Matukio",
  description: "Matangazo & Matukio",
     icons: {
    icon: "/logo.png",
  },
};

export default function Page() {
  return (
    <div className="space-y-6">
      
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Matangazo & Matukio" />

      <EventsStatisticsChart />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <Matukio />
      </div>

    </div>
  );
}
