"use client";

import { useState, useRef } from "react";
import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";
import { FaFilePdf, FaFileWord, FaFileExcel, FaLink, FaUpload } from "react-icons/fa";

interface Props {
  onSuccess: () => void;
}

export default function RasilimaliForm({ onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (f: File) => {
    const name = f.name.toLowerCase();
    if (name.endsWith(".pdf")) return <FaFilePdf className="text-red-500" />;
    if (name.endsWith(".doc") || name.endsWith(".docx"))
      return <FaFileWord className="text-blue-500" />;
    if (name.endsWith(".xls") || name.endsWith(".xlsx"))
      return <FaFileExcel className="text-green-600" />;
    return <FaUpload className="text-gray-400" />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      Swal.fire("Hitilafu", "Tafadhali weka Kichwa cha rasilimali.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("link", link.trim());
      if (file) formData.append("file", file);

      await apiFetch("/rasilimali", {
        method: "POST",
        body: formData,
      });

      Swal.fire("Imefanikiwa!", "Rasilimali imehifadhiwa.", "success");
      setTitle("");
      setDescription("");
      setLink("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setIsOpen(false);
      onSuccess();
    } catch (err: any) {
      Swal.fire("Hitilafu", err?.message || "Imeshindwa kuhifadhi rasilimali.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#1e293b] text-white rounded-lg hover:bg-[#334155] transition-colors font-medium"
      >
        <FaUpload />
        {isOpen ? "Funga Fomu" : "Ongeza Rasilimali"}
      </button>

      {isOpen && (
        <div className="mt-4 bg-white dark:bg-gray-900 rounded-2xl shadow p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-5">
            Ongeza Rasilimali Mpya
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Kichwa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kichwa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Andika kichwa cha rasilimali..."
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e293b] dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Maelezo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Maelezo Mafupi
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Andika maelezo mafupi..."
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e293b] dark:bg-gray-800 dark:text-white resize-none"
              />
            </div>

            {/* Kiungo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaLink className="inline mr-1 text-gray-400" />
                Kiungo (Link)
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e293b] dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Faili */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Faili (PDF, Word, Excel)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-[#1e293b] transition-colors text-sm text-gray-500 dark:text-gray-400">
                  <FaUpload />
                  Chagua Faili
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                {file && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                    {getFileIcon(file)}
                    {file.name}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Inakubaliwa: PDF, Word (.doc, .docx), Excel (.xls, .xlsx)
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#1e293b] text-white rounded-lg text-sm font-medium hover:bg-[#334155] disabled:opacity-60 transition-colors"
              >
                {submitting ? "Inahifadhi..." : "Hifadhi"}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Funga
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
