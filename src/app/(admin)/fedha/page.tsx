import FedhaPage from "@/components/fedha/FedhaPage";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React, { Suspense } from "react";

export const metadata: Metadata = {
  title: "Fedha",
  description: "Usimamizi wa Fedha za Kanisa — Sadaka, Zaka, Michango na Ankara",
  icons: {
    icon: "/logo.png",
  },
};

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Fedha" />
      <Suspense fallback={<div className="p-6">Inapakia...</div>}>
        <FedhaPage />
      </Suspense>
    </div>
  );
}
