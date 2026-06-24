import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EventsReport from "@/components/matukio/EventsReport";

export const metadata: Metadata = {
  title: "Ripoti ya Matangazo & Matukio",
  description: "Takwimu na ripoti za matangazo na matukio",
  icons: {
    icon: "/logo.png",
  },
};

export default function Page() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Ripoti ya Matangazo & Matukio" />

      <div className="mx-auto max-w-7xl">
        <EventsReport />
      </div>
    </div>
  );
}
