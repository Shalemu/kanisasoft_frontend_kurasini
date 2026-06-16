"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";
import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFile,
  FaLink,
  FaDownload,
  FaTrash,
  FaExternalLinkAlt,
} from "react-icons/fa";

interface Resource {
  id: number;
  title: string;
  description: string | null;
  link: string | null;
  file_path: string | null;
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {filtered.map((resource) => (
        <div
          key={resource.id}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700 flex flex-col"
        >
          {/* Card Header */}
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-start gap-3">
            {resource.file_path ? (
              <div className="flex-shrink-0 mt-0.5">
                <FileIcon fileType={resource.file_type} />
              </div>
            ) : (
              <div className="flex-shrink-0 mt-0.5">
                <FaLink className="text-[#1e293b] dark:text-slate-300 text-2xl" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-800 dark:text-white text-base leading-snug truncate">
                {resource.title}
              </h4>
              {resource.file_path && <FileTypeBadge fileType={resource.file_type} />}
            </div>
          </div>

          {/* Card Body */}
          <div className="p-5 flex-1 space-y-3">
            {resource.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                {resource.description}
              </p>
            )}

            {/* Link */}
            {resource.link && (
              <a
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 truncate"
              >
                <FaExternalLinkAlt className="flex-shrink-0" />
                <span className="truncate">{resource.link}</span>
              </a>
            )}
          </div>

          {/* Card Footer */}
          <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800 rounded-b-2xl flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {resource.uploaded_by_role ?? "Mtumiaji"}
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{formatDate(resource.created_at)}</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {resource.download_url ? (
                <a
                  href={resource.download_url}
                  download={`${resource.title}${resource.file_path?.substring(resource.file_path.lastIndexOf(".")) || ""}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e293b] text-white text-xs rounded-lg hover:bg-[#334155] transition-colors"
                >
                  <FaDownload />
                  Pakua
                </a>
              ) : resource.file_path && (
                <a
                  href={`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api$/, "")}/${resource.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`${resource.title}${resource.file_path?.substring(resource.file_path.lastIndexOf(".")) || ""}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e293b] text-white text-xs rounded-lg hover:bg-[#334155] transition-colors"
                >
                  <FaDownload />
                  Pakua
                </a>
              )}
              <button
                onClick={() => handleDelete(resource.id, resource.title)}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                title="Futa"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
