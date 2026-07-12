
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Utoaji from "@/components/utoaji";
import { Metadata } from "next";
import React, { Suspense } from "react";

export const metadata: Metadata = {
  title: "Utoaji",
  description: "Ukurasa wa Utoaji - Documents na Viungo Muhimu",
  icons: {
    icon: "/logo.png",
  },
};

export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Utoaji" />
      <Suspense fallback={<div className="p-6">Inapakia...</div>}>
        <Utoaji />
      </Suspense>
    </div>
  );
}
