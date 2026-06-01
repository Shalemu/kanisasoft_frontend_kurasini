"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";

import { apiFetch } from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "error" | "success" | "warning" | ""
  >("");

  useEffect(() => {
    setEmail(searchParams.get("email") || "");
  }, [searchParams]);

  const showMessage = (
    msg: string,
    type: "error" | "success" | "warning" = "error"
  ) => {
    setMessage(msg);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !passwordConfirmation) {
      showMessage("Jaza neno la siri na uthibitisho.", "warning");
      return;
    }

    if (password !== passwordConfirmation) {
      showMessage("Manenosiri hayalingani.", "error");
      return;
    }

    setLoading(true);
    showMessage("Inabadilisha nenosiri...", "warning");

    try {
      const data = await apiFetch("/reset-password", {
        method: "POST",
        body: {
          email,
          password,
          password_confirmation: passwordConfirmation,
        },
      });

      console.log("RESET PASSWORD RESPONSE:", data);

      showMessage(
        data.message || "Nenosiri limebadilishwa kwa mafanikio.",
        "success"
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      console.error("RESET PASSWORD ERROR:", err);

      showMessage(
        err.message || "Tatizo la mfumo. Jaribu tena.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#130728] via-[#211a45] to-[#253266] px-4">
      <div className="w-full max-w-md">

        {/* CARD */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 text-white">

          {/* HEADER */}
          <div className="text-center mb-6">
            <div className="inline-block bg-[#f0ce32] px-4 py-2 rounded-full mb-3">
              <span className="text-black font-bold">KanisaSoft</span>
            </div>

            <h1 className="text-2xl font-bold">
              Badilisha Neno la Siri
            </h1>

            <p className="text-sm text-gray-300 mt-1">
              Ingiza neno jipya la siri kwa akaunti yako
            </p>
          </div>

          {/* MESSAGE BOX */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm border ${
                messageType === "error"
                  ? "bg-red-500/10 text-red-300 border-red-500/30"
                  : messageType === "success"
                  ? "bg-green-500/10 text-green-300 border-green-500/30"
                  : "bg-yellow-500/10 text-yellow-300 border-yellow-500/30"
              }`}
            >
              {message}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleResetPassword} className="space-y-5">

            {/* EMAIL */}
            <div>
              <Label>
                <span className="text-white">Email</span>
              </Label>

              <Input
                type="email"
                value={email}
                disabled
                className="bg-white/10 border-white/20 text-gray-300"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <Label>
                <span className="text-white">Neno Jipya la Siri *</span>
              </Label>

              <Input
                type="password"
                placeholder="Ingiza neno jipya la siri"
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <Label>
                <span className="text-white">
                  Thibitisha Neno la Siri *
                </span>
              </Label>

              <Input
                type="password"
                placeholder="Rudia neno jipya la siri"
                value={passwordConfirmation}
                onChange={(e: any) =>
                  setPasswordConfirmation(e.target.value)
                }
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>

            {/* BUTTON */}
            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-[#f0ce32] text-black font-bold hover:scale-105 transition-all duration-300"
            >
              {loading
                ? "Inapakia..."
                : "BADILISHA NENO LA SIRI"}
            </Button>
          </form>

          {/* FOOTER */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-300">
              Unakumbuka nenosiri?{" "}
              <Link
                href="/login"
                className="text-[#f0ce32] underline"
              >
                Rudi kuingia
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}