"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  CalendarDays,
  Edit3,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useAuthUser } from "@/hooks/useAuthUser";
import { apiFetch } from "@/lib/api";
import {
  bulkCreateDailyWords,
  createDailyWord,
  deleteDailyWord,
  fetchDailyWords,
  fetchDailyWordStats,
  updateDailyWord,
} from "./api";
import type { DailyWord, DailyWordPayload, DailyWordStats } from "./types";

type Filters = {
  from: string;
  to: string;
  order: "asc" | "desc";
  search: string;
};

type DailyWordAuthor = {
  id: number;
  full_name: string;
  role?: string | null;
};

const emptyForm: DailyWordPayload = {
  scheduled_date: "",
  scripture_reference: "",
  verse_text: "",
  explanation: "",
  author_name: "",
};

const emptyStats: DailyWordStats = {
  total: 0,
  today_available: false,
  this_month: 0,
  upcoming: 0,
  past: 0,
  next_scheduled_date: null,
};

const fieldClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";

function toDateInput(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function formatDate(value?: string | null) {
  if (!value) return "Haijapangwa";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("sw-TZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);

  return formatDateInput(date);
}

function wordToPayload(word: DailyWord): DailyWordPayload {
  return {
    scheduled_date: toDateInput(word.scheduled_date),
    scripture_reference: word.scripture_reference ?? "",
    verse_text: word.verse_text ?? "",
    explanation: word.explanation ?? "",
    author_name: word.author_name ?? "",
  };
}

function validatePayload(payload: DailyWordPayload) {
  return (
    payload.scheduled_date &&
    payload.scripture_reference.trim() &&
    payload.verse_text.trim() &&
    payload.explanation.trim() &&
    payload.author_name.trim()
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function getUserRecords(response: any): DailyWordAuthor[] {
  const payload = response?.data ?? response ?? {};
  const records = payload.users ?? payload.data ?? response?.users ?? [];

  return Array.isArray(records) ? records : [];
}

export default function DailyWordsManager() {
  const user = useAuthUser();
  const canManage = ["admin", "mchungaji"].includes(
    String(user?.role ?? "").toLowerCase()
  );

  const today = useMemo(() => formatDateInput(new Date()), []);
  const monthStart = useMemo(() => today.slice(0, 8) + "01", [today]);
  const monthEnd = useMemo(() => {
    const date = new Date(`${monthStart}T00:00:00`);
    date.setMonth(date.getMonth() + 1, 0);
    return formatDateInput(date);
  }, [monthStart]);

  const [filters, setFilters] = useState<Filters>({
    from: monthStart,
    to: monthEnd,
    order: "asc",
    search: "",
  });
  const [words, setWords] = useState<DailyWord[]>([]);
  const [stats, setStats] = useState<DailyWordStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<DailyWord | null>(null);
  const [authors, setAuthors] = useState<DailyWordAuthor[]>([]);
  const [form, setForm] = useState<DailyWordPayload>({
    ...emptyForm,
    scheduled_date: today,
    author_name: user?.full_name ?? "",
  });
  const [bulkEntries, setBulkEntries] = useState<DailyWordPayload[]>([
    { ...emptyForm, scheduled_date: today, author_name: user?.full_name ?? "" },
  ]);

  const defaultAuthorName =
    user?.full_name || authors[0]?.full_name || "";

  const applyBulkStartDate = (startDate: string) => {
    setBulkEntries((current) =>
      current.map((entry, index) => ({
        ...entry,
        scheduled_date: addDays(startDate, index),
      }))
    );
  };

  const applyBulkAuthor = (authorName: string) => {
    setBulkEntries((current) =>
      current.map((entry) => ({
        ...entry,
        author_name: authorName,
      }))
    );
  };

  const fetchAuthors = async () => {
    const response = await apiFetch("/users");
    const authorRows = getUserRecords(response).filter((author) =>
      ["admin", "mchungaji"].includes(String(author.role ?? "").toLowerCase())
    );

    setAuthors(authorRows);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [wordRows, wordStats] = await Promise.all([
        fetchDailyWords(filters),
        fetchDailyWordStats(),
      ]);

      setWords(wordRows);
      setStats(wordStats);
    } catch (error) {
      await Swal.fire(
        "Hitilafu",
        error instanceof Error ? error.message : "Imeshindikana kupakia Neno la Siku.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !canManage) return;
    void loadData();
  }, [filters.from, filters.to, filters.order, filters.search, user, canManage]);

  useEffect(() => {
    if (user && !canManage) return;
    void fetchAuthors();
  }, [user, canManage]);

  const openCreate = () => {
    setEditingWord(null);
    setForm({
      ...emptyForm,
      scheduled_date: today,
      author_name: defaultAuthorName,
    });
    setIsFormOpen(true);
  };

  const openEdit = (word: DailyWord) => {
    setEditingWord(word);
    setForm(wordToPayload(word));
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingWord(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validatePayload(form)) {
      await Swal.fire(
        "Taarifa hazijakamilika",
        "Jaza tarehe, andiko, neno, maelezo na mtumaji.",
        "warning"
      );
      return;
    }

    try {
      setSaving(true);

      if (editingWord) {
        await updateDailyWord(editingWord.id, form);
      } else {
        await createDailyWord(form);
      }

      closeForm();
      await loadData();
      await Swal.fire(
        "Imefanikiwa",
        editingWord ? "Neno la Siku limehaririwa." : "Neno la Siku limeongezwa.",
        "success"
      );
    } catch (error) {
      await Swal.fire(
        "Hitilafu",
        error instanceof Error ? error.message : "Imeshindikana kuhifadhi Neno la Siku.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (word: DailyWord) => {
    const result = await Swal.fire({
      title: "Futa Neno la Siku?",
      text: `${word.scripture_reference} la ${formatDate(word.scheduled_date)} litaondolewa.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Futa",
      cancelButtonText: "Ghairi",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(word.id);
      await deleteDailyWord(word.id);
      await loadData();
      await Swal.fire("Imefutwa", "Neno la Siku limeondolewa.", "success");
    } catch (error) {
      await Swal.fire(
        "Hitilafu",
        error instanceof Error ? error.message : "Imeshindikana kufuta Neno la Siku.",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const openBulk = () => {
    setBulkEntries([
      {
        ...emptyForm,
        scheduled_date: today,
        author_name: defaultAuthorName,
      },
    ]);
    setIsBulkOpen(true);
  };

  const addBulkEntry = () => {
    if (bulkEntries.length >= 31) return;

    const lastDate = bulkEntries[bulkEntries.length - 1]?.scheduled_date || today;
    setBulkEntries((current) => [
      ...current,
      {
        ...emptyForm,
        scheduled_date: addDays(lastDate, 1),
        author_name: defaultAuthorName,
      },
    ]);
  };

  const updateBulkEntry = (
    index: number,
    key: keyof DailyWordPayload,
    value: string
  ) => {
    setBulkEntries((current) =>
      current.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [key]: value } : entry
      )
    );
  };

  const removeBulkEntry = (index: number) => {
    setBulkEntries((current) =>
      current.length === 1
        ? current
        : current.filter((_, entryIndex) => entryIndex !== index)
    );
  };

  const handleBulkSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (bulkEntries.length > 31) {
      await Swal.fire("Kikomo", "Unaweza kupanga hadi siku 31 kwa mara moja.", "warning");
      return;
    }

    if (bulkEntries.some((entry) => !validatePayload(entry))) {
      await Swal.fire(
        "Taarifa hazijakamilika",
        "Kila mstari unahitaji tarehe, andiko, neno, maelezo na mtumaji.",
        "warning"
      );
      return;
    }

    try {
      setSaving(true);
      await bulkCreateDailyWords(bulkEntries);
      setIsBulkOpen(false);
      await loadData();
      await Swal.fire("Imefanikiwa", "Ratiba ya Neno la Siku imehifadhiwa.", "success");
    } catch (error) {
      await Swal.fire(
        "Hitilafu",
        error instanceof Error ? error.message : "Imeshindikana kuhifadhi ratiba.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (user && !canManage) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
        Huna ruhusa ya kusimamia Neno la Siku.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Neno la Siku
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Andaa, hariri na pangilia maneno ya kila siku kwa kanisa.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openBulk}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
          >
            <Upload size={16} />
            Pangilia Mwezi
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600"
          >
            <Plus size={16} />
            Ongeza
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatBox label="Jumla" value={stats.total} />
        <StatBox label="Mwezi huu" value={stats.this_month} />
        <StatBox label="Yaliyopangwa" value={stats.upcoming} />
        <StatBox label="Yaliyopita" value={stats.past} />
        <StatBox label="Leo" value={stats.today_available ? "Lipo" : "Halipo"} />
        <StatBox label="Linalofuata" value={formatDate(stats.next_scheduled_date)} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Kuanzia
            </label>
            <input
              type="date"
              className={fieldClass}
              value={filters.from}
              onChange={(event) =>
                setFilters((current) => ({ ...current, from: event.target.value }))
              }
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Hadi
            </label>
            <input
              type="date"
              className={fieldClass}
              value={filters.to}
              onChange={(event) =>
                setFilters((current) => ({ ...current, to: event.target.value }))
              }
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mpangilio
            </label>
            <select
              className={fieldClass}
              value={filters.order}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  order: event.target.value as Filters["order"],
                }))
              }
            >
              <option value="asc">Tarehe kupanda</option>
              <option value="desc">Tarehe kushuka</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tafuta
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="search"
                className={`${fieldClass} pl-9`}
                placeholder="yohana"
                value={filters.search}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    search: event.target.value,
                  }))
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400">
              <tr>
                <th className="px-5 py-3">Tarehe</th>
                <th className="px-5 py-3">Andiko</th>
                <th className="px-5 py-3">Neno</th>
                <th className="px-5 py-3">Mtumaji</th>
                <th className="px-5 py-3 text-right">Vitendo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-5 py-4" colSpan={5}>
                      <div className="h-5 rounded bg-gray-100 dark:bg-gray-800" />
                    </td>
                  </tr>
                ))
              ) : words.length ? (
                words.map((word) => (
                  <tr key={word.id} className="align-top">
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays size={15} className="text-gray-400" />
                        {formatDate(word.scheduled_date)}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-800 dark:text-gray-200">
                      {word.scripture_reference}
                    </td>
                    <td className="max-w-md px-5 py-4 text-gray-600 dark:text-gray-400">
                      <p className="line-clamp-2">{word.verse_text}</p>
                      <p className="mt-1 line-clamp-1 text-xs">{word.explanation}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                      {word.author_name}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(word)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                          aria-label="Hariri"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(word)}
                          disabled={deletingId === word.id}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/20 dark:text-red-300 dark:hover:bg-red-500/10"
                          aria-label="Futa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-5 py-12 text-center text-gray-500 dark:text-gray-400" colSpan={5}>
                    Hakuna Neno la Siku kwenye vichujio hivi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isFormOpen} onClose={closeForm} className="max-w-3xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="pr-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingWord ? "Hariri Neno la Siku" : "Ongeza Neno la Siku"}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Taarifa hizi zitaonekana kwenye dashboard ya kanisa.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tarehe
              </label>
              <input
                type="date"
                className={fieldClass}
                value={form.scheduled_date}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    scheduled_date: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Andiko
              </label>
              <input
                className={fieldClass}
                placeholder="Yohana 14:6"
                value={form.scripture_reference}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    scripture_reference: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Neno
            </label>
            <textarea
              className={`${fieldClass} min-h-28`}
              value={form.verse_text}
              onChange={(event) =>
                setForm((current) => ({ ...current, verse_text: event.target.value }))
              }
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Maelezo
            </label>
            <textarea
              className={`${fieldClass} min-h-28`}
              value={form.explanation}
              onChange={(event) =>
                setForm((current) => ({ ...current, explanation: event.target.value }))
              }
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Imetumwa na
            </label>
            {authors.length ? (
              <select
                className={fieldClass}
                value={form.author_name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    author_name: event.target.value,
                  }))
                }
              >
                <option value="">Chagua mtumaji</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.full_name}>
                    {author.full_name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className={fieldClass}
                placeholder="Mch. Emmanuel Msigwa"
                value={form.author_name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    author_name: event.target.value,
                  }))
                }
              />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeForm}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              Ghairi
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "Inahifadhi..." : "Hifadhi"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isBulkOpen} onClose={() => setIsBulkOpen(false)} className="max-w-6xl p-6">
        <form onSubmit={handleBulkSubmit} className="space-y-5">
          <div className="flex flex-col gap-3 pr-12 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Pangilia Neno la Siku
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Ongeza hadi entries 31 kwa mara moja.
              </p>
            </div>
            <button
              type="button"
              onClick={addBulkEntry}
              disabled={bulkEntries.length >= 31}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <Plus size={16} />
              Ongeza mstari
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Kuanzia tarehe
              </label>
              <input
                type="date"
                className={fieldClass}
                value={bulkEntries[0]?.scheduled_date ?? today}
                onChange={(event) => applyBulkStartDate(event.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mtumaji
              </label>
              {authors.length ? (
                <select
                  className={fieldClass}
                  value={bulkEntries[0]?.author_name ?? ""}
                  onChange={(event) => applyBulkAuthor(event.target.value)}
                >
                  <option value="">Chagua mtumaji</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.full_name}>
                      {author.full_name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className={fieldClass}
                  placeholder="Mch. Emmanuel Msigwa"
                  value={bulkEntries[0]?.author_name ?? ""}
                  onChange={(event) => applyBulkAuthor(event.target.value)}
                />
              )}
            </div>
          </div>

          <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
            {bulkEntries.map((entry, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Siku {index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeBulkEntry(index)}
                    disabled={bulkEntries.length === 1}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-40 dark:text-red-300 dark:hover:bg-red-500/10"
                    aria-label="Ondoa mstari"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
                  <input
                    type="date"
                    className={fieldClass}
                    value={entry.scheduled_date}
                    onChange={(event) =>
                      updateBulkEntry(index, "scheduled_date", event.target.value)
                    }
                  />
                  <input
                    className={fieldClass}
                    placeholder="Andiko"
                    value={entry.scripture_reference}
                    onChange={(event) =>
                      updateBulkEntry(index, "scripture_reference", event.target.value)
                    }
                  />
                  {authors.length ? (
                    <select
                      className={fieldClass}
                      value={entry.author_name}
                      onChange={(event) =>
                        updateBulkEntry(index, "author_name", event.target.value)
                      }
                    >
                      <option value="">Chagua mtumaji</option>
                      {authors.map((author) => (
                        <option key={author.id} value={author.full_name}>
                          {author.full_name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className={fieldClass}
                      placeholder="Imetumwa na"
                      value={entry.author_name}
                      onChange={(event) =>
                        updateBulkEntry(index, "author_name", event.target.value)
                      }
                    />
                  )}
                  <input
                    className={fieldClass}
                    placeholder="Neno fupi"
                    value={entry.verse_text}
                    onChange={(event) =>
                      updateBulkEntry(index, "verse_text", event.target.value)
                    }
                  />
                </div>
                <textarea
                  className={`${fieldClass} mt-3 min-h-20`}
                  placeholder="Maelezo"
                  value={entry.explanation}
                  onChange={(event) =>
                    updateBulkEntry(index, "explanation", event.target.value)
                  }
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsBulkOpen(false)}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              Ghairi
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
            >
              <Upload size={16} />
              {saving ? "Inahifadhi..." : "Hifadhi ratiba"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
