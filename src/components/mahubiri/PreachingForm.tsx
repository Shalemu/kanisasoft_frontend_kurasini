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
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-6">
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
          className="w-full border rounded-lg px-4 py-2"
          required
        />

        <input
          type="text"
          name="preacher_name"
          value={form.preacher_name}
          onChange={handleChange}
          placeholder="Jina la Mhubiri"
          className="w-full border rounded-lg px-4 py-2"
          required
        />

        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Kichwa cha Mahubiri"
          className="w-full border rounded-lg px-4 py-2"
          required
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={5}
          placeholder="Maelezo ya mahubiri..."
          className="w-full border rounded-lg px-4 py-2"
        />

        <div>
          <label className="block mb-2 text-sm font-medium">
            PDF ya Mahubiri
          </label>

          <input
            type="file"
            accept=".pdf"
            onChange={(e) =>
              setPdfFile(
                e.target.files?.[0] ?? null
              )
            }
            className="w-full border rounded-lg px-4 py-2"
          />

          {editing &&
            preaching?.pdf_file && (
              <p className="text-sm text-gray-500 mt-2">
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
          className="w-full border rounded-lg px-4 py-2"
        />

        <label className="flex items-center gap-3">
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
            className="border px-6 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}