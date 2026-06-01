import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SmsZilizotumwa from "@/components/sms/sms-zilizotumwa";

export const metadata: Metadata = {
  title: "Tazama SMS",
  description: "Sehemu ya SMS",
  icons: {
    icon: "/logo.png",
  },
};

export default function Page() {
  return (
    <div className="space-y-6">

      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Tazama SMS" />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl">
        <SmsZilizotumwa />
      </div>

    </div>
  );
}