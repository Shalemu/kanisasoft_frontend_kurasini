"use client";

import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { Dialog } from "@headlessui/react";
import { FaFileExcel, FaFilePdf, FaLayerGroup, FaSearch } from "react-icons/fa";
import { apiFetch } from "@/lib/api";

type FilterType = "text" | "date" | "number" | "select";

type FilterField = {
  name: string;
  label: string;
  type?: FilterType;
  options?: { value: string; label: string }[];
};

type Member = {
  id?: number;
  full_name?: string | null;
  membership_number?: string | null;
  gender?: string | null;
  phone?: string | null;
  phone_number?: string | null;
  whatsapp_number?: string | null;
  email?: string | null;
  residential_zone?: string | null;
  membership_status?: string | null;
  created_at?: string | null;
};

type SearchResponse = {
  members?: Member[];
  total?: number;
  summary?: Record<string, unknown>;
  export?: {
    columns?: string[] | Record<string, string>;
    rows?: Record<string, unknown>[];
  };
  filters?: Record<string, unknown>;
  saved_group_criteria?: Record<string, unknown> | null;
};

const yesNoOptions = [
  { value: "1", label: "Ndiyo" },
  { value: "0", label: "Hapana" },
];

const genderOptions = [
  { value: "Mwanaume", label: "Mwanaume" },
  { value: "Mwanamke", label: "Mwanamke" },
  { value: "M", label: "M" },
  { value: "F", label: "F" },
];

const monthOptions = [
  "Januari",
  "Februari",
  "Machi",
  "Aprili",
  "Mei",
  "Juni",
  "Julai",
  "Agosti",
  "Septemba",
  "Oktoba",
  "Novemba",
  "Desemba",
].map((month, index) => ({ value: String(index + 1), label: month }));

const filterSections: { title: string; fields: FilterField[] }[] = [
  {
    title: "Taarifa Binafsi",
    fields: [
      { name: "full_name", label: "Jina kamili" },
      { name: "membership_number", label: "Namba ya ushirika" },
      { name: "gender", label: "Jinsia", type: "select", options: genderOptions },
      { name: "phone_number", label: "Namba ya simu" },
      { name: "whatsapp_number", label: "WhatsApp" },
      { name: "email", label: "Barua pepe" },
      { name: "marital_status", label: "Hali ya ndoa" },
      { name: "marriage_type", label: "Aina ya ndoa" },
      { name: "spouse_name", label: "Jina la mwenza" },
      { name: "number_of_children", label: "Idadi ya watoto", type: "number" },
      { name: "has_disability", label: "Ana ulemavu", type: "select", options: yesNoOptions },
      { name: "disability_description", label: "Maelezo ya ulemavu" },
      { name: "is_authorized", label: "Ameidhinishwa", type: "select", options: yesNoOptions },
    ],
  },
  {
    title: "Kuzaliwa na Makazi",
    fields: [
      { name: "birth_date", label: "Tarehe ya kuzaliwa", type: "date" },
      { name: "birth_month", label: "Mwezi wa kuzaliwa", type: "select", options: monthOptions },
      { name: "birth_place", label: "Mahali alipozaliwa" },
      { name: "birth_region", label: "Mkoa aliozaliwa" },
      { name: "birth_district", label: "Wilaya aliozaliwa" },
      { name: "birth_ward", label: "Kata aliozaliwa" },
      { name: "birth_street", label: "Mtaa aliozaliwa" },
      { name: "residential_zone", label: "Zone ya makazi" },
      { name: "residential_ward", label: "Kata ya makazi" },
      { name: "residential_street", label: "Mtaa wa makazi" },
    ],
  },
  {
    title: "Imani na Ushirika",
    fields: [
      { name: "date_of_conversion", label: "Tarehe ya kuokoka", type: "date" },
      { name: "conversion_year", label: "Mwaka wa kuokoka", type: "number" },
      { name: "conversion_month", label: "Mwezi wa kuokoka", type: "select", options: monthOptions },
      { name: "conversion_day", label: "Siku ya kuokoka", type: "number" },
      { name: "church_of_conversion", label: "Kanisa alilookokea" },
      { name: "baptism_date", label: "Tarehe ya ubatizo", type: "date" },
      { name: "baptism_year", label: "Mwaka wa ubatizo", type: "number" },
      { name: "baptism_month", label: "Mwezi wa ubatizo", type: "select", options: monthOptions },
      { name: "baptism_day", label: "Siku ya ubatizo", type: "number" },
      { name: "baptism_place", label: "Mahali pa ubatizo" },
      { name: "baptizer_name", label: "Jina la mbatizaji" },
      { name: "baptizer_title", label: "Cheo cha mbatizaji" },
      { name: "previous_church", label: "Kanisa la awali" },
      { name: "previous_church_status", label: "Hali ya kanisa la awali" },
      { name: "tangu_lini", label: "Tangu lini" },
      { name: "church_service", label: "Huduma kanisani" },
      { name: "service_duration", label: "Muda wa huduma" },
      { name: "participates_communion", label: "Anashiriki meza ya Bwana", type: "select", options: yesNoOptions },
      { name: "verified_by", label: "Aliyethibitisha" },
      { name: "membership_start_date", label: "Tarehe ya kuanza ushirika", type: "date" },
      { name: "membership_status", label: "Status ya ushirika" },
    ],
  },
  {
    title: "Elimu, Kazi na Familia",
    fields: [
      { name: "education_level", label: "Kiwango cha elimu" },
      { name: "profession", label: "Taaluma" },
      { name: "occupation", label: "Kazi" },
      { name: "work_place", label: "Mahali pa kazi" },
      { name: "work_contact", label: "Mawasiliano ya kazi" },
      { name: "lives_alone", label: "Anaishi peke yake", type: "select", options: yesNoOptions },
      { name: "lives_with", label: "Anaishi na" },
      { name: "family_role", label: "Nafasi kwenye familia" },
      { name: "live_with_who", label: "Anaishi na nani" },
      { name: "next_of_kin", label: "Mtu wa karibu" },
      { name: "next_of_kin_phone", label: "Simu ya mtu wa karibu" },
    ],
  },
  {
    title: "Vipindi vya Tarehe",
    fields: [
      { name: "created_at_from", label: "Usajili kuanzia", type: "date" },
      { name: "created_at_to", label: "Usajili mpaka", type: "date" },
      { name: "birth_date_from", label: "Kuzaliwa kuanzia", type: "date" },
      { name: "birth_date_to", label: "Kuzaliwa mpaka", type: "date" },
      { name: "date_of_conversion_from", label: "Kuokoka kuanzia", type: "date" },
      { name: "date_of_conversion_to", label: "Kuokoka mpaka", type: "date" },
      { name: "baptism_date_from", label: "Ubatizo kuanzia", type: "date" },
      { name: "baptism_date_to", label: "Ubatizo mpaka", type: "date" },
      { name: "membership_start_date_from", label: "Ushirika kuanzia", type: "date" },
      { name: "membership_start_date_to", label: "Ushirika mpaka", type: "date" },
    ],
  },
];

