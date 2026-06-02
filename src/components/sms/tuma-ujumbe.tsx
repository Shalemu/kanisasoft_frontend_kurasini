'use client';

import { useEffect, useRef, useState } from 'react';
import { FaSms } from 'react-icons/fa';
import { useSendSms } from '@/hooks/useSendSms';

interface User {
  id: number;
  full_name: string;
}

interface Group {
  id: number;
  name: string;
}

export default function TumaUjumbe() {
  const [receiverType, setReceiverType] = useState('');
  const [receiverValue, setReceiverValue] = useState('');
  const [message, setMessage] = useState('');

  const [washirika, setWashirika] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [groupQuery, setGroupQuery] = useState('');

  const { sendSms, loading } = useSendSms();

  const handleSend = async () => {
    if (!receiverType || !message) {
      alert("Jaza taarifa zote");
      return;
    }

    const res = await sendSms({
      type: receiverType,
      message,
      receiver: receiverValue,
    });

    if (res?.status === "success") {
      alert("Ujumbe umetumwa");
      setMessage("");
      setReceiverValue("");
    } else {
      alert("Imeshindikana kutuma");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 rounded-2xl border border-gray-200 bg-white p-5 text-gray-800 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90">

      <h1 className="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-white/90">
        <FaSms className="text-blue-600" />
        Tuma Ujumbe
      </h1>

      {/* Receiver type */}
      <select
        value={receiverType}
        onChange={(e) => setReceiverType(e.target.value)}
        className="w-full border border-gray-300 bg-white p-2 rounded text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      >
        <option value="">-- Chagua --</option>
        <option value="all">Wote</option>
        <option value="group">Kundi</option>
        <option value="individual">Mtu mmoja</option>
      </select>

      {/* Message */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full border border-gray-300 bg-white p-2 rounded text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500"
        rows={4}
        placeholder="Andika ujumbe..."
      />

      <button
        onClick={handleSend}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
      >
        <FaSms />
        {loading ? "Inatuma..." : "Tuma Ujumbe"}
      </button>

    </div>
  );
}
