"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  User,
  FileText,
  Pencil,
  Trash2,
  ExternalLink,
  PlayCircle,
} from "lucide-react";

import { deletePreaching } from "../services/Preachings/PreachingService";
import { Preaching } from "../types/Paymentaccounts/Preachings/preaching";
import { usePreachings } from "@/hooks/Preachings/usePreachings";
import Swal from "sweetalert2";

interface Props {
  search: string;
  canManage: boolean;
  onEdit?: (preaching: Preaching) => void;
}

export default function PreachingList({
  search,
  canManage,
  onEdit,
}: Props) {
  const { preachings, loading, refresh } = usePreachings();

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return preachings.filter((item: Preaching) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.preacher_name.toLowerCase().includes(q)
      );
    });
  }, [preachings, search]);
  
  const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("sw-TZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

  const handleDelete = async (id: number) => {

  const result = await Swal.fire({
    title: "Futa Mahubiri?",
    text: "Una uhakika unataka kufuta mahubiri haya?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ndiyo, futa",
    cancelButtonText: "Ghairi",
  });


  if (!result.isConfirmed) return;


  try {

    setDeletingId(id);

    await deletePreaching(id);

    await Swal.fire({
      title: "Imefutwa!",
      text: "Mahubiri yamefutwa vizuri.",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });

    refresh();


  } catch (error) {

    console.error(error);

    Swal.fire({
      title: "Imeshindikana!",
      text: "Imeshindikana kufuta mahubiri.",
      icon: "error",
    });


  } finally {

    setDeletingId(null);

  }
};
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center">
        Inapakia Mahubiri...
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
        Hakuna mahubiri yaliyopatikana.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {filtered.map((item: Preaching) => (
        <div
          key={item.id}
          className="bg-white rounded-xl shadow border p-6"
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {item.title}
              </h2>

              <div className="flex flex-wrap gap-6 mt-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>{item.preacher_name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                <span>{formatDate(item.date)}</span>
                </div>
              </div>
            </div>

            {canManage && (
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit?.(item)}
                  className="h-10 w-10 rounded-lg border hover:bg-blue-50 text-blue-600 flex items-center justify-center transition"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="h-10 w-10 rounded-lg border hover:bg-red-50 text-red-600 flex items-center justify-center transition disabled:opacity-50"
                >
                  {deletingId === item.id ? (
                    <span className="text-xs">...</span>
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <div className="mt-5">
              <p className="text-gray-700 leading-7">
                {item.description}
              </p>
            </div>
          )}

          {/* Files */}
          <div className="mt-6 flex flex-wrap gap-3">
            {item.pdf_url && (
              <a
                href={item.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition"
              >
                <FileText size={18} />
                Fungua PDF
              </a>
            )}

            {item.video_link && (
              <a
                href={item.video_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                <PlayCircle size={18} />
                Tazama Video
                <ExternalLink size={15} />
              </a>
            )}
          </div>

          {/* Status */}
          <div className="mt-5">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                item.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {item.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}