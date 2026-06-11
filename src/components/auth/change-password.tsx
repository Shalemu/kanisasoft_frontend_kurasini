"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";

import { apiFetch } from "@/lib/api";

export default function ChangePasswordPage() {
const router = useRouter();

const [currentPassword, setCurrentPassword] = useState("");
const [password, setPassword] = useState("");
const [passwordConfirmation, setPasswordConfirmation] = useState("");

const [loading, setLoading] = useState(false);

const [message, setMessage] = useState("");
const [messageType, setMessageType] = useState<
"error" | "success" | "warning" | ""

> ("");

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

const handleChangePassword = async (
e: React.FormEvent
) => {
e.preventDefault();


if (
  !currentPassword ||
  !password ||
  !passwordConfirmation
) {
  showMessage(
    "Tafadhali jaza taarifa zote.",
    "warning"
  );
  return;
}

if (password.length < 8) {
  showMessage(
    "Nenosiri jipya lazima liwe na angalau herufi 8.",
    "warning"
  );
  return;
}

if (password !== passwordConfirmation) {
  showMessage(
    "Manenosiri mapya hayalingani.",
    "error"
  );
  return;
}

setLoading(true);

try {
  const data = await apiFetch("/change-password", {
    method: "POST",
    body: {
      current_password: currentPassword,
      password,
      password_confirmation: passwordConfirmation,
    },
  });

  showMessage(
    data.message ||
      "Nenosiri limebadilishwa kwa mafanikio.",
    "success"
  );

  setCurrentPassword("");
  setPassword("");
  setPasswordConfirmation("");

  setTimeout(() => {
    router.push("/profile");
  }, 1500);
} catch (err: any) {
  showMessage(
    err.message ||
      "Imeshindikana kubadilisha nenosiri.",
    "error"
  );
} finally {
  setLoading(false);
}


};

return ( <div className="max-w-2xl mx-auto p-6"> <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6"> <h1 className="text-2xl font-bold mb-2">
Badilisha Nenosiri </h1>


    <p className="text-gray-500 mb-6">
      Weka nenosiri lako la sasa na
      nenosiri jipya.
    </p>

    {message && (
      <div
        className={`mb-4 p-3 rounded-lg text-sm ${
          messageType === "error"
            ? "bg-red-100 text-red-700"
            : messageType === "success"
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {message}
      </div>
    )}

    <form
      onSubmit={handleChangePassword}
      className="space-y-5"
    >
      <div>
        <Label>Nenosiri la Sasa *</Label>
        <Input
          type="password"
          value={currentPassword}
          onChange={(e: any) =>
            setCurrentPassword(e.target.value)
          }
          placeholder="Ingiza nenosiri la sasa"
        />
      </div>

      <div>
        <Label>Nenosiri Jipya *</Label>
        <Input
          type="password"
          value={password}
          onChange={(e: any) =>
            setPassword(e.target.value)
          }
          placeholder="Ingiza nenosiri jipya"
        />
      </div>

      <div>
        <Label>Thibitisha Nenosiri Jipya *</Label>
        <Input
          type="password"
          value={passwordConfirmation}
          onChange={(e: any) =>
            setPasswordConfirmation(e.target.value)
          }
          placeholder="Rudia nenosiri jipya"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading
          ? "Inabadilisha..."
          : "Badilisha Nenosiri"}
      </Button>
    </form>
  </div>
</div>


);
}
