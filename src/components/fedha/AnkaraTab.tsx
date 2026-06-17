"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { useAuthUser } from "@/hooks/useAuthUser";
import Swal from "sweetalert2";
import { FaFilePdf, FaDownload, FaTrash, FaUpload, FaFileInvoiceDollar, FaEye, FaSearch, FaReceipt } from "react-icons/fa";
import PdfViewerModal from "@/components/common/PdfViewerModal";

interface Invoice {
  id: number;
  invoice_number?: string | null;
  title: string;
  invoice_date?: string | null;
  due_date?: string | null;
  total?: number | string | null;
  sub_total?: number | string | null;
  credit?: number | string | null;
  status?: string | null;
  file_path: string | null;
  view_url: string | null;
  download_url: string | null;
  file_type?: string | null;
  transaction_id?: string | null;
  gateway?: string | null;
  payment_method?: string | null;
  notes?: string | null;
  created_at: string;
  uploaded_by_role?: string | null;
}

/* ============================================================
   BILLING FORM DESIGN
   -------------------------------------------------------------
   Purpose: Allow admin to record Kanisasoft subscription payments
   without uploading a PDF file. This creates a billing record
   that appears in the invoice table alongside uploaded invoices.
   
   Fields collected:
   - invoice_number : Unique invoice identifier (e.g. 471753)
   - invoice_date   : Date the invoice was issued
   - due_date       : Payment deadline
   - total          : Amount charged (TZS)
   - payment_method : How payment was made (Cash/Mobile/Bank/Cheque)
   - transaction_id : Reference number from payment gateway
   - gateway        : Payment provider (PayPal, M-Pesa, Bank, etc.)
   - status         : paid / unpaid / overdue (sent to backend as English,
                      displayed to user as Swahili: Imelipwa/Haijalipwa/Imechelewa)
   - notes          : Optional extra details
   
   Backend endpoint: POST /api/billing
   ============================================================ */
interface BillingForm {
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total: string;
  payment_method: string;
  transaction_id: string;
  gateway: string;
  status: string;
  notes: string;
}

// Default empty state for the billing form — resets after successful submission
const emptyBilling: BillingForm = {
  invoice_number: "",
  invoice_date: new Date().toISOString().slice(0, 10),
  due_date: "",
  total: "",
  payment_method: "Taslimu",
  transaction_id: "",
  gateway: "",
  status: "paid",
  notes: "",
};

function getTotal(inv: Invoice) {
  return Number(inv.total ?? inv.sub_total ?? 0) || 0;
}

