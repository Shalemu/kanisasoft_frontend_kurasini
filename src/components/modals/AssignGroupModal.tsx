"use client";

import { Dialog } from "@headlessui/react";
import { useState } from "react";
import Swal from "sweetalert2";
import { apiFetch } from "@/lib/api";

interface Group {
  id: number;
  name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  selectedMembers: number[];
  members: any[];
  onSuccess: () => void;
}

export default function AssignGroupModal({
  isOpen,
  onClose,
  groups,
  selectedMembers,
  members,
  onSuccess,
}: Props) {
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  

  const handleAssign = async () => {
  if (selectedGroupIds.length === 0 || selectedMembers.length === 0) {
    Swal.fire("Tahadhari", "Chagua kundi na mshirika", "warning");
    return;
  }

  setLoading(true);

  try {
    for (const memberId of selectedMembers) {
      const user = members.find((m) => m.id === memberId);

 
      if (!user) continue;

      if (user.membership_status !== "active") {
        Swal.fire(
          "Haikuruhusiwa",
          `${user.full_name} si mshirika aliyeidhinishwa`,
          "warning"
        );
        continue;
      }

      if (!user.membership_number) continue;

      for (const groupId of selectedGroupIds) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/${groupId}/add-member`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              membership_number: user.membership_number,
            }),
          }
        );
      }
    }

    Swal.fire("Imefanikiwa", "Washirika wameongezwa kwenye kundi", "success");

    onSuccess();
    onClose();
    setSelectedGroupIds([]);
  } catch (err) {
    Swal.fire("Error", "Imeshindikana", "error");
  } finally {
    setLoading(false);
  }
};
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg w-full max-w-md">
          <h2 className="font-bold mb-4">Chagua Makundi</h2>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {groups.map((g) => (
              <label key={g.id} className="flex gap-2">
                <input
                  type="checkbox"
                  checked={selectedGroupIds.includes(g.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedGroupIds([...selectedGroupIds, g.id]);
                    } else {
                      setSelectedGroupIds(
                        selectedGroupIds.filter((id) => id !== g.id)
                      );
                    }
                  }}
                />
                {g.name}
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-5">
            <button onClick={onClose} className="border px-3 py-2 rounded">
              Ghairi
            </button>

            <button
              onClick={handleAssign}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {loading ? "Inahifadhi..." : "Hifadhi"}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}