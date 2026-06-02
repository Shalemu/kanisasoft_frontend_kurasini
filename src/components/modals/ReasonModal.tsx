"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
}

const reasons = [
  "Amehama",
  "Ametegwa ushirika",
  "Amefariki",
  "Amepotea",
  "Amejisajiri kimakosa",
  "Sababu nyingine",
];

export default function ReasonModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: Props) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const handleSubmit = () => {
    const finalReason =
      selectedReason === "Sababu nyingine"
        ? customReason
        : selectedReason;

    if (!finalReason.trim()) return;

    onConfirm(finalReason);
    setSelectedReason("");
    setCustomReason("");
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/40" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg text-gray-800 dark:bg-gray-900 dark:text-white/90">

            <Dialog.Title className="text-lg font-bold mb-4 text-gray-800 dark:text-white/90">
              Sababu ya Kitendo
            </Dialog.Title>

            {/* Reasons list */}
            <div className="space-y-2">
              {reasons.map((r) => (
                <label key={r} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={selectedReason === r}
                    onChange={(e) => setSelectedReason(e.target.value)}
                  />
                  {r}
                </label>
              ))}
            </div>

            {/* Custom reason */}
            {selectedReason === "Sababu nyingine" && (
              <textarea
                className="w-full border border-gray-300 bg-white mt-3 p-2 rounded text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500"
                placeholder="Andika sababu..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
                disabled={loading}
              >
                Ghairi
              </button>

              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-red-600 text-white rounded"
                disabled={loading}
              >
                {loading ? "Inatumika..." : "Thibitisha"}
              </button>
            </div>

          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}
