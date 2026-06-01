'use client';

import { useRouter } from 'next/navigation';
import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Makundi from "@/components/makundi/makundi";

export default function Page() {
  const router = useRouter();

  return (
    <div className="space-y-6">

      <PageBreadcrumb pageTitle="Makundi ya Kanisa" />

      <div className="max-w-7xl mx-auto">
        <Makundi
          onGroupSelect={(id) => {
            router.push(`/makundi/${id}`);
          }}
        />
      </div>

    </div>
  );
}