"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import InputField from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { apiFetch } from "@/lib/api";
import {
  FaPhone,
  FaWhatsapp,
  FaEnvelope,
  FaHeadset,
  FaPaperPlane,
  FaCheckCircle,
} from "react-icons/fa";
import Swal from "sweetalert2";

const ADMIN_ROLES = ["admin", "super_admin", "mchungaji"];

const DEPARTMENTS = [
  { value: "billing", label: "Billing" },
  { value: "support", label: "Support" },
];

export default function PataUsaidiziPage() {
  const router = useRouter();
  const user = useAuthUser();
  const isAdmin = ADMIN_ROLES.includes(String(user?.role ?? "").toLowerCase());

  const [department, setDepartment] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Redirect non-admin users away from this page
  useEffect(() => {
    if (user && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [user, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!department) {
      Swal.fire("Tafadhali", "Chagua idara unayotaka kuwasiliana nayo.", "warning");
      return;
    }
    if (!message.trim()) {
      Swal.fire("Tafadhali", "Andika ujumbe wako.", "warning");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/support-tickets", {
        method: "POST",
        body: {
          name: user?.full_name,
          phone: user?.phone,
          email: user?.email,
          church: user?.church || user?.church_name,
          department,
          message: message.trim(),
        },
      });
      setSubmitted(true);
      setMessage("");
      setDepartment("");
    } catch (err: any) {
      Swal.fire(
        "Hitilafu",
        err?.message || "Imeshindwa kutuma ujumbe. Jaribu tena.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center text-gray-500">Inapakia...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Pata Usaidizi" />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Contact cards */}
        <div className="xl:col-span-1 space-y-4">
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#1e293b] text-white flex items-center justify-center">
                <FaHeadset />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Mawasiliano
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Wasiliana na timu ya KanisaSoft kwa msaada wa kiufundi, malipo,
              au masuala mengine yoyote.
            </p>

            <div className="space-y-4">
              <a
                href="tel:+255760900500"
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#f0ce32] text-[#1e293b] flex items-center justify-center shrink-0">
                  <FaPhone />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Namba ya Simu</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    0760 900 500
                  </p>
                </div>
              </a>

              <a
                href="https://wa.me/255760900500"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
                  <FaWhatsapp />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">WhatsApp</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    0760 900 500
                  </p>
                </div>
              </a>

              <a
                href="mailto:support@kanisasoft.co.tz"
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#1e293b] text-white flex items-center justify-center shrink-0">
                  <FaEnvelope />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    support@kanisasoft.co.tz
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Support form */}
        <div className="xl:col-span-2">
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
              Tuma Ujumbe
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Jaza fomu hapa chini na tutakujibu haraka iwezekanavyo.
            </p>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl mb-4">
                  <FaCheckCircle />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Ujumbe Umetumwa
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mb-6">
                  Asante kwa kuwasiliana nasi. Timu yetu itakujibu kwa njia ya
                  email au simu.
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  variant="custom"
                  className="bg-[#1e293b] hover:bg-[#334155] text-white"
                >
                  Tuma Ujumbe Mwingine
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
                      Jina
                    </label>
                    <InputField
                      value={user?.full_name ?? ""}
                      disabled
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
                      Simu
                    </label>
                    <InputField
                      value={user?.phone ?? ""}
                      disabled
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
                      Email
                    </label>
                    <InputField
                      type="email"
                      value={user?.email ?? ""}
                      disabled
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
                      Kanisa
                    </label>
                    <InputField
                      value={user?.church || user?.church_name || "—"}
                      disabled
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                </div>

                <Select
                  label="Chagua Idara"
                  name="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  options={DEPARTMENTS}
                  placeholder="-- Chagua idara --"
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
                    Ujumbe
                  </label>
                  <TextArea
                    name="message"
                    placeholder="Andika ujumbe wako hapa..."
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="custom"
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-[#1e293b] hover:bg-[#334155] text-white"
                  >
                    {loading ? "Inatuma..." : <><FaPaperPlane /> Tuma Ujumbe</>}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
