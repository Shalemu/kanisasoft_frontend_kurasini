

import Waliopotea from "@/components/washirika/waliopotea/waliopotea";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Waliopoteza ushirika",
  description:
    "Ukurasa wa Waliopoteza ushirika",
       icons: {
    icon: "/logo.png",
  },
  // other metadata
};
export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Waliopoteza ushirika" />
      <Waliopotea />
    </div>
  );
}
