"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useWashirikaExport } from "@/hooks/useWashirikaExport";

interface Member {
  id: number; full_name: string; membership_number?: string | null; phone?: string | null;
  email?: string | null; gender?: string | null; birth_date?: string | null;
  marital_status?: string | null; education_level?: string | null;
  residential_zone?: string | null; membership_status?: string | null; created_at?: string;
  groups?: { id: number; name: string }[];
}

const months = ["Januari", "Februari", "Machi", "Aprili", "Mei", "Juni", "Julai", "Agosti", "Septemba", "Oktoba", "Novemba", "Desemba"];

export default function MemberReports() {
  const [members, setMembers] = useState<Member[]>([]);
  const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    maritalStatus: "",
    educationLevel: "",
    birthMonth: "",
    gender: "",
    zone: "",
    membershipStatus: "",
    groupId: "",
    fromDate: "",
    toDate: "",
  });
  const { exportToExcel, exportToPDF } = useWashirikaExport();

  useEffect(() => {
    async function loadMembers() {
      try {
        const [response, groupsResponse] = await Promise.all([
          apiFetch("/users"),
          apiFetch("/groups"),
        ]);
        const users = response?.users ?? response?.data?.users ?? [];
        setMembers(users.filter((user: Member & { role?: string }) => user.role !== "mchungaji"));
        setGroups(groupsResponse?.groups ?? groupsResponse?.data?.groups ?? []);
      } finally { setLoading(false); }
    }
    void loadMembers();
  }, []);

  const options = (key: keyof Member) => Array.from(new Set(members.map((member) => member[key]).filter(Boolean) as string[])).sort();
  const filteredMembers = useMemo(() => members.filter((member) => {
    const birthMonth = member.birth_date ? String(new Date(member.birth_date).getMonth() + 1) : "";
    const createdDate = member.created_at?.slice(0, 10) ?? "";
    const memberGroups = member.groups ?? [];
    return (!filters.maritalStatus || member.marital_status === filters.maritalStatus) &&
      (!filters.educationLevel || member.education_level === filters.educationLevel) &&
      (!filters.birthMonth || birthMonth === filters.birthMonth) &&
      (!filters.gender || member.gender === filters.gender) &&
      (!filters.zone || member.residential_zone === filters.zone) &&
      (!filters.membershipStatus || member.membership_status === filters.membershipStatus) &&
      (!filters.groupId || memberGroups.some((group) => String(group.id) === filters.groupId)) &&
      (!filters.fromDate || createdDate >= filters.fromDate) &&
      (!filters.toDate || createdDate <= filters.toDate);
  }), [filters, members]);
  const selectClass = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900";
  const inputClass = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900";
  const resetFilters = () => setFilters({ maritalStatus: "", educationLevel: "", birthMonth: "", gender: "", zone: "", membershipStatus: "", groupId: "", fromDate: "", toDate: "" });
  const activeMembers = filteredMembers.filter((member) => member.membership_status === "active").length;
  const pendingMembers = filteredMembers.filter((member) => member.membership_status === "pending").length;
  const withPhone = filteredMembers.filter((member) => member.phone).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div><h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Tazama Ripoti za Washirika</h2><p className="text-sm text-gray-500">Chuja kwa tarehe, kundi, status na taarifa binafsi kisha pakua matokeo.</p></div>
          <div className="flex flex-wrap gap-2"><button onClick={() => exportToExcel(filteredMembers, "ripoti-washirika")} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white">Excel</button><button onClick={() => exportToPDF(filteredMembers, "ripoti-washirika")} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white">PDF</button><button onClick={() => window.print()} className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white">Print</button></div>
        </div>
        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Summary title="Matokeo" value={loading ? "..." : filteredMembers.length} />
          <Summary title="Active" value={loading ? "..." : activeMembers} />
          <Summary title="Pending" value={loading ? "..." : pendingMembers} />
          <Summary title="Wenye Simu" value={loading ? "..." : withPhone} />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-5">
          <input className={inputClass} type="date" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} aria-label="Kuanzia tarehe" />
          <input className={inputClass} type="date" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} aria-label="Mpaka tarehe" />
          <select className={selectClass} value={filters.maritalStatus} onChange={(e) => setFilters({ ...filters, maritalStatus: e.target.value })}><option value="">Hali zote za ndoa</option>{options("marital_status").map((value) => <option key={value}>{value}</option>)}</select>
          <select className={selectClass} value={filters.educationLevel} onChange={(e) => setFilters({ ...filters, educationLevel: e.target.value })}><option value="">Elimu zote</option>{options("education_level").map((value) => <option key={value}>{value}</option>)}</select>
          <select className={selectClass} value={filters.birthMonth} onChange={(e) => setFilters({ ...filters, birthMonth: e.target.value })}><option value="">Miezi yote ya kuzaliwa</option>{months.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select>
          <select className={selectClass} value={filters.gender} onChange={(e) => setFilters({ ...filters, gender: e.target.value })}><option value="">Jinsia zote</option>{options("gender").map((value) => <option key={value}>{value}</option>)}</select>
          <select className={selectClass} value={filters.zone} onChange={(e) => setFilters({ ...filters, zone: e.target.value })}><option value="">Zone zote</option>{options("residential_zone").map((value) => <option key={value}>{value}</option>)}</select>
          <select className={selectClass} value={filters.membershipStatus} onChange={(e) => setFilters({ ...filters, membershipStatus: e.target.value })}><option value="">Status zote</option>{options("membership_status").map((value) => <option key={value}>{value}</option>)}</select>
          <select className={selectClass} value={filters.groupId} onChange={(e) => setFilters({ ...filters, groupId: e.target.value })}><option value="">Makundi yote</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select>
        </div>
        <div className="mt-4 flex items-center justify-between"><p className="text-sm font-medium text-gray-600 dark:text-gray-300">Jumla iliyoonekana: {loading ? "..." : filteredMembers.length}</p><button onClick={resetFilters} className="text-sm font-medium text-blue-600 hover:underline">Ondoa vichujio</button></div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-sm"><thead className="bg-[#1e293b] text-white"><tr><th className="px-4 py-3 text-left">#</th><th className="px-4 py-3 text-left">Namba</th><th className="px-4 py-3 text-left">Jina</th><th className="px-4 py-3 text-left">Jinsia</th><th className="px-4 py-3 text-left">Ndoa</th><th className="px-4 py-3 text-left">Elimu</th><th className="px-4 py-3 text-left">Zone</th><th className="px-4 py-3 text-left">Status</th></tr></thead>
          <tbody>{loading ? <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Inapakia...</td></tr> : filteredMembers.length === 0 ? <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Hakuna taarifa kwenye vichujio hivi.</td></tr> : filteredMembers.map((member, index) => <tr key={member.id} className="border-b border-gray-100 dark:border-gray-800"><td className="px-4 py-3">{index + 1}</td><td className="px-4 py-3">{member.membership_number || "—"}</td><td className="px-4 py-3 font-medium">{member.full_name}</td><td className="px-4 py-3">{member.gender || "—"}</td><td className="px-4 py-3">{member.marital_status || "—"}</td><td className="px-4 py-3">{member.education_level || "—"}</td><td className="px-4 py-3">{member.residential_zone || "—"}</td><td className="px-4 py-3">{member.membership_status || "—"}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

function Summary({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white/90">{value}</p>
    </div>
  );
}
