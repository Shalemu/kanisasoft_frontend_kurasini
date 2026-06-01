import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RipotzaIbada from "@/components/taarifa-za-ibada/ripotza-ibada";
export const metadata: Metadata = {
  title: "Taarifa za Ibada",
  description: "taarifa za ibada",
     icons: {
    icon: "/logo.png",
  },
};

export default function Page() {
  return (
    <div className="space-y-6">
      
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Taarifa za Ibada" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <RipotzaIbada />
      </div>

    </div>
  );
}