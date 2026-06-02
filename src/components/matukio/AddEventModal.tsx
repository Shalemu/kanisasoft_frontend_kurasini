'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';

export default function AddEventModal({
  open,
  onClose,
  onSave,
  groups,
}: any) {
  const [form, setForm] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    category: '',
  });

  if (!open) return null;

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await onSave(form);

      Swal.fire({
        icon: 'success',
        title: 'Imefanikiwa',
        text: 'Tukio limeongezwa',
        confirmButtonText: 'Sawa',
      });

      setForm({
        title: '',
        date: '',
        time: '',
        description: '',
        category: '',
      });

      onClose();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Hitilafu',
        text: 'Imeshindikana kuhifadhi',
        confirmButtonText: 'Sawa',
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-full max-w-md text-gray-800 shadow-xl dark:bg-gray-900 dark:text-white/90">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white/90">Ongeza Tukio</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            className="border border-gray-300 bg-white w-full p-2 text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500"
          />

          <input
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm({ ...form, date: e.target.value })
            }
            className="border border-gray-300 bg-white w-full p-2 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
          />

          <select
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
            className="border border-gray-300 bg-white w-full p-2 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
          >
            <option value="">Chagua Kundi</option>
            {groups.map((g: any) => (
              <option key={g.id} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>

          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="border border-gray-300 bg-white w-full p-2 text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500"
          />

          <button className="bg-green-600 text-white px-4 py-2 rounded w-full">
            Hifadhi
          </button>
        </form>
      </div>
    </div>
  );
}
