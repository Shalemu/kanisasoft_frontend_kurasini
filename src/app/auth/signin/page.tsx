import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | KanisaSoft ",
  description: "Sign in to your KanisaSoft account",
     icons: {
    icon: "/logo.png",
  },
};

export default function SignIn() {
  return <SignInForm />;
}
