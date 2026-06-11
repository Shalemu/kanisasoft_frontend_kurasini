"use client";

import { useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

export default function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    console.log({ oldPassword, newPassword });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-[400px]">
        <h2 className="text-lg font-bold mb-4">Change Password</h2>

        <div className="space-y-3">
          <div>
            <Label>Old Password</Label>
            <Input type="password" onChange={(e) => setOldPassword(e.target.value)} />
          </div>

          <div>
            <Label>New Password</Label>
            <Input type="password" onChange={(e) => setNewPassword(e.target.value)} />
          </div>

          <div>
            <Label>Confirm Password</Label>
            <Input type="password" onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Save
          </Button>

          <Button onClick={onClose} variant="outline" className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}