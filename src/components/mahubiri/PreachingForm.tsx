"use client";

import { useState } from "react";

import { Preaching } from "../types/Paymentaccounts/Preachings/preaching";
import { createPreaching, updatePreaching } from "../services/Preachings/PreachingService";
import Swal from "sweetalert2";


interface Props {
  preaching?: Preaching | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const MAX_PDF_SIZE_MB = 5;
const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;

export default function PreachingForm({
  preaching,
  onSuccess,
  onCancel,
}: Props) {
  const editing = !!preaching;

  const [loading, setLoading] = useState(false);

  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    date: preaching?.date || "",
    preacher_name: preaching?.preacher_name || "",
    title: preaching?.title || "",
    description: preaching?.description || "",
    video_link: preaching?.video_link || "",
    is_active: preaching?.is_active ?? true,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  if (pdfFile && pdfFile.size > MAX_PDF_SIZE_BYTES) {
    Swal.fire({
      icon: "warning",
      title: "Faili ni kubwa mno!",
      text: `Ukubwa wa PDF usizidi MB ${MAX_PDF_SIZE_MB}.`,
    });
    return;
  }

  try {
    setLoading(true);

    const data = new FormData();

    data.append("date", form.date);
    data.append(
      "preacher_name",
      form.preacher_name
    );
    data.append("title", form.title);

    data.append(
      "description",
      form.description
    );

    data.append(
      "video_link",
      form.video_link
    );

    data.append(
      "is_active",
      form.is_active ? "1" : "0"
    );

    if (pdfFile) {
      data.append("pdf_file", pdfFile);
    }
    if (editing) {
      data.append("_method", "PUT");
      await updatePreaching(
        preaching!.id,
        data
      );
      await Swal.fire({
        icon: "success",
        title: "Imesasishwa!",
        text: "Mahubiri yamebadilishwa vizuri.",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {

      await createPreaching(data);
      await Swal.fire({
        icon: "success",
        title: "Imehifadhiwa!",
        text: "Mahubiri yameongezwa vizuri.",
        timer: 1500,
        showConfirmButton: false,
      });

    }
    onSuccess();
  } catch (error: any) {
    console.error(error);
    Swal.fire({
      icon: "error",
      title: "Imeshindikana!",
      text:
        error?.data?.message ||
        error?.message ||
        "Kuna tatizo wakati wa kuhifadhi.",
    });


  } finally {
    setLoading(false);
  }
};
  return (
    <div className="bg-white rounded-xl shadow p-6 dark:bg-white/3">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white/90">
        {editing
          ? "Hariri Mahubiri"
          : "Ongeza Mahubiri"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          required
        />

        <input
          type="text"
          name="preacher_name"
          value={form.preacher_name}
          onChange={handleChange}
          placeholder="Jina la Mhubiri"
          className="w-full border rounded-lg px-4 py-2 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          required
        />

        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Kichwa cha Mahubiri"
          className="w-full border rounded-lg px-4 py-2 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          required
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={5}
          placeholder="Maelezo ya mahubiri..."
          className="w-full border rounded-lg px-4 py-2 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
            PDF ya Mahubiri
          </label>

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;

              if (file && file.size > MAX_PDF_SIZE_BYTES) {
                Swal.fire({
                  icon: "warning",
                  title: "Faili ni kubwa mno!",
                  text: `Ukubwa wa PDF usizidi MB ${MAX_PDF_SIZE_MB}. Faili ulilochagua ni MB ${(
                    file.size /
                    (1024 * 1024)
                  ).toFixed(1)}.`,
                });

                e.target.value = "";
                setPdfFile(null);
                return;
              }

              setPdfFile(file);
            }}
            className="w-full border rounded-lg px-4 py-2 text-gray-800 dark:border-gray-700 dark:text-gray-200"
          />

          <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
            Kiwango cha juu: PDF hadi MB {MAX_PDF_SIZE_MB}.
          </p>

          {editing &&
            preaching?.pdf_file && (
              <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">
                PDF tayari ipo.
              </p>
            )}
        </div>

        <input
          type="url"
          name="video_link"
          value={form.video_link}
          onChange={handleChange}
          placeholder="https://youtube.com/..."
          className="w-full border rounded-lg px-4 py-2 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />

        <label className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                is_active: e.target.checked,
              }))
            }
          />

          Active
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            {loading
              ? "Inahifadhi..."
              : editing
              ? "Update"
              : "Save"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="border px-6 py-2 rounded-lg text-gray-800 dark:border-gray-700 dark:text-gray-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}