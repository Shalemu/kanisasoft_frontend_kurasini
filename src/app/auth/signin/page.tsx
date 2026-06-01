import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "N",
  description: "",
     icons: {
    icon: "/logo.png",
  },
};

export default function SignIn() {
  return <SignInForm />;
}
