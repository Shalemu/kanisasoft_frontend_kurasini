"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { apiFetch } from "@/lib/api";

interface MarriageMember {
  id?: number;
  member_id?: number;
  user_id?: number;
  full_name: string;
  membership_number?: string | null;
}

interface Marriage {
  id: number | string;
  husband?: MarriageMember | null;
  wife?: MarriageMember | null;
  husband_name?: string | null;
  wife_name?: string | null;
  husband_id?: number | null;
  wife_id?: number | null;
  married_at?: string | null;
  marriage_date?: string | null;
  source?: string | null;
}

interface MarriageSummary {
  total_marriages?: number;
}

interface SearchableSelectProps {
  label: string;
  placeholder: string;
  options: MarriageMember[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const fieldClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:ring-blue-500/10";

function optionValue(option: MarriageMember) {
  return option.member_id?.toString() ?? "";
}

function optionLabel(option: MarriageMember) {
  return [option.full_name, option.membership_number ? `(${option.membership_number})` : ""]
    .filter(Boolean)
    .join(" ");
}

function SearchableSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled = false,
}: SearchableSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => optionValue(option) === value);

  const filteredOptions = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return options;

    return options.filter((option) =>
      optionLabel(option).toLowerCase().includes(search)
    );
  }, [options, query]);

  return (
    <div className="relative">
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        className={fieldClass}
        disabled={disabled}
        placeholder={placeholder}
        value={open ? query : selectedOption ? optionLabel(selectedOption) : ""}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          if (value) onChange("");
        }}
        onFocus={() => {
          setQuery("");
          setOpen(true);
        }}
      />
      {open && !disabled && (
        <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              Hakuna matokeo.
            </div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={optionValue(option)}
                type="button"
                className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/[0.06]"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onChange(optionValue(option));
                  setQuery("");
                  setOpen(false);
                }}
              >
                {optionLabel(option)}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function MemberMarriages() {
  const [husbands, setHusbands] = useState<MarriageMember[]>([]);
  const [wives, setWives] = useState<MarriageMember[]>([]);
  const [marriages, setMarriages] = useState<Marriage[]>([]);
  const [summary, setSummary] = useState<MarriageSummary>({});
  const [responseSource, setResponseSource] = useState<string | null>(null);
  const [form, setForm] = useState({ husband_id: "", wife_id: "", married_at: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  const loadOptions = async () => {
    const response = await apiFetch("/member-marriages/options");
    const options = response?.data ?? response ?? {};

    setHusbands(Array.isArray(options.husbands) ? options.husbands : []);
    setWives(Array.isArray(options.wives) ? options.wives : []);
  };

  const loadMarriages = async () => {
    const response = await apiFetch("/member-marriages");
    const payload = response?.data ?? response ?? {};
    const records = payload.marriages ?? payload.data ?? [];

    setMarriages(Array.isArray(records) ? records : []);
    setSummary(payload.summary ?? response?.summary ?? {});
    setResponseSource(payload.source ?? response?.source ?? null);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadOptions(), loadMarriages()]);
    } catch (error) {
      await Swal.fire(
        "Hitilafu",
        error instanceof Error ? error.message : "Imeshindikana kupakia ndoa za washirika.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const selectedHusband = husbands.find((husband) => optionValue(husband) === form.husband_id);
  const selectedWife = wives.find((wife) => optionValue(wife) === form.wife_id);

  const saveMarriage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedHusband?.member_id || !selectedWife?.member_id) {
      await Swal.fire("Taarifa Hazijakamilika", "Chagua mume na mke kutoka kwenye orodha.", "warning");
      return;
    }

    if (selectedHusband.member_id === selectedWife.member_id) {
      await Swal.fire("Taarifa Si Sahihi", "Mume na mke hawawezi kuwa mshirika mmoja.", "warning");
      return;
    }

    if (!form.married_at) {
      await Swal.fire("Taarifa Hazijakamilika", "Weka tarehe ya kufunga ndoa.", "warning");
      return;
    }

    try {
      setSaving(true);
      await apiFetch("/member-marriages", {
        method: "POST",
        body: {
          husband_id: selectedHusband.member_id,
          wife_id: selectedWife.member_id,
          married_at: form.married_at,
        },
      });
      setForm({ husband_id: "", wife_id: "", married_at: "" });
      await loadMarriages();
      await Swal.fire("Imefanikiwa", "Ndoa imehifadhiwa kwenye mfumo.", "success");
    } catch (error) {
      await Swal.fire(
        "Hitilafu",
        error instanceof Error ? error.message : "Imeshindikana kuhifadhi ndoa.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteMarriage = async (marriage: Marriage) => {
    const result = await Swal.fire({
      title: "Futa ndoa?",
      text: "Taarifa hii itaondolewa kwenye mfumo.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Futa",
      cancelButtonText: "Ghairi",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(marriage.id);
      await apiFetch(`/member-marriages/${marriage.id}`, { method: "DELETE" });
      await loadMarriages();
      await Swal.fire("Imefutwa", "Ndoa imeondolewa.", "success");
    } catch (error) {
      await Swal.fire(
        "Hitilafu",
        error instanceof Error ? error.message : "Imeshindikana kufuta ndoa.",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const totalMarriages = summary.total_marriages ?? marriages.length;
  const isInferredResponse = responseSource === "spouse_name";
  const husbandName = (marriage: Marriage) =>
    marriage.husband?.full_name || marriage.husband_name || "—";
  const wifeName = (marriage: Marriage) =>
    marriage.wife?.full_name || marriage.wife_name || "—";
  const marriedAt = (marriage: Marriage) => marriage.married_at || marriage.marriage_date || "";
  const isInferredMarriage = (marriage: Marriage) =>
    marriage.source === "spouse_name" || isInferredResponse;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
              Unganisha Ndoa ya Washirika
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Chagua mume na mke kutoka kwenye orodha ya washirika.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 px-4 py-3 text-sm dark:border-gray-700">
            <span className="block text-gray-500 dark:text-gray-400">Jumla ya ndoa kwenye mfumo</span>
            <span className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              {totalMarriages}
            </span>
          </div>
        </div>

        {isInferredResponse && (
          <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-200">
            Baadhi ya taarifa ni za zamani zilizokadiriwa kutoka kwenye jina la mwenzi. Tumia fomu hii kuunda ndoa iliyounganishwa vizuri kwa kuchagua washirika husika.
          </div>
        )}

        <form className="grid grid-cols-1 gap-4 lg:grid-cols-4" onSubmit={saveMarriage}>
          <SearchableSelect
            label="Mume"
            placeholder="Tafuta mume"
            options={husbands}
            value={form.husband_id}
            onChange={(husband_id) => setForm((current) => ({ ...current, husband_id }))}
            disabled={loading || saving}
          />
          <SearchableSelect
            label="Mke"
            placeholder="Tafuta mke"
            options={wives}
            value={form.wife_id}
            onChange={(wife_id) => setForm((current) => ({ ...current, wife_id }))}
            disabled={loading || saving}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tarehe ya kufunga ndoa
            </label>
            <input
              className={fieldClass}
              type="date"
              value={form.married_at}
              onChange={(event) =>
                setForm((current) => ({ ...current, married_at: event.target.value }))
              }
              disabled={loading || saving}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading || saving}
              className="h-10 w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Inahifadhi..." : "Hifadhi Ndoa"}
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#1e293b] text-white">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Mume</th>
                <th className="px-4 py-3 text-left">Mke</th>
                <th className="px-4 py-3 text-left">Tarehe ya Ndoa</th>
                <th className="px-4 py-3 text-left">Chanzo</th>
                <th className="px-4 py-3 text-left">Kitendo</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Inapakia...
                  </td>
                </tr>
              ) : marriages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Hakuna ndoa zilizounganishwa.
                  </td>
                </tr>
              ) : (
                marriages.map((marriage, index) => (
                  <tr key={marriage.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{index + 1}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-white/90">{husbandName(marriage)}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-white/90">{wifeName(marriage)}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {marriedAt(marriage) || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {isInferredMarriage(marriage) ? (
                        <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-200">
                          Zamani / inferred
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-300">
                          Imeunganishwa
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => deleteMarriage(marriage)}
                        disabled={deletingId === marriage.id}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === marriage.id ? "Inafuta..." : "Futa"}
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
  );
}
