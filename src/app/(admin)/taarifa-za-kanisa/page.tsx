import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TaarifaZaKanisa from "@/components/taarifa-za-kanisa";
export const metadata: Metadata = {
  title: "Taarifa za Kanisa",
  description: "taarifa za kanisa",
};

export default function Page() {
  return (
    <div className="space-y-6">
      
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Taarifa za Kanisa" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <TaarifaZaKanisa />
      </div>

    </div>
  );
}