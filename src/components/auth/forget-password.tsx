"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import React, { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "error" | "success" | "warning" | ""
  >("");

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      showMessage("Tafadhali ingiza email yako.", "warning");
      return;
    }

    setLoading(true);
    showMessage("Inatuma ombi...", "warning");

    try {
      const data = await apiFetch("/forgot-password", {
        method: "POST",
        body: { email },
      });

      console.log("FORGOT PASSWORD RESPONSE:", data);

      showMessage(
        data.message ||
          "Kiungo cha kubadilisha nenosiri kimepeanwa kwenye email yako.",
        "success"
      );
    } catch (err: any) {
      console.error("FORGOT PASSWORD ERROR:", err);

      showMessage(
        err.message ||
          "Imeshindikana kutuma kiungo cha kubadilisha nenosiri.",
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
              Umesahau Neno la Siri?
            </h1>

            <p className="text-sm text-gray-300 mt-1">
              Ingiza email yako ili utumiwe kiungo cha kubadilisha nenosiri
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
          <form onSubmit={handleForgotPassword} className="space-y-5">

            {/* EMAIL */}
            <div>
              <Label>
                <span className="text-white">Email *</span>
              </Label>

              <Input
                type="email"
                placeholder="Ingiza email yako"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>

            {/* BUTTON */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f0ce32] text-black font-bold hover:scale-105 transition-all duration-300"
            >
              {loading
                ? "Inapakia..."
                : "TUMA KIUNGO CHA KUBADILISHA"}
            </Button>
          </form>

          {/* FOOTER */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-300">
              Umejikumbuka nenosiri?{" "}
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