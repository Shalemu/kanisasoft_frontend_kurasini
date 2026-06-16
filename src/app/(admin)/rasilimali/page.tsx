import Rasilimali from "@/components/rasilimali/Rasilimali";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React, { Suspense } from "react";

export const metadata: Metadata = {
  title: "Rasilimali",
  description: "Ukurasa wa Rasilimali - Documents na Viungo Muhimu",
  icons: {
    icon: "/logo.png",
  },
};

export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Rasilimali" />
      <Suspense fallback={<div className="p-6">Inapakia...</div>}>
        <Rasilimali />
      </Suspense>
    </div>
  );
}
