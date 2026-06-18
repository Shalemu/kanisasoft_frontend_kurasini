import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Nafasi from "@/components/viongozi/nafasi";

export const metadata: Metadata = {
  title: "Tazama Nafasi za Uongozi",
  description: "Nafasi za Uongozi",
     icons: {
    icon: "/logo.png",
  },
};

export default function Page() {
  return (
    <div className="space-y-6">
      
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Tazama Nafasi za Uongozi" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <Nafasi />
      </div>

    </div>
  );
}