function getStatusBadge(status: string | null | undefined) {
  const s = (status ?? "").toLowerCase();
  if (s === "paid" || s === "lipiwa") return { label: "Imelipwa", cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
  if (s === "unpaid" || s === "halijalipiwa") return { label: "Haijalipwa", cls: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" };
  if (s === "overdue") return { label: "Imechelewa", cls: "bg-orange-100 text-orange-600" };
  return { label: status ?? "—", cls: "bg-gray-100 text-gray-600" };
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
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [invoiceTotal, setInvoiceTotal] = useState("");
  const [invoiceStatus, setInvoiceStatus] = useState("paid");
  const [file, setFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showBillingForm, setShowBillingForm] = useState(false);
  const [billingForm, setBillingForm] = useState<BillingForm>(emptyBilling);
  const [savingBilling, setSavingBilling] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewModalUrl, setViewModalUrl] = useState("");
  const [viewModalTitle, setViewModalTitle] = useState("");
  const [viewModalDownloadUrl, setViewModalDownloadUrl] = useState<string | null>(null);

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
      if (invoiceNumber.trim()) formData.append("invoice_number", invoiceNumber.trim());
      if (invoiceDate) formData.append("invoice_date", invoiceDate);
      if (dueDate) formData.append("due_date", dueDate);
      if (invoiceTotal && Number(invoiceTotal) > 0) formData.append("total", invoiceTotal);
      formData.append("status", invoiceStatus);
      await apiFetch("/invoices", { method: "POST", body: formData });
      Swal.fire("Imefanikiwa!", "Ankara imepakiwa.", "success");
      setTitle(""); setFile(null); setInvoiceNumber(""); setInvoiceDate(new Date().toISOString().slice(0, 10)); setDueDate(""); setInvoiceTotal(""); setInvoiceStatus("paid");
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

  // Submit handler for the billing form — sends payment record to backend
  // Required fields: invoice_number, invoice_date, total
  // Status is sent in English (paid/unpaid/overdue) for backend compatibility
  const handleBillingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingForm.invoice_number.trim() || !billingForm.invoice_date || !billingForm.total || Number(billingForm.total) <= 0) {
      Swal.fire("Tahadhari", "Jaza namba ya ankara, tarehe, na jumla ya malipo.", "warning");
      return;
    }
    setSavingBilling(true);
    try {
      await apiFetch("/billing", {
        method: "POST",
        body: {
          invoice_number: billingForm.invoice_number.trim(),
          invoice_date: billingForm.invoice_date,
          due_date: billingForm.due_date || null,
          total: Number(billingForm.total),
          payment_method: billingForm.payment_method,
          transaction_id: billingForm.transaction_id.trim() || null,
          gateway: billingForm.gateway.trim() || null,
          status: billingForm.status,
          notes: billingForm.notes.trim() || null,
        },
      });
      Swal.fire("Imefanikiwa!", "Malipo yamehifadhiwa.", "success");
      setBillingForm(emptyBilling);
      setShowBillingForm(false);
      await fetch_();
    } catch (err: any) {
      Swal.fire("Hitilafu", err?.message || "Imeshindikana kuhifadhi malipo.", "error");
    } finally {
      setSavingBilling(false);
    }
  };

  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/api\/?$/, "");
  const [search, setSearch] = useState("");
  const filtered = invoices.filter((inv) =>
    inv.title.toLowerCase().includes(search.toLowerCase()) ||
    (inv.invoice_number ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
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
            <form onSubmit={handleUpload} className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                <FaFileInvoiceDollar className="text-[#1e293b] dark:text-yellow-400" />
                Pakia Ankara ya Kanisasoft
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Kichwa — full width */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium">Kichwa cha Ankara *</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="mfano: Ankara ya Juni 2026"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                </div>
                {/* Namba ya Ankara */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Namba ya Ankara</label>
                  <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="mfano: 471753"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                </div>
                {/* Jumla */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Jumla (TZS)</label>
                  <input type="number" min="0" value={invoiceTotal} onChange={(e) => setInvoiceTotal(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                </div>
                {/* Tarehe ya Ankara */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Tarehe ya Ankara</label>
                  <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                </div>
                {/* Tarehe ya Mwisho */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Tarehe ya Mwisho</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                </div>
                {/* Hali */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium">Hali ya Ankara</label>
                  <select value={invoiceStatus} onChange={(e) => setInvoiceStatus(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                    <option value="paid">Imelipwa</option>
                    <option value="unpaid">Haijalipwa</option>
                    <option value="overdue">Imechelewa</option>
                  </select>
                </div>
                {/* Faili — full width */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium">Faili ya Ankara (PDF) *</label>
                  <label className="flex items-center gap-2 cursor-pointer px-4 py-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-[#1e293b] transition-colors text-sm text-gray-500">
                    <FaUpload />
                    {file ? file.name : "Chagua Faili PDF..."}
                    <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="submit" disabled={uploading}
                  className="flex-1 rounded-xl bg-[#1e293b] py-3 text-sm font-semibold text-white hover:bg-[#334155] disabled:opacity-60">
                  {uploading ? "Inapakia..." : "Pakia Ankara"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  Ghairi
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="font-semibold text-base flex items-center gap-2">
              <FaFileInvoiceDollar className="text-[#1e293b] dark:text-yellow-400" />
              Ankara za Kanisasoft
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Zinaonyeshwa {filtered.length} kati ya {invoices.length} ankara
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 dark:border-gray-700 dark:bg-gray-900 w-full sm:w-64">
            <FaSearch className="text-gray-400 text-xs" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tafuta ankara..."
              className="w-full bg-transparent py-2.5 text-sm outline-none dark:text-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <svg className="animate-spin h-6 w-6 mr-3 text-[#1e293b]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Inapakia ankara...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FaFileInvoiceDollar className="text-5xl mb-4 opacity-30" />
            <p className="text-base">Hakuna ankara zilizopatikana.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1e293b] text-white text-left">
                <tr>
                  <th className="px-5 py-3 font-medium">ANKARA #</th>
                  <th className="px-5 py-3 font-medium">TAREHE YA ANKARA</th>
                  <th className="px-5 py-3 font-medium">TAREHE YA MWISHO</th>
                  <th className="px-5 py-3 font-medium">JUMLA</th>
                  <th className="px-5 py-3 font-medium">HALI</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const badge = getStatusBadge(inv.status);
                  const viewHref = inv.view_url
                    ? `/view-pdf?url=${encodeURIComponent(inv.view_url)}&title=${encodeURIComponent(inv.title)}`
                    : inv.file_path
                    ? `/view-pdf?url=${encodeURIComponent(`${baseUrl}/storage/${inv.file_path}`)}&title=${encodeURIComponent(inv.title)}`
                    : null;
                  return (
                    <tr key={inv.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-800 dark:text-white">
                        {inv.invoice_number ?? `#${inv.id}`}
                      </td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                        {inv.invoice_date ? formatDate(inv.invoice_date) : formatDate(inv.created_at)}
                      </td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                        {inv.due_date ? formatDate(inv.due_date) : "—"}
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-800 dark:text-white">
                        {getTotal(inv) > 0 ? `TZS ${getTotal(inv).toLocaleString()}` : "—"}
                      </td>
                      <td className="px-5 py-4">
                        {inv.status ? (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>
                            {badge.label}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          {viewHref && (
                            <button
                              onClick={() => {
                                const pdfUrl = inv.view_url
                                  ? inv.view_url
                                  : inv.file_path
                                  ? `${baseUrl}/storage/${inv.file_path}`
                                  : "";
                                setViewModalUrl(pdfUrl);
                                setViewModalTitle(inv.title);
                                setViewModalDownloadUrl(inv.download_url ?? (inv.file_path ? `${baseUrl}/storage/${inv.file_path}` : null));
                                setViewModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1e293b] hover:bg-[#334155] text-white text-xs font-semibold rounded-lg transition-colors"
                            >
                              <FaEye /> Tazama Ankara
                            </button>
                          )}
                          {(inv.download_url || inv.file_path) && (
                            <a href={inv.download_url ?? `${baseUrl}/storage/${inv.file_path}`}
                              download={`${inv.title}.pdf`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg transition-colors">
                              <FaDownload /> Pakua
                            </a>
                          )}
                          {isAdmin && (
                            <button onClick={() => handleDelete(inv.id, inv.title)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Futa">
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PdfViewerModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        url={viewModalUrl}
        title={viewModalTitle}
        downloadUrl={viewModalDownloadUrl}
        fileName={`${viewModalTitle}.pdf`}
      />
    </div>
  );
}
