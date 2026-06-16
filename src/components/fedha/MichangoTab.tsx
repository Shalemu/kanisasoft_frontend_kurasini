"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";
import { FaMoneyBillWave, FaPlus, FaSearch, FaTrash, FaFileExcel, FaPrint, FaEdit, FaTimes } from "react-icons/fa";
import MonthQuickSelect from "./MonthQuickSelect";
import MemberSearchInput from "./MemberSearchInput";

interface Mchango {
  id: number;
  date?: string | null;
  contribution_date?: string | null;
  type?: string | null;
  category?: string | null;
  member_name?: string | null;
  donor_name?: string | null;
  membership_number?: string | null;
  member_id?: number | null;
  amount: number | string;
  pledge_amount?: number | string | null;
  total_paid?: number | string | null;
  payment_method?: string | null;
  notes?: string | null;
  created_at?: string | null;
}

interface MichangoForm {
  date: string;
  type: string;
  member_id: number | null;
  member_name: string;
  membership_number: string;
  amount: string;
  pledge_amount: string;
  payment_method: string;
  notes: string;
}

const TYPES = ["Ujenzi", "Shukrani", "Ahadi", "Mengineyo"];
const METHODS = ["Taslimu", "Simu ya Pesa", "Benki", "Hundi"];

const emptyForm: MichangoForm = {
  date: new Date().toISOString().slice(0, 10),
  type: "Ujenzi",
  member_id: null,
  member_name: "",
  membership_number: "",
  amount: "",
  pledge_amount: "",
  payment_method: "Taslimu",
  notes: "",
};

function getDate(m: Mchango) { return m.date ?? m.contribution_date ?? m.created_at ?? ""; }
function getType(m: Mchango) { return m.type ?? m.category ?? ""; }
function getDonor(m: Mchango) { return m.member_name ?? m.donor_name ?? ""; }
function getAmount(m: Mchango) { return Number(m.amount ?? 0) || 0; }
function getPledge(m: Mchango) { return Number(m.pledge_amount ?? 0) || 0; }
function getTotalPaid(m: Mchango) { return Number(m.total_paid ?? m.amount ?? 0) || 0; }
function getBalance(m: Mchango) {
  const pledge = getPledge(m);
  if (!pledge) return null;
  return pledge - getTotalPaid(m);
}

function normalizeList(res: any): Mchango[] {
  const list = res?.contributions ?? res?.reports ?? res?.data?.contributions ?? res?.data?.reports ?? res?.data ?? res ?? [];
  return Array.isArray(list) ? list : [];
}

interface Props {
  onStatsChange?: (monthTotal: number) => void;
}

