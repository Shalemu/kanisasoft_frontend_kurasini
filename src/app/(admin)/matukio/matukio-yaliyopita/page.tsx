import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Matukio from "@/components/matukio/matukio-yaliyopo/matukio";


export const metadata: Metadata = {
  title: "Tazama matangazo na matukio yaliyopita",
  description: "Matangazo & Matukio yaliyopita",
     icons: {
    icon: "/logo.png",
  },
};

export default function Page() {
  return (
    <div className="space-y-6">
      
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Tazama Matangazo & Matukio yaliyopita" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <Matukio scope="past" />
      </div>

    </div>
  );
}
