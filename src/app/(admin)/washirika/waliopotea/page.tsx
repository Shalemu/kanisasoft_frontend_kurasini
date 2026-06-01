

import Waliopotea from "@/components/washirika/waliopotea/waliopotea";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Washirika Waliopotea",
  description:
    "Ukurasa wa Washirika Waliopotea",
       icons: {
    icon: "/logo.png",
  },
  // other metadata
};
export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Washirika Waliopotea" />
      <Waliopotea />
    </div>
  );
}
