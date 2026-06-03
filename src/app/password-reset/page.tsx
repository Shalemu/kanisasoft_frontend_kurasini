import PasswordReset from "@/components/password-reset/password-reset";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Reset Password | KanisaSoft Demo",
  description: "Reset your password with KanisaSoft ",
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