'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import Swal from 'sweetalert2';

interface Visitor {
  id: number;
  full_name: string;
  phone: string;
  email?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;

  // ADD THIS
  selectedVisitors: Visitor[];
}

export default function SendMessageModal({
  open,
  onClose,
  selectedVisitors,
}: Props) {

  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!open) return null;


  

  const handleSend = async () => {

    if (!message.trim()) {
      Swal.fire({
  title: 'Ujumbe Unahitajika',
  text: 'Tafadhali andika ujumbe kwanza.',
  icon: 'warning',
  confirmButtonText: 'Sawa',
  confirmButtonColor: '#f59e0b',
});
      return;
    }

    setSending(true);

    try {

      let success = 0;
      let failed = 0;

      for (const visitor of selectedVisitors) {

        try {

          // const personalizedMessage = `
          // Bwana Yesu asifiwe ${visitor.full_name},

          // ${message}

          // FPCT KASULU MJINI
          // `.trim();

          const personalizedMessage = message.trim();

          const response = await apiFetch('/send-sms', {
            method: 'POST',
            body: JSON.stringify({
              phone: visitor.phone,
              email: visitor.email || '',
              name: visitor.full_name,
              message: personalizedMessage,
              send_email: !!visitor.email,
            }),
          });

          if (response.status === 'success') {
            success++;
          } else {
            failed++;
          }

        } catch (err) {
          console.error(err);
          failed++;
        }
      }

    Swal.fire({
  title: failed > 0 ? 'Imekamilika Kwa Sehemu' : 'Imefanikiwa',
  text: `${success} ujumbe umetumwa successfully.${failed ? ` ${failed} imeshindikana.` : ''}`,
  icon: failed > 0 ? 'warning' : 'success',
  confirmButtonText: 'Sawa',
  confirmButtonColor: '#2563eb',
});

      setMessage('');
      onClose();

    } catch (error) {

      console.error(error);
      Swal.fire({
  title: 'Tatizo',
  text: 'Hitilafu wakati wa kutuma ujumbe.',
  icon: 'error',
  confirmButtonText: 'Sawa',
  confirmButtonColor: '#dc2626',
});

    } finally {

      setSending(false);

    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

      <div className="bg-white rounded-2xl w-full max-w-lg p-6">

        <div className="flex items-center justify-between mb-5">

          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Tuma Ujumbe
            </h2>

            <p className="text-sm text-gray-500">
              Wageni waliochaguliwa: {selectedVisitors.length}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500"
          >
            ✕
          </button>
        </div>

        <textarea
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Andika ujumbe hapa..."
          className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex justify-end gap-3 mt-5">

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700"
          >
            Ghairi
          </button>

          <button
            onClick={handleSend}
            disabled={sending}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            {sending ? 'Inatuma...' : 'Tuma Ujumbe'}
          </button>

        </div>

      </div>
    </div>
  );
}