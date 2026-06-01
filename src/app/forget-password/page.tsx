import ForgetPassword from "@/components/auth/forget-password";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "N",
  description: "",
     icons: {
    icon: "/logo.png",
  },
};

export default function ForegetPassword() {
  return <ForgetPassword />;
}
