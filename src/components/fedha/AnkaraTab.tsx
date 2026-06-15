"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { useAuthUser } from "@/hooks/useAuthUser";
import Swal from "sweetalert2";
import { FaFilePdf, FaDownload, FaTrash, FaUpload, FaFileInvoiceDollar } from "react-icons/fa";

interface Invoice {
  id: number;
  title: string;
  file_path: string | null;
  download_url: string | null;
  file_type?: string | null;
  created_at: string;
  uploaded_by_role?: string | null;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("sw-TZ", { year: "numeric", month: "long", day: "numeric" });
  } catch { return dateStr; }
}

function normalizeList(res: any): Invoice[] {
  const list = res?.invoices ?? res?.data?.invoices ?? res?.data ?? res ?? [];
  return Array.isArray(list) ? list : [];
}

export default function AnkaraTab() {
  const user = useAuthUser();
  const isAdmin = ["admin", "super_admin", "mchungaji"].includes(String(user?.role ?? "").toLowerCase());

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/invoices");
      setInvoices(normalizeList(res));
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file) {
      Swal.fire("Tahadhari", "Weka kichwa cha ankara na chagua faili (PDF).", "warning");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("file", file);
      await apiFetch("/invoices", { method: "POST", body: formData });
      Swal.fire("Imefanikiwa!", "Ankara imepakiwa.", "success");
      setTitle(""); setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setShowForm(false);
      await fetch_();
    } catch (err: any) {
      Swal.fire("Hitilafu", err?.message || "Imeshindikana kupakia ankara.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number, invoiceTitle: string) => {
    const res = await Swal.fire({
      title: "Futa ankara hii?", text: `"${invoiceTitle}"`,
      icon: "warning", showCancelButton: true,
      confirmButtonText: "Futa", cancelButtonText: "Ghairi", confirmButtonColor: "#dc2626",
    });
    if (!res.isConfirmed) return;
    try {
      await apiFetch(`/invoices/${id}`, { method: "DELETE" });
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      Swal.fire("Imefutwa", "", "success");
    } catch (err: any) {
      Swal.fire("Hitilafu", err?.message || "Imeshindikana kufuta.", "error");
    }
  };

  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/api\/?$/, "");

  return (
    <div className="space-y-6">
      {/* Upload form — admin only */}
      {isAdmin && (
        <div>
          <button
            onClick={() => setShowForm((p) => !p)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1e293b] text-white rounded-lg hover:bg-[#334155] transition-colors font-medium text-sm"
          >
            <FaUpload />
            {showForm ? "Funga Fomu" : "Pakia Ankara Mpya"}
          </button>

          {showForm && (
            <form onSubmit={handleUpload} className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] max-w-lg">
              <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                <FaFileInvoiceDollar className="text-[#1e293b] dark:text-yellow-400" />
                Pakia Ankara ya Kanisasoft
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Kichwa cha Ankara *</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="mfano: Ankara ya Juni 2026"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Faili ya Ankara (PDF) *</label>
                  <label className="flex items-center gap-2 cursor-pointer px-4 py-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-[#1e293b] transition-colors text-sm text-gray-500">
                    <FaUpload />
                    {file ? file.name : "Chagua Faili PDF..."}
                    <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={uploading}
                    className="flex-1 rounded-xl bg-[#1e293b] py-3 text-sm font-semibold text-white hover:bg-[#334155] disabled:opacity-60">
                    {uploading ? "Inapakia..." : "Pakia"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)}
                    className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                    Ghairi
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Invoice list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <svg className="animate-spin h-6 w-6 mr-3 text-[#1e293b]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Inapakia ankara...
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <FaFileInvoiceDollar className="text-5xl mb-4 opacity-30" />
          <p className="text-base">Hakuna ankara zilizopakiwa bado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {invoices.map((inv) => (
            <div key={inv.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-100 dark:border-gray-700 flex flex-col hover:shadow-md transition-shadow">
              <div className="p-5 flex items-start gap-3 border-b border-gray-100 dark:border-gray-700">
                <FaFilePdf className="text-red-500 text-2xl flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 dark:text-white text-sm truncate">{inv.title}</h4>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-red-50 text-red-500 mt-1 inline-block">PDF</span>
                </div>
              </div>
              <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800 rounded-b-2xl flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{inv.uploaded_by_role ?? "Admin"}</p>
                  <p className="text-xs text-gray-400">{formatDate(inv.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  {inv.download_url ? (
                    <a href={inv.download_url}
                      download={`${inv.title}.pdf`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e293b] text-white text-xs rounded-lg hover:bg-[#334155]">
                      <FaDownload /> Pakua
                    </a>
                  ) : inv.file_path && (
                    <a href={`${baseUrl}/storage/${inv.file_path}`} target="_blank" rel="noopener noreferrer"
                      download={`${inv.title}.pdf`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e293b] text-white text-xs rounded-lg hover:bg-[#334155]">
                      <FaDownload /> Pakua
                    </a>
                  )}
                  {isAdmin && (
                    <button onClick={() => handleDelete(inv.id, inv.title)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
