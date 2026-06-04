"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useWashirikaExport } from "@/hooks/useWashirikaExport";

interface Member {
  id: number; full_name: string; membership_number?: string | null; phone?: string | null;
  email?: string | null; gender?: string | null; birth_date?: string | null;
  marital_status?: string | null; education_level?: string | null;
  residential_zone?: string | null; membership_status?: string | null; created_at?: string;
}

const months = ["Januari", "Februari", "Machi", "Aprili", "Mei", "Juni", "Julai", "Agosti", "Septemba", "Oktoba", "Novemba", "Desemba"];

export default function MemberReports() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ maritalStatus: "", educationLevel: "", birthMonth: "", gender: "", zone: "", membershipStatus: "" });
  const { exportToExcel, exportToPDF } = useWashirikaExport();

  useEffect(() => {
    async function loadMembers() {
      try {
        const response = await apiFetch("/users");
        const users = response?.users ?? response?.data?.users ?? [];
        setMembers(users.filter((user: Member & { role?: string }) => user.role !== "mchungaji"));
      } finally { setLoading(false); }
    }
    void loadMembers();
  }, []);

  const options = (key: keyof Member) => Array.from(new Set(members.map((member) => member[key]).filter(Boolean) as string[])).sort();
  const filteredMembers = useMemo(() => members.filter((member) => {
    const birthMonth = member.birth_date ? String(new Date(member.birth_date).getMonth() + 1) : "";
    return (!filters.maritalStatus || member.marital_status === filters.maritalStatus) &&
      (!filters.educationLevel || member.education_level === filters.educationLevel) &&
      (!filters.birthMonth || birthMonth === filters.birthMonth) &&
      (!filters.gender || member.gender === filters.gender) &&
      (!filters.zone || member.residential_zone === filters.zone) &&
      (!filters.membershipStatus || member.membership_status === filters.membershipStatus);
  }), [filters, members]);
  const selectClass = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div><h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Ripoti za Washirika</h2><p className="text-sm text-gray-500">Chuja taarifa kisha pakua matokeo yaliyochujwa pekee.</p></div>
          <div className="flex gap-2"><button onClick={() => exportToExcel(filteredMembers, "ripoti-washirika")} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white">Pakua Excel</button><button onClick={() => exportToPDF(filteredMembers, "ripoti-washirika")} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white">Pakua PDF</button></div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <select className={selectClass} value={filters.maritalStatus} onChange={(e) => setFilters({ ...filters, maritalStatus: e.target.value })}><option value="">Hali zote za ndoa</option>{options("marital_status").map((value) => <option key={value}>{value}</option>)}</select>
          <select className={selectClass} value={filters.educationLevel} onChange={(e) => setFilters({ ...filters, educationLevel: e.target.value })}><option value="">Elimu zote</option>{options("education_level").map((value) => <option key={value}>{value}</option>)}</select>
          <select className={selectClass} value={filters.birthMonth} onChange={(e) => setFilters({ ...filters, birthMonth: e.target.value })}><option value="">Miezi yote ya kuzaliwa</option>{months.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select>
          <select className={selectClass} value={filters.gender} onChange={(e) => setFilters({ ...filters, gender: e.target.value })}><option value="">Jinsia zote</option>{options("gender").map((value) => <option key={value}>{value}</option>)}</select>
          <select className={selectClass} value={filters.zone} onChange={(e) => setFilters({ ...filters, zone: e.target.value })}><option value="">Zone zote</option>{options("residential_zone").map((value) => <option key={value}>{value}</option>)}</select>
          <select className={selectClass} value={filters.membershipStatus} onChange={(e) => setFilters({ ...filters, membershipStatus: e.target.value })}><option value="">Status zote</option>{options("membership_status").map((value) => <option key={value}>{value}</option>)}</select>
        </div>
        <div className="mt-4 flex items-center justify-between"><p className="text-sm font-medium text-gray-600 dark:text-gray-300">Matokeo: {loading ? "..." : filteredMembers.length}</p><button onClick={() => setFilters({ maritalStatus: "", educationLevel: "", birthMonth: "", gender: "", zone: "", membershipStatus: "" })} className="text-sm font-medium text-blue-600 hover:underline">Ondoa vichujio</button></div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-sm"><thead className="bg-[#1e293b] text-white"><tr><th className="px-4 py-3 text-left">#</th><th className="px-4 py-3 text-left">Namba</th><th className="px-4 py-3 text-left">Jina</th><th className="px-4 py-3 text-left">Jinsia</th><th className="px-4 py-3 text-left">Ndoa</th><th className="px-4 py-3 text-left">Elimu</th><th className="px-4 py-3 text-left">Zone</th><th className="px-4 py-3 text-left">Status</th></tr></thead>
          <tbody>{filteredMembers.map((member, index) => <tr key={member.id} className="border-b border-gray-100 dark:border-gray-800"><td className="px-4 py-3">{index + 1}</td><td className="px-4 py-3">{member.membership_number || "—"}</td><td className="px-4 py-3 font-medium">{member.full_name}</td><td className="px-4 py-3">{member.gender || "—"}</td><td className="px-4 py-3">{member.marital_status || "—"}</td><td className="px-4 py-3">{member.education_level || "—"}</td><td className="px-4 py-3">{member.residential_zone || "—"}</td><td className="px-4 py-3">{member.membership_status || "—"}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
