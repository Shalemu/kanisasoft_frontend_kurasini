

import Washirika from "@/components/washirika/all/washirika";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Ukurasa wa Washirika",
  description:
    "Ukurasa wa Washirika",
       icons: {
    icon: "/logo.png",
  },
  // other metadata
};
export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Washirika" />
      <Washirika />
    </div>
  );
}
