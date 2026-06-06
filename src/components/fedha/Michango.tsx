"use client";

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { FaFileExcel, FaMoneyBillWave, FaPlus, FaPrint, FaSearch, FaTrash } from "react-icons/fa";
import { apiFetch } from "@/lib/api";

type Contribution = {
  id: number;
  date?: string | null;
  contribution_date?: string | null;
  amount?: number | string | null;
  type?: string | null;
  category?: string | null;
  payment_method?: string | null;
  member_name?: string | null;
  donor_name?: string | null;
  reference?: string | null;
  notes?: string | null;
  created_at?: string | null;
};

type ContributionForm = {
  date: string;
  amount: string;
  type: string;
  payment_method: string;
  donor_name: string;
  reference: string;
  notes: string;
};

const emptyForm: ContributionForm = {
  date: new Date().toISOString().slice(0, 10),
  amount: "",
  type: "Sadaka",
  payment_method: "Cash",
  donor_name: "",
  reference: "",
  notes: "",
};

const contributionTypes = ["Sadaka", "Zaka", "Ahadi", "Ujenzi", "Shukrani", "Mengineyo"];
const paymentMethods = ["Cash", "Mobile Money", "Bank", "Cheque"];

function getContributionDate(contribution: Contribution) {
  return contribution.date ?? contribution.contribution_date ?? contribution.created_at ?? "";
}

function getContributionAmount(contribution: Contribution) {
  return Number(contribution.amount ?? 0) || 0;
}

function normalizeContributions(response: any): Contribution[] {
  const records =
    response?.reports ??
    response?.contributions ??
    response?.data?.reports ??
    response?.data?.contributions ??
    response?.data ??
    [];

  return Array.isArray(records) ? records : [];
}

