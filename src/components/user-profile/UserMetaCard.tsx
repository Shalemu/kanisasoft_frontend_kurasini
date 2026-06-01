"use client";

import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Image from "next/image";
import { apiFetch } from "@/lib/api";

type Member = {
  full_name?: string;
  email?: string;
  phone_number?: string;
  residential_zone?: string;
};

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();

  const [member, setMember] = useState<Member | null>(null);

  const [form, setForm] = useState<Member>({
    full_name: "",
    email: "",
    phone_number: "",
    residential_zone: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiFetch("/mtumiaji");

        if (data?.status === "success") {
          const m = data.member;

          setMember(m);
          setForm({
            full_name: m?.full_name || "",
            email: m?.email || "",
            phone_number: m?.phone_number || "",
            residential_zone: m?.residential_zone || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      const res = await apiFetch("/user/update-profile", {
        method: "POST",
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          phone_number: form.phone_number,
          residential_zone: form.residential_zone,
        }),
      });

      if (res.status === "success") {
        setMember(form);
        closeModal();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* CARD */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

          {/* PROFILE SECTION */}
          <div className="flex items-center gap-5">

            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-700">
              <Image
                width={80}
                height={80}
                src="/images/user/owner.jpg"
                alt="user"
              />
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {member?.full_name || "—"}
              </h4>

              <p className="text-sm text-gray-500">
                {member?.email || "—"}
              </p>

              <p className="text-sm text-gray-500">
                {member?.residential_zone || "—"}
              </p>
            </div>
          </div>

          {/* EDIT BUTTON (ORIGINAL STYLE) */}
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700 dark:text-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206Z" />
            </svg>
            Edit
          </button>

        </div>
      </div>

      {/* MODAL */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] m-4">
        <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl">

          <h4 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white/90">
            Edit Profile
          </h4>

          <div className="grid gap-4">

            <div>
              <Label>Full Name</Label>
              <Input
                name="full_name"
                value={form.full_name || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                name="email"
                value={form.email || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                name="phone_number"
                value={form.phone_number || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Zone</Label>
              <Input
                name="residential_zone"
                value={form.residential_zone || ""}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={closeModal}>
              Cancel
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