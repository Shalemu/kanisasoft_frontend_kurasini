import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Michango from "@/components/fedha/Michango";

export const metadata: Metadata = {
  title: "Michango",
  description: "Rekodi na ripoti za michango ya kanisa",
  icons: {
    icon: "/logo.png",
  },
};

export default function Page() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Michango" />
      <Michango />
    </div>
  );
}
