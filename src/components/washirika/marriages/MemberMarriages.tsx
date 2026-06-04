"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { apiFetch } from "@/lib/api";

interface Member {
  id: number;
  full_name: string;
  membership_number?: string | null;
  gender?: string | null;
}

interface Marriage {
  id: number;
  husband?: Member;
  wife?: Member;
  husband_id?: number;
  wife_id?: number;
  marriage_date?: string | null;
}

export default function MemberMarriages() {
  const [members, setMembers] = useState<Member[]>([]);
  const [marriages, setMarriages] = useState<Marriage[]>([]);
  const [form, setForm] = useState({ husband_id: "", wife_id: "", marriage_date: "" });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    const usersResponse = await apiFetch("/users");
    setMembers(usersResponse?.users ?? usersResponse?.data?.users ?? []);
    try {
      const response = await apiFetch("/marriages");
      const records = response?.marriages ?? response?.data?.marriages ?? response?.data ?? [];
      setMarriages(Array.isArray(records) ? records : []);
    } catch (error) {
      console.error("Failed to load marriages", error);
      setMarriages([]);
    }
  };

  useEffect(() => { void loadData(); }, []);

  const saveMarriage = async () => {
    if (!form.husband_id || !form.wife_id || form.husband_id === form.wife_id) {
      await Swal.fire("Taarifa Hazijakamilika", "Chagua mume na mke tofauti.", "warning");
      return;
    }
    try {
      setSaving(true);
      await apiFetch("/marriages", { method: "POST", body: { husband_id: Number(form.husband_id), wife_id: Number(form.wife_id), marriage_date: form.marriage_date || null } });
      setForm({ husband_id: "", wife_id: "", marriage_date: "" });
      await loadData();
      await Swal.fire("Imefanikiwa", "Ndoa imeunganishwa.", "success");
    } catch (error) {
      await Swal.fire("Hitilafu", error instanceof Error ? error.message : "Imeshindikana kuhifadhi ndoa.", "error");
    } finally { setSaving(false); }
  };

  const memberName = (id?: number) => members.find((member) => member.id === id)?.full_name || "—";
  const selectClass = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900";
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="mb-1 text-xl font-bold">Unganisha Ndoa ya Washirika</h2>
        <p className="mb-5 text-sm text-gray-500">Chagua mume na mke kutoka kwenye orodha ya washirika.</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <select className={selectClass} value={form.husband_id} onChange={(e) => setForm({ ...form, husband_id: e.target.value })}><option value="">Chagua mume</option>{members.filter((m) => m.gender === "M" || m.gender === "Mwanaume").map((m) => <option key={m.id} value={m.id}>{m.full_name} ({m.membership_number || "—"})</option>)}</select>
          <select className={selectClass} value={form.wife_id} onChange={(e) => setForm({ ...form, wife_id: e.target.value })}><option value="">Chagua mke</option>{members.filter((m) => m.gender === "F" || m.gender === "Mwanamke").map((m) => <option key={m.id} value={m.id}>{m.full_name} ({m.membership_number || "—"})</option>)}</select>
          <input className={selectClass} type="date" value={form.marriage_date} onChange={(e) => setForm({ ...form, marriage_date: e.target.value })} />
          <button disabled={saving} onClick={saveMarriage} className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-60">{saving ? "Inahifadhi..." : "Unganisha Ndoa"}</button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-sm"><thead className="bg-[#1e293b] text-white"><tr><th className="px-4 py-3 text-left">#</th><th className="px-4 py-3 text-left">Mume</th><th className="px-4 py-3 text-left">Mke</th><th className="px-4 py-3 text-left">Tarehe ya Ndoa</th></tr></thead>
          <tbody>{marriages.length === 0 ? <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Hakuna ndoa zilizounganishwa.</td></tr> : marriages.map((marriage, index) => <tr key={marriage.id} className="border-b border-gray-100 dark:border-gray-800"><td className="px-4 py-3">{index + 1}</td><td className="px-4 py-3">{marriage.husband?.full_name || memberName(marriage.husband_id)}</td><td className="px-4 py-3">{marriage.wife?.full_name || memberName(marriage.wife_id)}</td><td className="px-4 py-3">{marriage.marriage_date ? new Date(marriage.marriage_date).toLocaleDateString() : "—"}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
