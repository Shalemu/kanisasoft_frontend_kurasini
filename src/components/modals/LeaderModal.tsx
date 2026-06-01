"use client";

import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

export interface Role {
  id: number;
  title: string;
}

export interface Member {
  id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
}

interface Props {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;

  roles: Role[];
  members: Member[];
  selectedMember: Member | null;

  onSaved: () => void;
}

export default function LeaderModal({
  isOpen,
  setIsOpen,
  roles,
  members,
  selectedMember,
  onSaved,
}: Props) {
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedRoleIds([]);
    }
  }, [isOpen]);

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleSave = async () => {
    if (!selectedMember) return;

    if (selectedRoleIds.length === 0) {
      Swal.fire("Tahadhari", "Chagua angalau nafasi moja", "warning");
      return;
    }

    try {
      setLoading(true);

      await apiFetch("/leaders", {
        method: "POST",
        body: JSON.stringify({
          user_id: selectedMember.id,
          role_ids: selectedRoleIds,
        }),
      });

      Swal.fire("Imefanikiwa", "Kiongozi ameongezwa", "success");

      onSaved();
      closeModal();
    } catch (err: any) {
      Swal.fire("Error", err?.message || "Imeshindikana", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !selectedMember) return null;

  return (
    <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
      {/* BACKDROP */}
      <div className="fixed inset-0 bg-black/40" />

      {/* MODAL */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-lg p-6 shadow-lg">

          <h2 className="text-lg font-bold mb-4">
            Ongeza Kiongozi
          </h2>

          {/* Selected member */}
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <p className="font-medium">
              {selectedMember.full_name}
            </p>
            <p className="text-sm text-gray-500">
              {selectedMember.phone || "—"}
            </p>
          </div>

          {/* Roles */}
          <label className="block mb-2 font-medium">
            Chagua Nafasi
          </label>

          <select
            multiple
            className="w-full border rounded p-2 h-32 mb-4"
            value={selectedRoleIds.map(String)}
            onChange={(e) => {
              const values = Array.from(
                e.target.selectedOptions,
                (opt) => Number(opt.value)
              );
              setSelectedRoleIds(values);
            }}
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 border rounded"
            >
              Ghairi
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {loading ? "Inahifadhi..." : "Hifadhi"}
            </button>
          </div>

        </div>
      </div>
    </Dialog>
  );
}