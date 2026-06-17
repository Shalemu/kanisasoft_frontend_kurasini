import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FedhaRipoti from "@/components/fedha/FedhaRipoti";

export const metadata: Metadata = {
  title: "Ripoti ya Fedha",
  description: "Ripoti na chati za fedha za kanisa",
  icons: {
    icon: "/logo.png",
  },
};

export default function Page() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Ripoti ya Fedha" />
      <div className="max-w-7xl mx-auto">
        <FedhaRipoti />
      </div>
    </div>
  );
}
