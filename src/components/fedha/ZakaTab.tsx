"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";
import { FaHandHoldingUsd, FaPlus, FaSearch, FaTrash, FaFileExcel, FaPrint, FaEdit, FaTimes } from "react-icons/fa";
import MonthQuickSelect from "./MonthQuickSelect";
import MemberSearchInput from "./MemberSearchInput";

interface Zaka {
  id: number;
  date?: string | null;
  tithe_date?: string | null;
  member_name?: string | null;
  donor_name?: string | null;
  membership_number?: string | null;
  member_id?: number | null;
  amount: number | string;
  created_at?: string | null;
}

interface ZakaForm {
  date: string;
  member_id: number | null;
  member_name: string;
  membership_number: string;
  amount: string;
}

const emptyForm: ZakaForm = {
  date: new Date().toISOString().slice(0, 10),
  member_id: null,
  member_name: "",
  membership_number: "",
  amount: "",
};

function getDate(z: Zaka) { return z.date ?? z.tithe_date ?? z.created_at ?? ""; }
function getDonor(z: Zaka) { return z.member_name ?? z.donor_name ?? ""; }
function getAmount(z: Zaka) { return Number(z.amount ?? 0) || 0; }

function normalizeList(res: any): Zaka[] {
  const list = res?.zaka ?? res?.tithe ?? res?.data?.zaka ?? res?.data ?? res ?? [];
  return Array.isArray(list) ? list : [];
}

interface Props {
  onStatsChange?: (monthTotal: number) => void;
}

