import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Form ya usajili | KanisaSoft Demo",
  description: "Usajili wa washirika",
  icons: {
    icon: "/logo.png",
  },
};

export default function SignUpn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}