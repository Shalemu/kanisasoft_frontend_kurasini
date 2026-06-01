import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import MatukioYaliyopita  from "@/components/matukio/matukio-yaliyopita/matukio-yaliyopita";


export const metadata: Metadata = {
  title: "Tazama matukio yaliyopita",
  description: "Matukio yaliyopita",
     icons: {
    icon: "/logo.png",
  },
};

export default function Page() {
  return (
    <div className="space-y-6">
      
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Tazama Matukio yaliyopita" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <MatukioYaliyopita />
      </div>

    </div>
  );
}