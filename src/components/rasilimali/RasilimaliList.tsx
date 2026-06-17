"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";
import PdfViewerModal from "@/components/common/PdfViewerModal";
import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFile,
  FaLink,
  FaDownload,
  FaTrash,
  FaExternalLinkAlt,
  FaEye,
} from "react-icons/fa";

interface Resource {
  id: number;
  title: string;
  description: string | null;
  link: string | null;
  file_path: string | null;
  view_url: string | null;
  download_url: string | null;
  file_type: string | null;
  uploaded_by_role: string | null;
  created_at: string;
}

interface Props {
  searchTerm: string;
  refreshKey: number;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("sw-TZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function FileIcon({ fileType }: { fileType: string | null }) {
  const t = (fileType ?? "").toLowerCase();
  if (t.includes("pdf")) return <FaFilePdf className="text-red-500 text-2xl" />;
  if (t.includes("word") || t.includes("doc"))
    return <FaFileWord className="text-blue-500 text-2xl" />;
  if (t.includes("excel") || t.includes("xls") || t.includes("spreadsheet"))
    return <FaFileExcel className="text-green-600 text-2xl" />;
  return <FaFile className="text-gray-400 text-2xl" />;
}

function FileTypeBadge({ fileType }: { fileType: string | null }) {
  const t = (fileType ?? "").toLowerCase();
  if (t.includes("pdf"))
    return (
      <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-600 font-medium">
        PDF
      </span>
    );
  if (t.includes("word") || t.includes("doc"))
    return (
      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600 font-medium">
        Word
      </span>
    );
  if (t.includes("excel") || t.includes("xls"))
    return (
      <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 font-medium">
        Excel
      </span>
    );
  return null;
}

export default function RasilimaliList({ searchTerm, refreshKey }: Props) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewModalUrl, setViewModalUrl] = useState("");
  const [viewModalTitle, setViewModalTitle] = useState("");
  const [viewModalDownloadUrl, setViewModalDownloadUrl] = useState<string | null>(null);
  const [viewModalFileName, setViewModalFileName] = useState("");

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/rasilimali");
      setResources(Array.isArray(data) ? data : data?.data ?? []);
    } catch (err: any) {
      Swal.fire("Hitilafu", err?.message || "Imeshindwa kupakia rasilimali.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources, refreshKey]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return resources;
    return resources.filter((r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [resources, searchTerm]);

  const handleDelete = async (id: number, title: string) => {
    const result = await Swal.fire({
      title: "Una uhakika?",
      text: `Unataka kufuta "${title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1e293b",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ndio, Futa",
      cancelButtonText: "Hapana",
    });

    if (!result.isConfirmed) return;

    try {
      await apiFetch(`/rasilimali/${id}`, { method: "DELETE" });
      setResources((prev) => prev.filter((r) => r.id !== id));
      Swal.fire("Imefutwa!", "Rasilimali imefutwa.", "success");
    } catch (err: any) {
      Swal.fire("Hitilafu", err?.message || "Imeshindwa kufuta rasilimali.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <svg className="animate-spin h-6 w-6 mr-3 text-[#1e293b]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Inapakia rasilimali...
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <FaFile className="text-5xl mb-4 opacity-40" />
        <p className="text-base font-medium">
          {searchTerm ? `Hakuna rasilimali zenye kichwa "${searchTerm}"` : "Hakuna rasilimali bado."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <FaFile className="text-5xl mb-4 opacity-40" />
          <p className="text-base font-medium">
            {searchTerm ? `Hakuna rasilimali zenye kichwa "${searchTerm}"` : "Hakuna rasilimali bado."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-[#1e293b] text-white text-left">
              <tr>
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-5 py-3 font-medium">JINA</th>
                <th className="px-5 py-3 font-medium">AINA</th>
                <th className="px-5 py-3 font-medium">MAELEZO</th>
                <th className="px-5 py-3 font-medium">TAREHE</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((resource, index) => {
                const fileExt = resource.file_path?.substring(resource.file_path.lastIndexOf(".")) || "";
                const directUrl = resource.view_url
                  ? resource.view_url
                  : resource.file_path
                  ? `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api$/, "")}/${resource.file_path}`
                  : resource.link || "";
                return (
                  <tr key={resource.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{index + 1}</td>
                    <td className="px-5 py-4 font-medium text-gray-800 dark:text-white">
                      {resource.title}
                    </td>
                    <td className="px-5 py-4">
                      <FileTypeBadge fileType={resource.file_type} />
                      {!resource.file_type && resource.link && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600 font-medium">Link</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                      {resource.description ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {formatDate(resource.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        {directUrl && (
                          <button
                            onClick={() => {
                              setViewModalUrl(directUrl);
                              setViewModalTitle(resource.title);
                              setViewModalDownloadUrl(resource.download_url ?? (resource.file_path ? `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api$/, "")}/${resource.file_path}` : null));
                              setViewModalFileName(`${resource.title}${fileExt}`);
                              setViewModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1e293b] hover:bg-[#334155] text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            <FaEye /> Tazama
                          </button>
                        )}
                        {resource.download_url ? (
                          <a href={resource.download_url}
                            download={`${resource.title}${resource.file_path?.substring(resource.file_path.lastIndexOf(".")) || ""}`}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg transition-colors">
                            <FaDownload /> Pakua
                          </a>
                        ) : resource.file_path ? (
                          <a href={`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api$/, "")}/${resource.file_path}`}
                            download={`${resource.title}${resource.file_path?.substring(resource.file_path.lastIndexOf(".")) || ""}`}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg transition-colors">
                            <FaDownload /> Pakua
                          </a>
                        ) : resource.link ? (
                          <a href={resource.link} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg transition-colors">
                            <FaExternalLinkAlt /> Pakua
                          </a>
                        ) : null}
                        <button onClick={() => handleDelete(resource.id, resource.title)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Futa">
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
      )}
      <PdfViewerModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        url={viewModalUrl}
        title={viewModalTitle}
        downloadUrl={viewModalDownloadUrl}
        fileName={viewModalFileName}
      />
    </div>
  );
}
