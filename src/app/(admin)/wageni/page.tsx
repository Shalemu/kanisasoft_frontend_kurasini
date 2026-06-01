import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Wageni from "@/components/wageni/wageni";

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
      <PageBreadcrumb pageTitle="Tazama Wageni" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <Wageni />
      </div>

    </div>
  );
}