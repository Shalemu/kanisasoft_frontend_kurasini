import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OngezaWashirika from "@/components/washirika/ongeza-washirika/ongeza-washirika";

export const metadata: Metadata = {
  title: "Ongeza Washirika",
  description: "Fomu ya kuongeza washirika wapya",
     icons: {
    icon: "/logo.png",
  },
};

export default function Page() {
  return (
    <div className="space-y-6">
      
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Ongeza Washirika" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <OngezaWashirika />
      </div>

    </div>
  );
}