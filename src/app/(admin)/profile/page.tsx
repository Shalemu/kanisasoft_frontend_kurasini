import AdminProfilePage from "@/components/user-profile/AdminProfilePage";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Profile ya Mshirika",
  description:
    "Profile",
       icons: {
    icon: "/logo.png",
  },
};

export default function Profile() {
  return (
    <AdminProfilePage />
  );
}