export default function ZakaTab({ onStatsChange }: Props) {
  const [records, setRecords] = useState<Zaka[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ZakaForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [filters, setFilters] = useState({ search: "", fromDate: "", toDate: "" });

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.fromDate) params.set("start_date", filters.fromDate);
      if (filters.toDate) params.set("end_date", filters.toDate);
      const q = params.toString();
      const res = await apiFetch(`/zaka${q ? `?${q}` : ""}`);
      const list = normalizeList(res);
      setRecords(list);

      const now = new Date();
      const monthTotal = list.reduce((sum: number, z: Zaka) => {
        const d = new Date(getDate(z));
        if (!isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          return sum + getAmount(z);
        }
        return sum;
      }, 0);
      onStatsChange?.(monthTotal);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [filters.fromDate, filters.toDate, onStatsChange]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const filtered = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return records.filter((z) => {
      const donor = getDonor(z).toLowerCase();
      const num = (z.membership_number ?? "").toLowerCase();
      const date = getDate(z).slice(0, 10);
      return (
        (!term || donor.includes(term) || num.includes(term)) &&
        (!filters.fromDate || date >= filters.fromDate) &&
        (!filters.toDate || date <= filters.toDate)
      );
    });
  }, [records, filters]);

  const total = filtered.reduce((sum, z) => sum + getAmount(z), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.amount || Number(form.amount) <= 0) {
      Swal.fire("Tahadhari", "Jaza tarehe na kiasi sahihi.", "warning");
      return;
    }
    setSaving(true);
    try {
      const body = {
        date: form.date,
        member_id: form.member_id,
        member_name: form.member_name,
        membership_number: form.membership_number,
        amount: Number(form.amount),
      };
      if (editingId) {
        await apiFetch(`/zaka/${editingId}`, { method: "PUT", body });
        Swal.fire("Imefanikiwa", "Zaka imesasishwa.", "success");
      } else {
        await apiFetch("/zaka", { method: "POST", body });
        Swal.fire("Imefanikiwa", "Zaka imehifadhiwa.", "success");
      }
      setForm(emptyForm);
      setEditingId(null);
      await fetch_();
    } catch (err: any) {
      Swal.fire("Hitilafu", err?.message || "Imeshindikana kuhifadhi.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (record: Zaka) => {
    setForm({
      date: getDate(record).slice(0, 10) || new Date().toISOString().slice(0, 10),
      member_id: record.member_id ?? null,
      member_name: getDonor(record) || "",
      membership_number: record.membership_number ?? "",
      amount: String(getAmount(record) || ""),
    });
    setEditingId(record.id);
  };

  const handleCancelEdit = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    const res = await Swal.fire({
      title: "Futa rekodi hii?", icon: "warning",
      showCancelButton: true, confirmButtonText: "Futa", cancelButtonText: "Ghairi",
      confirmButtonColor: "#dc2626",
    });
    if (!res.isConfirmed) return;
    try {
      await apiFetch(`/zaka/${id}`, { method: "DELETE" });
      setRecords((prev) => prev.filter((z) => z.id !== id));
      Swal.fire("Imefutwa", "", "success");
    } catch (err: any) {
      Swal.fire("Hitilafu", err?.message || "Imeshindikana kufuta.", "error");
    }
  };

  const exportCsv = () => {
    const rows = [
      ["Tarehe", "Mtoaji", "Namba ya Ushirika", "Kiasi"],
      ...filtered.map((z) => [getDate(z).slice(0, 10), getDonor(z), z.membership_number ?? "", String(getAmount(z))]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "zaka.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] h-fit">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10">
              <FaHandHoldingUsd />
            </div>
            <div>
              <h2 className="font-semibold text-base">Rekodi Zaka / Fungu la Kumi</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Hifadhi zaka zilizotolewa na washirika.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tarehe *</label>
              <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-500/10" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Jina la Mtoaji (Mshirika)</label>
              <MemberSearchInput
                value={form.member_name}
                onSelect={(id, name, num) => setForm((p) => ({ ...p, member_id: id, member_name: name, membership_number: num }))}
              />
              {form.membership_number && (
                <p className="mt-1 text-xs text-gray-500">Namba ya Ushirika: <span className="font-semibold">{form.membership_number}</span></p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Kiasi (TZS) *</label>
              <input type="number" min="0" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                placeholder="0"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-500/10" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#f0ce32] px-4 py-3 font-semibold text-black hover:bg-[#e0bd20] disabled:opacity-60">
                <FaPlus /> {saving ? "Inahifadhi..." : editingId ? "Hifadhi Mabadiliko" : "Hifadhi Zaka"}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancelEdit}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <FaTimes /> Ghairi
                </button>
              )}
            </div>
          </div>
        </form>

        {/* List */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-base">Orodha ya Zaka</h2>
              <p className="text-xs text-gray-500">Jumla: <span className="font-bold text-gray-800 dark:text-white">TZS {total.toLocaleString()}</span></p>
            </div>
            <div className="flex gap-2">
              <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white"><FaFileExcel /> CSV</button>
              <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-2 text-xs font-medium text-white"><FaPrint /> Print</button>
            </div>
          </div>

          <div className="mb-4">
            <MonthQuickSelect year={year} onYearChange={setYear} onSelect={(from, to) => setFilters((p) => ({ ...p, fromDate: from, toDate: to }))} />
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-3 dark:border-gray-700 dark:bg-gray-900">
              <FaSearch className="mr-2 text-gray-400 text-xs" />
              <input value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                placeholder="Tafuta mtoaji au namba..." className="w-full bg-transparent py-2.5 text-sm outline-none dark:text-white" />
            </div>
            <input type="date" value={filters.fromDate} onChange={(e) => setFilters((p) => ({ ...p, fromDate: e.target.value }))}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
            <input type="date" value={filters.toDate} onChange={(e) => setFilters((p) => ({ ...p, toDate: e.target.value }))}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-[#1e293b] text-left text-white">
                <tr>
                  <th className="px-4 py-3">Tarehe</th>
                  <th className="px-4 py-3">Mtoaji</th>
                  <th className="px-4 py-3">Namba ya Ushirika</th>
                  <th className="px-4 py-3">Kiasi (TZS)</th>
                  <th className="px-4 py-3">Hatua</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Inapakia...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Hakuna rekodi zilizopatikana.</td></tr>
                ) : filtered.map((z) => (
                  <tr key={z.id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-3">{getDate(z).slice(0, 10) || "—"}</td>
                    <td className="px-4 py-3 font-medium">{getDonor(z) || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{z.membership_number || "—"}</td>
                    <td className="px-4 py-3 font-semibold text-blue-700 dark:text-blue-400">TZS {getAmount(z).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(z)} className="rounded-lg border border-blue-200 p-2 text-blue-600 hover:bg-blue-50 dark:border-blue-500/30">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(z.id)} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 dark:border-red-500/30">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