export default function Michango() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ContributionForm>(emptyForm);
  const [filters, setFilters] = useState({
    search: "",
    fromDate: "",
    toDate: "",
    type: "",
    payment_method: "",
  });

  const fetchContributions = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (filters.fromDate) params.set("start_date", filters.fromDate);
      if (filters.toDate) params.set("end_date", filters.toDate);
      if (filters.type) params.set("type", filters.type);
      if (filters.payment_method) params.set("payment_method", filters.payment_method);

      const query = params.toString();
      const response = await apiFetch(`/contributions${query ? `?${query}` : ""}`);
      setContributions(normalizeContributions(response));
    } catch (error) {
      console.error(error);
      setContributions([]);
      Swal.fire("Hitilafu", "Imeshindikana kupata michango.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchContributions();
  }, [filters.fromDate, filters.toDate, filters.type, filters.payment_method]);

  const filteredContributions = useMemo(() => {
    const term = filters.search.trim().toLowerCase();

    return contributions.filter((contribution) => {
      const date = getContributionDate(contribution).slice(0, 10);
      const type = contribution.type ?? contribution.category ?? "";
      const donor = contribution.donor_name ?? contribution.member_name ?? "";
      const reference = contribution.reference ?? "";
      const notes = contribution.notes ?? "";
      const method = contribution.payment_method ?? "";
      const matchesSearch =
        !term ||
        donor.toLowerCase().includes(term) ||
        reference.toLowerCase().includes(term) ||
        notes.toLowerCase().includes(term) ||
        type.toLowerCase().includes(term);

      return (
        matchesSearch &&
        (!filters.fromDate || date >= filters.fromDate) &&
        (!filters.toDate || date <= filters.toDate) &&
        (!filters.type || type === filters.type) &&
        (!filters.payment_method || method === filters.payment_method)
      );
    });
  }, [contributions, filters]);

  const totalAmount = filteredContributions.reduce(
    (sum, contribution) => sum + getContributionAmount(contribution),
    0
  );

  const thisMonthAmount = filteredContributions.reduce((sum, contribution) => {
    const date = new Date(getContributionDate(contribution));
    const now = new Date();

    if (
      !Number.isNaN(date.getTime()) &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return sum + getContributionAmount(contribution);
    }

    return sum;
  }, 0);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.date || !form.amount || Number(form.amount) <= 0 || !form.type) {
      Swal.fire("Tahadhari", "Jaza tarehe, aina ya mchango na kiasi sahihi.", "warning");
      return;
    }

    setSaving(true);

    try {
      await apiFetch("/contributions", {
        method: "POST",
        body: {
          date: form.date,
          contribution_date: form.date,
          amount: Number(form.amount),
          type: form.type,
          category: form.type,
          payment_method: form.payment_method,
          donor_name: form.donor_name,
          reference: form.reference,
          notes: form.notes,
        },
      });

      Swal.fire("Imefanikiwa", "Mchango umehifadhiwa.", "success");
      setForm(emptyForm);
      await fetchContributions();
    } catch (error) {
      Swal.fire(
        "Hitilafu",
        error instanceof Error ? error.message : "Imeshindikana kuhifadhi mchango.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (contribution: Contribution) => {
    const result = await Swal.fire({
      title: "Futa mchango?",
      text: "Taarifa hii itaondolewa kwenye orodha ya michango.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Futa",
      cancelButtonText: "Ghairi",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    try {
      await apiFetch(`/contributions/${contribution.id}`, { method: "DELETE" });
      setContributions((previous) => previous.filter((item) => item.id !== contribution.id));
      Swal.fire("Imefutwa", "Mchango umeondolewa.", "success");
    } catch (error) {
      Swal.fire(
        "Hitilafu",
        error instanceof Error ? error.message : "Imeshindikana kufuta mchango.",
        "error"
      );
    }
  };

  const exportCsv = () => {
    const rows = [
      ["Tarehe", "Aina", "Kiasi", "Njia", "Mtoaji", "Kumbukumbu", "Maelezo"],
      ...filteredContributions.map((contribution) => [
        getContributionDate(contribution).slice(0, 10),
        contribution.type ?? contribution.category ?? "",
        String(getContributionAmount(contribution)),
        contribution.payment_method ?? "",
        contribution.donor_name ?? contribution.member_name ?? "",
        contribution.reference ?? "",
        contribution.notes ?? "",
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "michango.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-gray-800 dark:text-white/90">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard title="Jumla ya Michango" value={`TZS ${totalAmount.toLocaleString()}`} />
        <SummaryCard title="Mwezi Huu" value={`TZS ${thisMonthAmount.toLocaleString()}`} />
        <SummaryCard title="Idadi ya Rekodi" value={filteredContributions.length} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
              <FaMoneyBillWave />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Rekodi Mchango</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Hifadhi sadaka, zaka, ahadi na michango mingine.</p>
            </div>
          </div>

          <div className="space-y-4">
            <Field label="Tarehe *" name="date" type="date" value={form.date} onChange={handleChange} />
            <Field label="Kiasi (TZS) *" name="amount" type="number" value={form.amount} onChange={handleChange} />

            <SelectField label="Aina ya Mchango *" name="type" value={form.type} onChange={handleChange} options={contributionTypes} />
            <SelectField label="Njia ya Malipo" name="payment_method" value={form.payment_method} onChange={handleChange} options={paymentMethods} />

            <Field label="Jina la Mtoaji" name="donor_name" value={form.donor_name} onChange={handleChange} placeholder="Hiari" />
            <Field label="Kumbukumbu/Reference" name="reference" value={form.reference} onChange={handleChange} placeholder="Hiari" />

            <div>
              <label className="mb-2 block text-sm font-medium">Maelezo</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-blue-500/10"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#f0ce32] px-4 py-3 font-semibold text-black transition hover:bg-[#e0bd20] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaPlus />
              {saving ? "Inahifadhi..." : "Hifadhi Mchango"}
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Orodha ya Michango</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Chuja, angalia na pakua rekodi zote za michango.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white">
                <FaFileExcel /> CSV
              </button>
              <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-white">
                <FaPrint /> Print
              </button>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-3 dark:border-gray-700 dark:bg-gray-900 xl:col-span-2">
              <FaSearch className="mr-2 text-gray-400" />
              <input
                value={filters.search}
                onChange={(event) => setFilters((previous) => ({ ...previous, search: event.target.value }))}
                placeholder="Tafuta mtoaji, aina au reference..."
                className="w-full bg-transparent py-2.5 outline-none"
              />
            </div>
            <input className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900" type="date" value={filters.fromDate} onChange={(event) => setFilters((previous) => ({ ...previous, fromDate: event.target.value }))} />
            <input className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900" type="date" value={filters.toDate} onChange={(event) => setFilters((previous) => ({ ...previous, toDate: event.target.value }))} />
            <SelectField name="type" value={filters.type} onChange={(event) => setFilters((previous) => ({ ...previous, type: event.target.value }))} options={contributionTypes} placeholder="Aina zote" compact />
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-[#1e293b] text-left text-white">
                <tr>
                  <th className="px-4 py-3">Tarehe</th>
                  <th className="px-4 py-3">Aina</th>
                  <th className="px-4 py-3">Kiasi</th>
                  <th className="px-4 py-3">Njia</th>
                  <th className="px-4 py-3">Mtoaji</th>
                  <th className="px-4 py-3">Hatua</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Inapakia...</td>
                  </tr>
                ) : filteredContributions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Hakuna michango iliyopatikana.</td>
                  </tr>
                ) : (
                  filteredContributions.map((contribution) => (
                    <tr key={contribution.id} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="px-4 py-3">{getContributionDate(contribution).slice(0, 10) || "—"}</td>
                      <td className="px-4 py-3">{contribution.type ?? contribution.category ?? "—"}</td>
                      <td className="px-4 py-3 font-semibold">TZS {getContributionAmount(contribution).toLocaleString()}</td>
                      <td className="px-4 py-3">{contribution.payment_method ?? "—"}</td>
                      <td className="px-4 py-3">{contribution.donor_name ?? contribution.member_name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(contribution)}
                          className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
                          aria-label="Futa mchango"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white/90">{value}</p>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-blue-500/10"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  compact,
}: {
  label?: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder?: string;
  compact?: boolean;
}) {
  return (
    <div>
      {label && <label className="mb-2 block text-sm font-medium">{label}</label>}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full rounded-xl border border-gray-300 bg-white px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-blue-500/10 ${compact ? "py-2.5" : "py-3"}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
