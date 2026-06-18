"use client";

import { useEffect, useState } from "react";

interface RoleModalProps {
  isOpen: boolean;
  role?: any;
  onClose: () => void;
  onSave: (data: { title: string }) => void;
}

export default function RoleModal({
  isOpen,
  role,
  onClose,
  onSave,
}: RoleModalProps) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (role) {
      setTitle(role.title || "");
    } else {
      setTitle("");
    }
  }, [role]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      title,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">
            {role ? "Hariri Nafasi" : "Ongeza Nafasi"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block mb-2 font-medium">
            Jina la Nafasi
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg p-3 mb-4"
            placeholder="Mfano: Mwenyekiti"
            required
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border"
            >
              Funga
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white"
            >
              {role ? "Sasisha" : "Hifadhi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}