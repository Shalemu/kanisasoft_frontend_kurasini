'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  FaEnvelopeOpenText,
  FaFilePdf,
  FaFileExcel,
  FaTrash,
  FaCheckSquare,
  FaSquare,
} from 'react-icons/fa';

import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { useSmsStats } from '@/hooks/useSmsStats';

interface SmsLog {
  id: number;
  recipient: string;
  message: string;
  status: string;
  sent_at: string;
  receiver?: string | null;
  reason?: string | null;
}

export default function SmsZilizotumwa() {
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  // FILTERS
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const { smsSentThisMonth, smsSentAllTime } = useSmsStats(logs);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/sms/logs`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    const data = await res.json();
    if (data.status === 'success') setLogs(data.logs || []);
  };

  // ================= STATUS BADGE =================
  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();

    if (s.includes('success') || s.includes('sent') || s.includes('delivered')) {
      return (
        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
          Imetumwa
        </span>
      );
    }

    if (s.includes('failed')) {
      return (
        <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
          Imeshindikana
        </span>
      );
    }

    return (
      <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">
        {status}
      </span>
    );
  };

  // ================= FILTER LOGS =================
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        log.recipient.toLowerCase().includes(search.toLowerCase()) ||
        log.message.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        !statusFilter ||
        log.status.toLowerCase().includes(statusFilter.toLowerCase());

      const matchDate =
        !dateFilter ||
        new Date(log.sent_at).toISOString().slice(0, 10) === dateFilter;

      return matchSearch && matchStatus && matchDate;
    });
  }, [logs, search, statusFilter, dateFilter]);

  // ================= EXPORT PDF =================
  const exportPDF = () => {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [['Tarehe', 'Mpokeaji', 'Ujumbe', 'Hali', 'Mlengwa']],
      body: filteredLogs.map((l) => [
        new Date(l.sent_at).toLocaleString(),
        l.recipient,
        l.message,
        l.status,
        l.receiver || '-',
      ]),
    });

    doc.save('sms-logs.pdf');
  };

  // ================= EXPORT EXCEL =================
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredLogs.map((l) => ({
        Date: new Date(l.sent_at).toLocaleString(),
        Recipient: l.recipient,
        Message: l.message,
        Status: l.status,
        Receiver: l.receiver || '-',
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SMS Logs');
    XLSX.writeFile(workbook, 'sms-logs.xlsx');
  };

  // ================= DELETE SELECTED =================
  const deleteSelected = async () => {
    if (selected.length === 0) return;

    const confirm = await Swal.fire({
      icon: 'warning',
      title: `Futa SMS ${selected.length}?`,
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sms/logs/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ ids: selected }),
    });

    setLogs((prev) => prev.filter((l) => !selected.includes(l.id)));
    setSelected([]);
  };

  const toggleAll = () => {
    if (selected.length === filteredLogs.length) {
      setSelected([]);
    } else {
      setSelected(filteredLogs.map((l) => l.id));
    }
  };

  const toggleOne = (id: number) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border p-4 rounded-xl bg-blue-50">
          <FaEnvelopeOpenText className="text-blue-600" />
          <p>Mwezi huu</p>
          <h2 className="text-2xl font-bold">{smsSentThisMonth}</h2>
        </div>

        <div className="border p-4 rounded-xl bg-green-50">
          <FaEnvelopeOpenText className="text-green-600" />
          <p>Jumla</p>
          <h2 className="text-2xl font-bold">{smsSentAllTime}</h2>
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="flex flex-wrap gap-3">

        <input
          type="text"
          placeholder="Tafuta ujumbe..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Status zote</option>
          <option value="success">Imetumwa</option>
          <option value="failed">Imeshindikana</option>
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border p-2 rounded"
        />

      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex gap-3">

        <button
          onClick={exportPDF}
          className="bg-red-600 text-white px-3 py-2 rounded flex items-center gap-2"
        >
          <FaFilePdf /> PDF
        </button>

        <button
          onClick={exportExcel}
          className="bg-green-600 text-white px-3 py-2 rounded flex items-center gap-2"
        >
          <FaFileExcel /> Excel
        </button>

        {selected.length > 0 && (
          <button
            onClick={deleteSelected}
            className="bg-gray-800 text-white px-3 py-2 rounded flex items-center gap-2"
          >
            <FaTrash /> Futa ({selected.length})
          </button>
        )}

      </div>

      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto border rounded-xl">

        <table className="w-full text-sm">

          <thead className="bg-gray-100">
            <tr>

              <th onClick={toggleAll} className="p-2 cursor-pointer">
                {selected.length === filteredLogs.length ? (
                  <FaCheckSquare />
                ) : (
                  <FaSquare />
                )}
              </th>

              <th className="p-2">Date</th>
              <th className="p-2">Recipient</th>
              <th className="p-2">Message</th>
              <th className="p-2">Status</th>
              <th className="p-2">Receiver</th>

            </tr>
          </thead>

          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} className="border-t">

                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(log.id)}
                    onChange={() => toggleOne(log.id)}
                  />
                </td>

                <td className="p-2">
                  {new Date(log.sent_at).toLocaleString()}
                </td>

                <td className="p-2">{log.recipient}</td>

                <td className="p-2 max-w-[200px] truncate">
                  {log.message}
                </td>

                <td className="p-2">
                  {getStatusBadge(log.status)}
                </td>

                <td className="p-2">{log.receiver || '-'}</td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}