"use client";

import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Swal from "sweetalert2";
import { apiFetch } from "@/lib/api";

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();

  const [member, setMember] = useState<any>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await apiFetch("/mtumiaji");

        if (res?.member) {
          const m = res.member;
          const names = (m.full_name || "").split(" ");

          setMember(m);
          setForm({
            first_name: names[0] || "",
            last_name: names.slice(1).join(" ") || "",
            email: m.email || "",
            phone_number: m.phone_number || "",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const res = await apiFetch("/user/update-profile", {
        method: "POST",
        body: JSON.stringify({
          full_name: `${form.first_name} ${form.last_name}`.trim(),
          email: form.email,
          phone_number: form.phone_number,
        }),
      });

      if (res.status === "success") {
        Swal.fire("Imefanikiwa", "Taarifa zimehifadhiwa", "success");

        setMember((prev: any) => ({
          ...prev,
          full_name: `${form.first_name} ${form.last_name}`.trim(),
          email: form.email,
          phone_number: form.phone_number,
        }));

        closeModal();
      }
    } catch {
      Swal.fire("Error", "Imeshindikana kuhifadhi", "error");
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Inapakia...</div>;
  }

  return (
    <>
      {/* CARD */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

          {/* INFO */}
          <div className="w-full">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Personal Information
            </h4>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-7">

              <div>
                <p className="text-xs text-gray-500 mb-1">First Name</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {form.first_name || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Last Name</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {form.last_name || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {form.email || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Phone</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {form.phone_number || "—"}
                </p>
              </div>

              {/* EXTRA INFO (optional enrichment) */}
              {member?.role && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Role</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {member.role}
                  </p>
                </div>
              )}

              {member?.status && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {member.status}
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* EDIT BUTTON (ORIGINAL STYLE ICON BUTTON) */}
          <button
            onClick={openModal}
            className="flex w-full lg:w-auto items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206Z"
              />
            </svg>
            Edit
          </button>

        </div>
      </div>

      {/* MODAL */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[650px] m-4">
        <div className="w-full rounded-3xl bg-white dark:bg-gray-900 p-6 lg:p-10">

          {/* HEADER */}
          <div className="mb-6">
            <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Update your profile details
            </p>
          </div>

          {/* FORM */}
          <div className="grid grid-cols-1 gap-5">

            <div>
              <Label>First Name</Label>
              <Input
                value={form.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
              />
            </div>

            <div>
              <Label>Last Name</Label>
              <Input
                value={form.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone_number}
                onChange={(e) => handleChange("phone_number", e.target.value)}
              />
            </div>

          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 mt-8">
            <Button variant="outline" onClick={closeModal}>
              Close
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>

        </div>
      </Modal>
    </>
  );
}