"use client";

import React, { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Swal from "sweetalert2";
import { apiFetch } from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";

const PASSWORD_RULE_MESSAGE =
  "Password mpya lazima iwe na angalau herufi 6, ikijumuisha herufi, namba na alama maalum.";

function isStrongPassword(password: string) {
  return (
    password.length >= 6 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function getChangePasswordErrorMessage(error: any) {
  const backendMessage =
    error?.response?.data?.message ||
    error?.message ||
    "Server error imetokea";

  const normalizedMessage = String(backendMessage).toLowerCase();

  if (
    normalizedMessage.includes("password ya sasa si sahihi") ||
    normalizedMessage.includes("current password") ||
    normalizedMessage.includes("old password")
  ) {
    return "Password ya sasa si sahihi. Tafadhali ingiza password yako ya sasa kwa usahihi.";
  }

  return backendMessage;
}

export default function ChangePasswordPage() {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleVisibility = (key: keyof typeof show) => {
    setShow((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = async () => {
    if (loading) {
      return;
    }

    // Required fields
    if (!form.current_password.trim()) {
      Swal.fire("Tahadhari", "Tafadhali ingiza password ya sasa", "warning");
      return;
    }

    if (!form.new_password.trim()) {
      Swal.fire("Tahadhari", "Tafadhali ingiza password mpya", "warning");
      return;
    }

    if (!form.confirm_password.trim()) {
      Swal.fire("Tahadhari", "Tafadhali thibitisha password mpya", "warning");
      return;
    }

    // Password strength
    if (!isStrongPassword(form.new_password)) {
      Swal.fire("Tahadhari", PASSWORD_RULE_MESSAGE, "warning");
      return;
    }

    // Same password check
    if (form.current_password === form.new_password) {
      Swal.fire(
        "Tahadhari",
        "Password mpya haiwezi kufanana na password ya sasa",
        "warning"
      );
      return;
    }

    // Confirm password check
    if (form.new_password !== form.confirm_password) {
      Swal.fire("Hitilafu", "Nywila hazifanani", "error");
      return;
    }

    try {
      setLoading(true);

      const res = await apiFetch("/user/change-password", {
        method: "POST",
        body: JSON.stringify({
          current_password: form.current_password,
          new_password: form.new_password,
          new_password_confirmation: form.confirm_password,
        }),
      });

      await Swal.fire(
        "Mafanikio",
        res?.message ||
          "Password imebadilishwa kikamilifu. Tafadhali ingia tena.",
        "success"
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";

      return;
    } catch (err: any) {
      Swal.fire("Hitilafu", getChangePasswordErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-6 lg:p-10">
      <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 lg:p-10 bg-white dark:bg-gray-900">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Badilisha Password
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Sasisha password yako kwa usalama wa akaunti yako
        </p>

        <div className="mt-6 space-y-5">
          <PasswordInput
            label="Password ya Sasa"
            value={form.current_password}
            placeholder="Ingiza password yako ya sasa"
            show={show.current}
            onToggle={() => toggleVisibility("current")}
            onChange={(val) => handleChange("current_password", val)}
          />

          <PasswordInput
            label="Password Mpya"
            value={form.new_password}
            placeholder="Weka password mpya yenye nguvu"
            show={show.new}
            onToggle={() => toggleVisibility("new")}
            onChange={(val) => handleChange("new_password", val)}
          />

          <PasswordInput
            label="Thibitisha Password"
            value={form.confirm_password}
            placeholder="Rudia password mpya"
            show={show.confirm}
            onToggle={() => toggleVisibility("confirm")}
            onChange={(val) => handleChange("confirm_password", val)}
          />

          <div className="flex justify-end">
            <Button
              variant="custom"
              className="bg-[#1e293b] hover:bg-[#0f172a] text-white"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Inasasisha..." : "Sasisha Password"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

type PasswordInputProps = {
  label: string;
  value: string;
  placeholder: string;
  show: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
};

function PasswordInput({
  label,
  value,
  placeholder,
  show,
  onToggle,
  onChange,
}: PasswordInputProps) {
  return (
    <div>
      <Label>{label}</Label>

      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          onChange={(e: any) => onChange(e.target.value)}
          className="pr-10"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-white"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
