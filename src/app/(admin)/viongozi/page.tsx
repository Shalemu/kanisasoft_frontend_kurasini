import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Viongozi from "@/components/viongozi/viongozi";

export const metadata: Metadata = {
  title: "Tazama Viongozi wetu",
  description: "Viongozi wa kanisa",
     icons: {
    icon: "/logo.png",
  },
};

export default function Page() {
  return (
    <div className="space-y-6">
      
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Tazama Viongozi" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <Viongozi />
      </div>

    </div>
  );
}