const allFilterFields = filterSections.flatMap((section) => section.fields);

const emptyFilters = allFilterFields.reduce<Record<string, string>>(
  (acc, field) => ({ ...acc, [field.name]: "" }),
  { search: "" }
);

function cleanValues(values: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => String(value).trim() !== "")
  );
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Ndiyo" : "Hapana";
  return String(value);
}

function columnLabels(columns?: string[] | Record<string, string>, rows: Record<string, unknown>[] = []) {
  if (Array.isArray(columns) && columns.length) {
    return columns.map((column) => ({ key: column, label: column }));
  }

  if (columns && typeof columns === "object") {
    return Object.entries(columns).map(([key, label]) => ({ key, label: String(label) }));
  }

  const firstRow = rows[0];
  return firstRow ? Object.keys(firstRow).map((key) => ({ key, label: key })) : [];
}

export default function MemberReports() {
  const [filters, setFilters] = useState<Record<string, string>>(emptyFilters);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [savingGroup, setSavingGroup] = useState(false);
  const [groupForm, setGroupForm] = useState({
    name: "",
    leader_membership_number: "",
    whatsapp_link: "",
  });

  const members = result?.members ?? [];
  const exportRows = result?.export?.rows ?? [];
  const exportColumns = useMemo(
    () => columnLabels(result?.export?.columns, exportRows),
    [exportRows, result?.export?.columns]
  );
  const activeFilters = cleanValues(filters);
  const canExport = hasSearched && exportRows.length > 0;

  const updateFilter = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const runSearch = async () => {
    setLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams(activeFilters);
      const data = await apiFetch(`/members/search-filter${params.toString() ? `?${params.toString()}` : ""}`);
      setResult(data);
    } catch (error) {
      Swal.fire("Hitilafu", error instanceof Error ? error.message : "Imeshindikana kutafuta washirika.", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters(emptyFilters);
    setResult(null);
    setHasSearched(false);
  };

  const exportExcel = () => {
    if (!canExport) return;

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Washirika");
    XLSX.writeFile(workbook, "kutafuta-kuchuja-washirika.xlsx");
  };

  const exportPDF = () => {
    if (!canExport) return;

    const columns = exportColumns.length
      ? exportColumns
      : columnLabels(undefined, exportRows);
    const doc = new jsPDF({ orientation: "landscape" });

    doc.text("Kutafuta & Kuchuja Washirika", 14, 15);
    autoTable(doc, {
      startY: 22,
      head: [columns.map((column) => column.label)],
      body: exportRows.map((row) => columns.map((column) => displayValue(row[column.key]))),
      styles: { fontSize: 8 },
    });

    doc.save("kutafuta-kuchuja-washirika.pdf");
  };

  const openGroupModal = () => {
    if (!hasSearched) {
      Swal.fire("Tafuta kwanza", "Tengeneza kundi baada ya kutafuta au kuchuja washirika.", "info");
      return;
    }

    setGroupForm({ name: "", leader_membership_number: "", whatsapp_link: "" });
    setGroupOpen(true);
  };

  const createGroup = async () => {
    if (!groupForm.name.trim()) {
      Swal.fire("Jina linahitajika", "Weka jina la kundi.", "warning");
      return;
    }

    setSavingGroup(true);

    try {
      await apiFetch("/members/search-filter/groups", {
        method: "POST",
        body: {
          name: groupForm.name.trim(),
          leader_membership_number: groupForm.leader_membership_number.trim(),
          whatsapp_link: groupForm.whatsapp_link.trim(),
          ...activeFilters,
        },
      });

      setGroupOpen(false);
      Swal.fire("Imefanikiwa", "Kundi limetengenezwa kwa vichujio vya sasa.", "success");
    } catch (error) {
      Swal.fire("Hitilafu", error instanceof Error ? error.message : "Imeshindikana kutengeneza kundi.", "error");
    } finally {
      setSavingGroup(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Kutafuta & Kuchuja Washirika</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Tumia utafutaji huru au vichujio vya fomu ya usajili kupata matokeo kutoka backend.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportExcel}
              disabled={!canExport}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaFileExcel /> Excel
            </button>
            <button
              onClick={exportPDF}
              disabled={!canExport}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaFilePdf /> PDF
            </button>
            <button
              onClick={openGroupModal}
              disabled={!hasSearched}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaLayerGroup /> Tengeneza Kundi
            </button>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void runSearch();
            }}
            placeholder="Tafuta jina, namba, simu, email..."
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500"
          />
          <button
            onClick={runSearch}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            <FaSearch /> {loading ? "Inatafuta..." : "Tafuta"}
          </button>
          <button
            onClick={resetFilters}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Ondoa vichujio
          </button>
        </div>

        <div className="space-y-5">
          {filterSections.map((section) => (
            <details key={section.title} className="rounded-xl border border-gray-200 p-4 open:bg-gray-50 dark:border-gray-800 dark:open:bg-gray-900" open={section.title === "Vipindi vya Tarehe"}>
              <summary className="cursor-pointer text-sm font-semibold text-gray-800 dark:text-white/90">{section.title}</summary>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {section.fields.map((field) => (
                  <label key={field.name} className="space-y-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                    <span>{field.label}</span>
                    {field.type === "select" ? (
                      <select
                        value={filters[field.name] ?? ""}
                        onChange={(event) => updateFilter(field.name, event.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      >
                        <option value="">Zote</option>
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type ?? "text"}
                        value={filters[field.name] ?? ""}
                        onChange={(event) => updateFilter(field.name, event.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      />
                    )}
                  </label>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Summary title="Jumla" value={loading ? "..." : result?.total ?? 0} />
        {Object.entries(result?.summary ?? {}).slice(0, 3).map(([key, value]) => (
          <Summary key={key} title={key.replaceAll("_", " ")} value={displayValue(value)} />
        ))}
      </section>

      <section className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Namba</th>
              <th className="px-4 py-3 text-left">Jina</th>
              <th className="px-4 py-3 text-left">Jinsia</th>
              <th className="px-4 py-3 text-left">Simu</th>
              <th className="px-4 py-3 text-left">WhatsApp</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Zone</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">Inapakia...</td></tr>
            ) : !hasSearched ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">Weka kigezo kisha bonyeza Tafuta.</td></tr>
            ) : members.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">Hakuna washirika waliopatikana.</td></tr>
            ) : (
              members.map((member, index) => (
                <tr key={member.id ?? `${member.membership_number}-${index}`} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{member.membership_number || "-"}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white/90">{member.full_name || "-"}</td>
                  <td className="px-4 py-3">{member.gender || "-"}</td>
                  <td className="px-4 py-3">{member.phone_number || member.phone || "-"}</td>
                  <td className="px-4 py-3">{member.whatsapp_number || "-"}</td>
                  <td className="px-4 py-3">{member.email || "-"}</td>
                  <td className="px-4 py-3">{member.residential_zone || "-"}</td>
                  <td className="px-4 py-3">{member.membership_status || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <Dialog open={groupOpen} onClose={() => setGroupOpen(false)}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-gray-800 shadow-xl dark:bg-gray-900 dark:text-white/90">
            <h2 className="text-lg font-bold">Tengeneza Kundi</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Kundi litatumia vichujio vya sasa na litajaza washirika active wanaolingana navyo.
            </p>

            <div className="mt-5 space-y-3">
              <label className="block text-sm font-medium">
                Jina la kundi
                <input
                  value={groupForm.name}
                  onChange={(event) => setGroupForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                  required
                />
              </label>
              <label className="block text-sm font-medium">
                Namba ya ushirika ya kiongozi
                <input
                  value={groupForm.leader_membership_number}
                  onChange={(event) => setGroupForm((prev) => ({ ...prev, leader_membership_number: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </label>
              <label className="block text-sm font-medium">
                WhatsApp link
                <input
                  value={groupForm.whatsapp_link}
                  onChange={(event) => setGroupForm((prev) => ({ ...prev, whatsapp_link: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setGroupOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700"
              >
                Ghairi
              </button>
              <button
                onClick={createGroup}
                disabled={savingGroup}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {savingGroup ? "Inahifadhi..." : "Hifadhi"}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function Summary({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white/90">{value}</p>
    </div>
  );
}
