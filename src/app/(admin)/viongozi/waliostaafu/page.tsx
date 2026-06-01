import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Waliostafu from "@/components/viongozi/Waliostafu";

export const metadata: Metadata = {
  title: "Tazama Viongozi Waliostafu",
  description: "Viongozi Waliostafu wa kanisa",
     icons: {
    icon: "/logo.png",
  },
};

export default function Page() {
  return (
    <div className="space-y-6">
      
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Tazama Viongozi Waliostafu" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <Waliostafu />
      </div>

    </div>
  );
}