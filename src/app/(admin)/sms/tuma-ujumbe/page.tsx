import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TumaUjumbe from "@/components/sms/tuma-ujumbe";

export const metadata: Metadata = {
  title: "Tuma SMS",
  description: "Sehemu ya SMS",
  icons: {
    icon: "/logo.png",
  },
};

export default function Page() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Tuma SMS" />

      <div className="mx-auto max-w-7xl">
        <TumaUjumbe />
      </div>
    </div>
  );
}