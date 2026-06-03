import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | KanisaSoft",
  description: "",
     icons: {
    icon: "/logo.png",
  },
};

export default function SignIn() {
  return <SignInForm />;
}
