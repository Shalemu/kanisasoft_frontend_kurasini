"use client";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { markSessionActivity } from "@/lib/session";

export default function SignInForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "warning" | "">("");

  const showMessage = (msg: string, type: "error" | "success" | "warning" = "error") => {
    setMessage(msg);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!login || !password) {
      showMessage("Tafadhali jaza taarifa zote.", "warning");
      return;
    }

    setLoading(true);
    showMessage("Inajaribu kuingia...", "warning");

    try {
      const data = await apiFetch("/login", {
        method: "POST",
        body: {
          login,
          password,
        },
        throwOnError: false,
      });

      if (data?.ok === false) {
        showMessage(
          data?.message || "Email/Simu au neno la siri si sahihi",
          "error"
        );
        return;
      }

      const { token, user } = data;

      if (!token) {
        showMessage("Token haijapatikana.", "error");
        return;
      }

      if (!user) {
        showMessage("User data haijapatikana.", "error");
        return;
      }

      if (!user.role) {
        showMessage(data.message || "Huna ruhusa ya kuingia mfumo.", "warning");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      markSessionActivity();

      if (isChecked) {
        localStorage.setItem("keep_logged_in", "true");
      } else {
        localStorage.removeItem("keep_logged_in");
      }

      showMessage("Umeingia kikamilifu.", "success");

      setTimeout(() => {
        router.push("/dashboard");
      }, 300);

    } catch (err: unknown) {
      console.error("Unexpected login error:", err);
      showMessage(
        err instanceof Error ? err.message : "Tatizo la mfumo. Jaribu tena.",
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

            <h1 className="text-2xl font-bold">Ingia Kwenye Mfumo</h1>
            <p className="text-sm text-gray-300 mt-1">
              Karibu katika mfumo wa taarifa za kanisa
            </p>
          </div>

          {/* MESSAGE BOX */}
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm border ${
              messageType === "error"
                ? "bg-red-500/10 text-red-300 border-red-500/30"
                : messageType === "success"
                ? "bg-green-500/10 text-green-300 border-green-500/30"
                : "bg-yellow-500/10 text-yellow-300 border-yellow-500/30"
            }`}>
              {message}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* LOGIN */}
            <div>
              <Label>
                <span className="text-white">Email / Simu *</span>
              </Label>

              <Input
                type="text"
                placeholder="Email au namba ya simu"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <Label>
                <span className="text-white">Neno la Siri *</span>
              </Label>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingiza neno la siri"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />

                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-300" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-300" />
                  )}
                </span>
              </div>
            </div>

            {/* OPTIONS */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <Checkbox checked={isChecked} onChange={setIsChecked} />
                Nikumbuke
              </label>

              <Link href="/forget-password" className="text-sm text-[#f0ce32] hover:underline">
                Umesahau neno la siri?
              </Link>
            </div>

            {/* BUTTON */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f0ce32] text-black font-bold hover:scale-105 transition-all duration-300"
            >
              {loading ? "Inapakia..." : "INGIA KWENYE MFUMO"}
            </Button>

          </form>

          {/* FOOTER */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-300">
              Huna akaunti?{" "}
              <Link href="/register" className="text-[#f0ce32] underline">
                Jisajili hapa
              </Link>
            </p>
            <Link href="/" className="text-sm font-medium text-[#f0ce32] hover:underline">
              ← Rudi Nyumbani
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
