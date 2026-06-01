

import Waliokataliwa from "@/components/washirika/waliokataliwa/waliokataliwa";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Washirika Waliokataliwa",
  description:
    "Ukurasa wa Washirika Waliokataliwa",
       icons: {
    icon: "/logo.png",
  },
  // other metadata
};
export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Washirika Waliokataliwa" />
      <Waliokataliwa />
    </div>
  );
}
