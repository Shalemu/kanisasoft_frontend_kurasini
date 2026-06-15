"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";
import { FaChurch, FaPlus, FaSearch, FaTrash, FaFileExcel, FaPrint, FaEdit, FaTimes } from "react-icons/fa";
import MonthQuickSelect from "./MonthQuickSelect";

interface Sadaka {
  id: number;
  date?: string | null;
  service_date?: string | null;
  service_name?: string | null;
  worship_name?: string | null;
  amount: number | string;
  created_at?: string | null;
}

interface SadakaForm {
  date: string;
  service_name: string;
  amount: string;
}

const emptyForm: SadakaForm = {
  date: new Date().toISOString().slice(0, 10),
  service_name: "",
  amount: "",
};

function getDate(s: Sadaka) {
  return s.date ?? s.service_date ?? s.created_at ?? "";
}

function getName(s: Sadaka) {
  return s.service_name ?? s.worship_name ?? "";
}

function getAmount(s: Sadaka) {
  return Number(s.amount ?? 0) || 0;
}

function normalizeList(res: any): Sadaka[] {
  const list = res?.sadaka ?? res?.data?.sadaka ?? res?.data ?? res ?? [];
  return Array.isArray(list) ? list : [];
}

interface Props {
  onStatsChange?: (monthTotal: number) => void;
}

export default function SadakaTab({ onStatsChange }: Props) {
  const [records, setRecords] = useState<Sadaka[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SadakaForm>(emptyForm);
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
      const res = await apiFetch(`/sadaka${q ? `?${q}` : ""}`);
      const list = normalizeList(res);
      setRecords(list);

      // Compute this month total for stats
      const now = new Date();
      const monthTotal = list.reduce((sum: number, s: Sadaka) => {
        const d = new Date(getDate(s));
        if (!isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          return sum + getAmount(s);
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
    return records.filter((s) => {
      const name = getName(s).toLowerCase();
      const date = getDate(s).slice(0, 10);
      return (
        (!term || name.includes(term)) &&
        (!filters.fromDate || date >= filters.fromDate) &&
        (!filters.toDate || date <= filters.toDate)
      );
    });
  }, [records, filters]);

  const total = filtered.reduce((sum, s) => sum + getAmount(s), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.service_name.trim() || !form.amount || Number(form.amount) <= 0) {
      Swal.fire("Tahadhari", "Jaza tarehe, jina la ibada na kiasi sahihi.", "warning");
      return;
    }
    setSaving(true);
    try {
      const body = { date: form.date, service_name: form.service_name.trim(), amount: Number(form.amount) };
      if (editingId) {
        await apiFetch(`/sadaka/${editingId}`, { method: "PUT", body });
        Swal.fire("Imefanikiwa", "Sadaka imesasishwa.", "success");
      } else {
        await apiFetch("/sadaka", { method: "POST", body });
        Swal.fire("Imefanikiwa", "Sadaka imehifadhiwa.", "success");
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

  const handleEdit = (record: Sadaka) => {
    setForm({
      date: getDate(record).slice(0, 10) || new Date().toISOString().slice(0, 10),
      service_name: getName(record) || "",
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
      await apiFetch(`/sadaka/${id}`, { method: "DELETE" });
      setRecords((prev) => prev.filter((s) => s.id !== id));
      Swal.fire("Imefutwa", "", "success");
    } catch (err: any) {
      Swal.fire("Hitilafu", err?.message || "Imeshindikana kufuta.", "error");
    }
  };

  const exportCsv = () => {
    const rows = [
      ["Tarehe", "Jina la Ibada", "Kiasi"],
      ...filtered.map((s) => [getDate(s).slice(0, 10), getName(s), String(getAmount(s))]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "sadaka.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] h-fit">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10">
              <FaChurch />
            </div>
            <div>
              <h2 className="font-semibold text-base">Rekodi Sadaka ya Ibada</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Hifadhi sadaka zilizokusanywa kwenye ibada.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tarehe ya Ibada *</label>
              <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-500/10" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Jina la Ibada *</label>
              <input type="text" value={form.service_name} onChange={(e) => setForm((p) => ({ ...p, service_name: e.target.value }))}
                placeholder="mfano: Ibada ya Jumapili, Ibada ya Watoto..."
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-500/10" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Kiasi Kilichokusanywa (TZS) *</label>
              <input type="number" min="0" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                placeholder="0"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-500/10" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#f0ce32] px-4 py-3 font-semibold text-black hover:bg-[#e0bd20] disabled:opacity-60">
                <FaPlus /> {saving ? "Inahifadhi..." : editingId ? "Hifadhi Mabadiliko" : "Hifadhi Sadaka"}
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
              <h2 className="font-semibold text-base">Orodha ya Sadaka</h2>
              <p className="text-xs text-gray-500">Jumla: <span className="font-bold text-gray-800 dark:text-white">TZS {total.toLocaleString()}</span></p>
            </div>
            <div className="flex gap-2">
              <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white"><FaFileExcel /> CSV</button>
              <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-2 text-xs font-medium text-white"><FaPrint /> Print</button>
            </div>
          </div>

          {/* Month shortcuts */}
          <div className="mb-4">
            <MonthQuickSelect year={year} onYearChange={setYear} onSelect={(from, to) => setFilters((p) => ({ ...p, fromDate: from, toDate: to }))} />
          </div>

          {/* Filters */}
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-3 dark:border-gray-700 dark:bg-gray-900">
              <FaSearch className="mr-2 text-gray-400 text-xs" />
              <input value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                placeholder="Tafuta jina la ibada..." className="w-full bg-transparent py-2.5 text-sm outline-none dark:text-white" />
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
                  <th className="px-4 py-3">Jina la Ibada</th>
                  <th className="px-4 py-3">Kiasi (TZS)</th>
                  <th className="px-4 py-3">Hatua</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Inapakia...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Hakuna rekodi zilizopatikana.</td></tr>
                ) : filtered.map((s) => (
                  <tr key={s.id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-3">{getDate(s).slice(0, 10) || "—"}</td>
                    <td className="px-4 py-3 font-medium">{getName(s) || "—"}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-400">TZS {getAmount(s).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(s)} className="rounded-lg border border-blue-200 p-2 text-blue-600 hover:bg-blue-50 dark:border-blue-500/30">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 dark:border-red-500/30">
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
