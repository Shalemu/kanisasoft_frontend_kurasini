"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  Trash2,
  ArrowLeft,
  Pencil,
  User,
  Heart,
  GraduationCap,
  Church,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  getMembershipStatusLabel,
  isMarriedStatus,
  type MembershipStatusLabels,
} from "@/lib/memberLabels";

export default function UserDetailsClient({
  user,
  membershipStatusLabels,
}: {
  user: any;
  membershipStatusLabels?: MembershipStatusLabels | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Deactivate mshirika?",
      text: `Una uhakika unataka kumtoa ${user.full_name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ndiyo, deactivate",
      cancelButtonText: "Ghairi",
      confirmButtonColor: "#d97706",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);

      const memberId = user.member_id ?? user.id;

      await apiFetch(`/members/${memberId}/deactivate`, {
        method: "POST",
        body: { reason: "Deactivated by admin" },
      });

      await Swal.fire("Imefanikiwa", "Mshirika ameondolewa kwenye hali ya active.", "success");
      router.push("/washirika");
      router.refresh();
    } catch (err) {
      console.error(err);
      await Swal.fire(
        "Hitilafu",
        err instanceof Error ? err.message : "Imeshindikana kumtoa mshirika.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 text-gray-800 dark:bg-gray-900 dark:text-white/90 md:p-8">

      {/* TOP BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition dark:text-gray-300 dark:hover:text-white"
        >
          <ArrowLeft size={18} />
          Rudi
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/washirika/ongeza-washirika?edit=${user.user_id ?? user.id}`)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-white shadow hover:bg-blue-700 transition"
          >
            <Pencil size={16} />
            Hariri
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-white shadow hover:bg-red-700 transition"
          >
            <Trash2 size={16} />
            {loading ? "Inaondoa..." : "Futa"}
          </button>
        </div>
      </div>

      {/* PROFILE HEADER */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 mb-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center gap-5">

          <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold dark:bg-blue-500/10 dark:text-blue-300">
            {user.full_name?.charAt(0)}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white/90">
              {user.full_name}
            </h1>

            <p className="text-gray-500 mt-1 dark:text-gray-400">
              {user.email || "Hakuna email"}
            </p>

            <div className="mt-3 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              {getMembershipStatusLabel(user.membership_status ?? "pending", membershipStatusLabels)}
            </div>
          </div>
        </div>
      </div>

      {/* PERSONAL INFO */}
      <Section
        title="Taarifa Binafsi"
        icon={<User size={18} />}
      >
        <Info label="Jina Kamili" value={user.full_name} />
        <Info label="Jinsia" value={user.gender} />
        <Info label="Tarehe ya Kuzaliwa" value={user.birth_date} />
        <Info label="Mahali pa Kuzaliwa" value={user.birth_place} />
        <Info label="Simu" value={user.phone_number} />
        <Info label="WhatsApp" value={user.whatsapp_number} />
        <Info label="Email" value={user.email} />
        <Info label="Zone" value={user.residential_zone} />
        <Info label="Mtaa" value={user.residential_street} />
        <Info label="Ward" value={user.residential_ward} />
      </Section>

      {/* FAMILY */}
      <Section
        title="Taarifa za Familia"
        icon={<Heart size={18} />}
      >
        <Info label="Hali ya ndoa" value={user.marital_status} />
        {isMarriedStatus(user.marital_status) ? (
          <>
            <Info label="Aina ya Ndoa" value={user.marriage_type} />
            <Info label="Jina la Mwenzi" value={user.spouse_name} />
          </>
        ) : null}
        <Info label="Idadi ya Watoto" value={user.number_of_children} />
        <Info
          label="Anaishi Peke Yake"
          value={user.lives_alone ? "Ndiyo" : "Hapana"}
        />
        <Info label="Anaishi na Nani" value={user.lives_with} />
      </Section>

      {/* ELIMU */}
      <Section
        title="Elimu & Kazi"
        icon={<GraduationCap size={18} />}
      >
        <Info label="Kiwango cha Elimu" value={user.education_level} />
        <Info label="Profession" value={user.profession} />
        <Info label="Kazi" value={user.occupation} />
        <Info label="Mahali pa Kazi" value={user.work_place} />
        <Info label="Mawasiliano ya Kazi" value={user.work_contact} />
      </Section>

      {/* IMANI */}
      <Section
        title="Taarifa za Kiroho"
        icon={<Church size={18} />}
      >
        <Info label="Tarehe ya Kuokoka" value={user.date_of_conversion} />
        <Info label="Kanisa Alilookoka" value={user.church_of_conversion} />
        <Info label="Tarehe ya Ubatizo" value={user.baptism_date} />
        <Info label="Mahali pa Ubatizo" value={user.baptism_place} />
        <Info label="Aliyembatiza" value={user.baptizer_name} />
        <Info label="Cheo cha Mbatizaji" value={user.baptizer_title} />
        <Info label="Kanisa la Zamani" value={user.previous_church} />
        <Info label="Huduma" value={user.church_service} />
        <Info label="Muda wa Huduma" value={user.service_duration} />
      </Section>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: any) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 mb-6 dark:border-gray-800 dark:bg-white/[0.03]">

      <div className="flex items-center gap-2 mb-5">
        <div className="text-blue-600">
          {icon}
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white/90">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

function Info({ label, value }: any) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {label}
      </p>

      <p className="mt-1 font-semibold text-gray-900 wrap-break-word dark:text-white/90">
        {value || "—"}
      </p>
    </div>
  );
}
