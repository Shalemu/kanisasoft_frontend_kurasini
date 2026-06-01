import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TaarifaZaIbada from "@/components/taarifa-za-ibada/taarifa-za-ibada";
export const metadata: Metadata = {
  title: "Taarifa za Ibada",
  description: "taarifa za ibada",
};

export default function Page() {
  return (
    <div className="space-y-6">
      
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Taarifa za Ibada" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <TaarifaZaIbada />
      </div>

    </div>
  );
}