export default function MichangoTab({ onStatsChange }: Props) {
  const [records, setRecords] = useState<Mchango[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<MichangoForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [filters, setFilters] = useState({ search: "", fromDate: "", toDate: "", type: "", payment_method: "" });

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.fromDate) params.set("start_date", filters.fromDate);
      if (filters.toDate) params.set("end_date", filters.toDate);
      if (filters.type) params.set("type", filters.type);
      if (filters.payment_method) params.set("payment_method", filters.payment_method);
      const q = params.toString();
      const res = await apiFetch(`/contributions${q ? `?${q}` : ""}`);
      const list = normalizeList(res);
      setRecords(list);

      const now = new Date();
      const monthTotal = list.reduce((sum: number, m: Mchango) => {
        const d = new Date(getDate(m));
        if (!isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          return sum + getAmount(m);
        }
        return sum;
      }, 0);
      onStatsChange?.(monthTotal);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [filters.fromDate, filters.toDate, filters.type, filters.payment_method, onStatsChange]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const filtered = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return records.filter((m) => {
      const donor = getDonor(m).toLowerCase();
      const type = getType(m).toLowerCase();
      const num = (m.membership_number ?? "").toLowerCase();
      const date = getDate(m).slice(0, 10);
      return (
        (!term || donor.includes(term) || type.includes(term) || num.includes(term)) &&
        (!filters.fromDate || date >= filters.fromDate) &&
        (!filters.toDate || date <= filters.toDate) &&
        (!filters.type || getType(m) === filters.type) &&
        (!filters.payment_method || m.payment_method === filters.payment_method)
      );
    });
  }, [records, filters]);

  const total = filtered.reduce((sum, m) => sum + getAmount(m), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.amount || Number(form.amount) <= 0 || !form.type) {
      Swal.fire("Tahadhari", "Jaza tarehe, aina na kiasi sahihi.", "warning");
      return;
    }
    setSaving(true);
    try {
      const body = {
        date: form.date,
        contribution_date: form.date,
        type: form.type,
        category: form.type,
        member_id: form.member_id,
        member_name: form.member_name,
        donor_name: form.member_name,
        membership_number: form.membership_number,
        amount: Number(form.amount),
        pledge_amount: form.pledge_amount ? Number(form.pledge_amount) : null,
        payment_method: form.payment_method,
        notes: form.notes,
      };
      if (editingId) {
        await apiFetch(`/contributions/${editingId}`, { method: "PUT", body });
        Swal.fire("Imefanikiwa", "Mchango umesasishwa.", "success");
      } else {
        await apiFetch("/contributions", { method: "POST", body });
        Swal.fire("Imefanikiwa", "Mchango umehifadhiwa.", "success");
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

  const handleEdit = (record: Mchango) => {
    setForm({
      date: getDate(record).slice(0, 10) || new Date().toISOString().slice(0, 10),
      type: getType(record) || "Ujenzi",
      member_id: record.member_id ?? null,
      member_name: getDonor(record) || "",
      membership_number: record.membership_number ?? "",
      amount: String(getAmount(record) || ""),
      pledge_amount: String(getPledge(record) || ""),
      payment_method: record.payment_method || "Taslimu",
      notes: record.notes || "",
    });
    setEditingId(record.id);
  };

  const handleCancelEdit = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    const res = await Swal.fire({
      title: "Futa mchango huu?", icon: "warning",
      showCancelButton: true, confirmButtonText: "Futa", cancelButtonText: "Ghairi",
      confirmButtonColor: "#dc2626",
    });
    if (!res.isConfirmed) return;
    try {
      await apiFetch(`/contributions/${id}`, { method: "DELETE" });
      setRecords((prev) => prev.filter((m) => m.id !== id));
      Swal.fire("Imefutwa", "", "success");
    } catch (err: any) {
      Swal.fire("Hitilafu", err?.message || "Imeshindikana kufuta.", "error");
    }
  };

  const exportCsv = () => {
    const rows = [
      ["Tarehe", "Aina", "Mtoaji", "Namba ya Ushirika", "Kiasi", "Ahadi", "Balance", "Njia ya Malipo"],
      ...filtered.map((m) => {
        const bal = getBalance(m);
        return [
          getDate(m).slice(0, 10), getType(m), getDonor(m),
          m.membership_number ?? "", String(getAmount(m)),
          String(getPledge(m) || ""), bal !== null ? String(bal) : "",
          m.payment_method ?? "",
        ];
      }),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "michango.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] h-fit">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
              <FaMoneyBillWave />
            </div>
            <div>
              <h2 className="font-semibold text-base">Rekodi Mchango</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Hifadhi michango ya ujenzi, ahadi na mengineyo.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tarehe *</label>
              <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-500/10" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Aina ya Mchango *</label>
              <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Jina / Namba ya Mtoaji</label>
              <MemberSearchInput
                value={form.member_name}
                onSelect={(id, name, num) => setForm((p) => ({ ...p, member_id: id, member_name: name, membership_number: num }))}
              />
              {form.membership_number && (
                <p className="mt-1 text-xs text-gray-500">Namba ya Ushirika: <span className="font-semibold">{form.membership_number}</span></p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Kiasi Kilichotolewa (TZS) *</label>
              <input type="number" min="0" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                placeholder="0"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-500/10" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Ahadi ya Mchango (TZS) <span className="text-gray-400 font-normal">— Hiari</span></label>
              <input type="number" min="0" value={form.pledge_amount} onChange={(e) => setForm((p) => ({ ...p, pledge_amount: e.target.value }))}
                placeholder="Weka kiasi cha ahadi kama ipo..."
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-500/10" />
              <p className="mt-1 text-xs text-gray-400">Mfumo utahesabu balance: Ahadi - Jumla iliyolipwa</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Njia ya Malipo</label>
              <select value={form.payment_method} onChange={(e) => setForm((p) => ({ ...p, payment_method: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Maelezo <span className="text-gray-400 font-normal">— Hiari</span></label>
              <textarea value={form.notes} rows={2} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white resize-none" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#f0ce32] px-4 py-3 font-semibold text-black hover:bg-[#e0bd20] disabled:opacity-60">
                <FaPlus /> {saving ? "Inahifadhi..." : editingId ? "Hifadhi Mabadiliko" : "Hifadhi Mchango"}
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
              <h2 className="font-semibold text-base">Orodha ya Michango</h2>
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

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-3 dark:border-gray-700 dark:bg-gray-900 xl:col-span-2">
              <FaSearch className="mr-2 text-gray-400 text-xs" />
              <input value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                placeholder="Tafuta mtoaji, aina..." className="w-full bg-transparent py-2.5 text-sm outline-none dark:text-white" />
            </div>
            <select value={filters.type} onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              <option value="">Aina Zote</option>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filters.payment_method} onChange={(e) => setFilters((p) => ({ ...p, payment_method: e.target.value }))}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              <option value="">Njia Zote</option>
              {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-3">
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
                  <th className="px-4 py-3">Aina</th>
                  <th className="px-4 py-3">Mtoaji</th>
                  <th className="px-4 py-3">Kiasi</th>
                  <th className="px-4 py-3">Ahadi</th>
                  <th className="px-4 py-3">Balance</th>
                  <th className="px-4 py-3">Njia</th>
                  <th className="px-4 py-3">Hatua</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Inapakia...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Hakuna michango iliyopatikana.</td></tr>
                ) : filtered.map((m) => {
                  const balance = getBalance(m);
                  return (
                    <tr key={m.id} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="px-4 py-3 whitespace-nowrap">{getDate(m).slice(0, 10) || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">{getType(m) || "—"}</span>
                      </td>
                      <td className="px-4 py-3 font-medium">{getDonor(m) || "—"}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-400">TZS {getAmount(m).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-500">{getPledge(m) ? `TZS ${getPledge(m).toLocaleString()}` : "—"}</td>
                      <td className="px-4 py-3 font-semibold">
                        {balance === null ? "—" : (
                          <span className={balance > 0 ? "text-red-600" : "text-green-600"}>
                            TZS {Math.abs(balance).toLocaleString()} {balance > 0 ? "(Deni)" : "(Imekamilika)"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{m.payment_method || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEdit(m)} className="rounded-lg border border-blue-200 p-2 text-blue-600 hover:bg-blue-50 dark:border-blue-500/30">
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDelete(m.id)} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 dark:border-red-500/30">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
