import PasswordReset from "@/components/password-reset/password-reset";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Next.js SignIn Page | KanisaSoft Demo",
  description: "",
  icons: {
    icon: "/logo.png",
  },
};

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PasswordReset />
    </Suspense>
  );
}