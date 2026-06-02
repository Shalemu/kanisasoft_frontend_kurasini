'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';
import { VisitorModel } from './visitorModel';


interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddVisitorModal({
  open,
  onClose,
  onSuccess,
}: Props) {

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    church_origin: '',
    visit_date: new Date().toISOString().split('T')[0],
    prayer: false,
    salvation: false,
    joining: false,
    travel: false,
    other: '',
  });

  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const resetForm = () => {
    setForm({
      full_name: '',
      phone: '',
      church_origin: '',
      visit_date: new Date().toISOString().split('T')[0],
      prayer: false,
      salvation: false,
      joining: false,
      travel: false,
      other: '',
    });
  };

  const handleAddVisitor = async () => {
    if (!form.full_name || !form.phone || !form.church_origin) {
      Swal.fire({
        icon: 'warning',
        title: 'Taarifa hazijakamilika',
        text: 'Tafadhali jaza taarifa zote muhimu.',
      });
      return;
    }

    setLoading(true);

    try {
      await VisitorModel.add(form);

      Swal.fire({
        icon: 'success',
        title: 'Imefanikiwa',
        text: 'Mgeni ameongezwa kikamilifu.',
      });

      resetForm();
      onSuccess();
      onClose();

    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: 'error',
        title: 'Hitilafu',
        text: 'Imeshindikana kuhifadhi mgeni.',
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

      <div className="bg-white rounded-2xl w-full max-w-lg p-6 text-gray-800 dark:bg-gray-900 dark:text-white/90">

        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white/90">
          Ongeza Mgeni
        </h2>

        {/* FORM */}
        <div className="space-y-3">

          <input
            className="w-full border border-gray-300 bg-white p-2 rounded-lg text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500"
            placeholder="Jina kamili"
            value={form.full_name}
            onChange={(e) =>
              setForm({ ...form, full_name: e.target.value })
            }
          />

          <input
            className="w-full border border-gray-300 bg-white p-2 rounded-lg text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500"
            placeholder="Simu"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />

          <input
            className="w-full border border-gray-300 bg-white p-2 rounded-lg text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500"
            placeholder="Kanisa"
            value={form.church_origin}
            onChange={(e) =>
              setForm({ ...form, church_origin: e.target.value })
            }
          />

        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 mt-5">

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
          >
            Ghairi
          </button>

          <button
            onClick={handleAddVisitor}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            {loading ? 'Inahifadhi...' : 'Hifadhi'}
          </button>

        </div>

      </div>

    </div>
  );
}
