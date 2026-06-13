'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  FaEnvelopeOpenText,
  FaFilePdf,
  FaFileExcel,
  FaCheckSquare,
  FaSquare,
  FaSearch
} from 'react-icons/fa';


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
}

const PAGE_SIZE = 10;

export default function SmsZilizotumwa() {
  const [logs, setLogs] = useState<SmsLog[]>([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const { smsSentThisMonth, smsSentLastMonth, smsSentAllTime } =
    useSmsStats(logs);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/sms/logs`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await res.json();

      if (data.status === 'success') {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    }
  };


  const normalizePhone = (phone: string) => {
    if (!phone) return '';
    return phone.replace(/^255/, '0');
  };

  const normalizeStatus = (status: string) => {
    return (status || '').toLowerCase();
  };


  const filteredLogs = useMemo(() => {
    const searchValue = search.toLowerCase().trim();
    const statusValue = statusFilter.toLowerCase();

    return logs.filter((log) => {
      const phone = normalizePhone(log.recipient);
      const message = (log.message || '').toLowerCase();
      const status = normalizeStatus(log.status);

      // search (phone OR message)
      const matchSearch =
        phone.includes(searchValue) || message.includes(searchValue);

      // status (SMART MATCHING)
      const matchStatus =
        !statusValue ||
        (statusValue === 'success' &&
          (status.includes('sent') ||
            status.includes('success') ||
            status.includes('delivered'))) ||
        (statusValue === 'failed' && status.includes('fail'));

      // date
      const matchDate =
        !dateFilter ||
        new Date(log.sent_at).toISOString().slice(0, 10) === dateFilter;

      return matchSearch && matchStatus && matchDate;
    });
  }, [logs, search, statusFilter, dateFilter]);


  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, currentPage]);

  // reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, dateFilter]);

  const [selected, setSelected] = useState<number[]>([]);

// toggle single row
const toggleOne = (id: number) => {
  setSelected((prev) =>
    prev.includes(id)
      ? prev.filter((x) => x !== id)
      : [...prev, id]
  );
};

// toggle all visible rows
const toggleAll = () => {
  const allIds = paginatedLogs.map((l) => l.id);

  if (selected.length === allIds.length) {
    setSelected([]);
  } else {
    setSelected(allIds);
  }
};

  //  STATUS BADGE 
  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();

    if (
      s.includes('sent') ||
      s.includes('success') ||
      s.includes('delivered')
    ) {
      return (
        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
          Imetumwa
        </span>
      );
    }

    if (s.includes('fail')) {
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


  const exportPDF = () => {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [['Date', 'Recipient', 'Message', 'Status']],
      body: filteredLogs.map((l) => [
        new Date(l.sent_at).toLocaleString(),
        l.recipient,
        l.message,
        l.status,
      ]),
    });

    doc.save('sms-logs.pdf');
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredLogs.map((l) => ({
        Date: new Date(l.sent_at).toLocaleString(),
        Recipient: l.recipient,
        Message: l.message,
        Status: l.status,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SMS Logs');
    XLSX.writeFile(workbook, 'sms-logs.xlsx');
  };

 
  return (
    <div className="space-y-6">

      {/* STATS  */}
<div className="grid gap-5 md:grid-cols-3">

  {/* THIS MONTH */}
  <div className="group p-5 rounded-xl border border-gray-200 bg-white
    dark:border-gray-800 dark:bg-gray-900
    hover:shadow-md hover:-translate-y-1 transition-all duration-200">

    <div className="flex items-center justify-between">

      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          SMS mwezi huu
        </p>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {smsSentThisMonth}
        </h2>
      </div>

      <div className="p-3 rounded-full border border-blue-200 bg-blue-50
        dark:border-blue-500/30 dark:bg-blue-500/10">
        <FaEnvelopeOpenText className="text-blue-600" />
      </div>

    </div>
  </div>

  {/* LAST MONTH */}
  <div className="group p-5 rounded-xl border border-gray-200 bg-white
    dark:border-gray-800 dark:bg-gray-900
    hover:shadow-md hover:-translate-y-1 transition-all duration-200">

    <div className="flex items-center justify-between">

      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          SMS mwezi uliopita
        </p>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {smsSentLastMonth}
        </h2>
      </div>

      <div className="p-3 rounded-full border border-indigo-200 bg-indigo-50
        dark:border-indigo-500/30 dark:bg-indigo-500/10">
        <FaEnvelopeOpenText className="text-indigo-600" />
      </div>

    </div>
  </div>

  {/* ALL TIME */}
  <div className="group p-5 rounded-xl border border-gray-200 bg-white
    dark:border-gray-800 dark:bg-gray-900
    hover:shadow-md hover:-translate-y-1 transition-all duration-200">

    <div className="flex items-center justify-between">

      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Jumla ya SMS
        </p>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {smsSentAllTime}
        </h2>
      </div>

      <div className="p-3 rounded-full border border-green-200 bg-green-50
        dark:border-green-500/30 dark:bg-green-500/10">
        <FaEnvelopeOpenText className="text-green-600" />
      </div>

    </div>
  </div>

</div>

      {/*  FILTERS  */}
<div className="flex flex-col md:flex-row md:items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">

  {/* SEARCH */}
  <div className="flex items-center w-full md:w-1/2">
    <div className="flex items-center w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
      <FaSearch className="text-gray-400 mr-2" />
      <input
        type="text"
        placeholder="Tafuta kwa namba au ujumbe..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full outline-none bg-transparent text-gray-700 dark:text-white/90"
      />
    </div>
  </div>

  {/* STATUS */}
  <div className="w-full md:w-1/4">
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-white/90 focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Status zote</option>
      <option value="success">Imetumwa</option>
      <option value="failed">Imeshindikana</option>
    </select>
  </div>

  {/* DATE */}
  <div className="w-full md:w-1/4">
    <input
      type="date"
      value={dateFilter}
      onChange={(e) => setDateFilter(e.target.value)}
      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-white/90 focus:ring-2 focus:ring-blue-500"
    />
  </div>

</div>

      {/*  EXPORT ACTIONS  */}
<div className="flex justify-end mb-4">

  <div className="flex gap-3 p-2 rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">

    <button
      onClick={exportPDF}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition dark:border-red-500/30 dark:hover:bg-red-500/10"
    >
      <FaFilePdf className="text-red-600" />
     Pakua sms logs PDF
    </button>

    <button
      onClick={exportExcel}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition dark:border-green-500/30 dark:hover:bg-green-500/10"
    >
      <FaFileExcel className="text-green-600" />
      Pakua sms logs Excel
    </button>

  </div>

</div>

{/* ================= TABLE ================= */}
<div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
  

  <table className="w-full text-sm text-gray-700 dark:text-gray-300">

    <thead>
      <tr className="bg-[#1e293b] text-white">
        <th className="px-4 py-4 text-left">
          <input
            type="checkbox"
            checked={selected.length === paginatedLogs.length && paginatedLogs.length > 0}
            onChange={toggleAll}
          />
        </th>

         <th className="px-4 py-3 text-left">Tarehe</th>
        <th className="px-4 py-3 text-left">Mpokeaji</th>
        <th className="px-4 py-3 text-left">Ujumbe</th>
        <th className="px-4 py-3 text-left">Hali</th>
        <th className="px-4 py-3 text-left">Mlengwa</th>
      </tr>
    </thead>

    <tbody>
      {paginatedLogs.length === 0 ? (
        <tr>
          <td colSpan={6} className="text-center py-6 text-gray-500 dark:text-gray-400">
            Hakuna SMS zilizopatikana
          </td>
        </tr>
      ) : (
        paginatedLogs.map((log) => (
          <tr
            key={log.id}
            className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.04]"
          >
            {/* checkbox */}
            <td className="px-4 py-3">
              <input
                type="checkbox"
                checked={selected.includes(log.id)}
                onChange={() => toggleOne(log.id)}
              />
            </td>

            {/* date */}
            <td className="px-4 py-3">
              {new Date(log.sent_at).toLocaleString()}
            </td>

            {/* recipient */}
            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white/90">
              {log.recipient}
            </td>

            {/* message */}
            <td className="px-4 py-3 max-w-[220px] truncate">
              {log.message}
            </td>

            {/* status */}
            <td className="px-4 py-3">
              {getStatusBadge(log.status)}
            </td>

            {/* receiver */}
            <td className="px-4 py-3">
              {log.receiver || '—'}
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

      {/* ================= PAGINATION ================= */}
    <div className="flex items-center justify-between mt-4 text-sm text-gray-700 dark:text-gray-300">

  <button
    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
    disabled={currentPage === 1}
    className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-white/[0.05]"
  >
    Prev
  </button>

  <div className="flex items-center gap-2">
    {Array.from({ length: totalPages }).map((_, i) => (
      <button
        key={i}
        onClick={() => setCurrentPage(i + 1)}
        className={`px-3 py-1 rounded-lg border ${
          currentPage === i + 1
            ? 'bg-[#1e293b] text-white'
            : 'hover:bg-gray-100 dark:hover:bg-white/[0.05]'
        }`}
      >
        {i + 1}
      </button>
    ))}
  </div>

  <button
    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
    disabled={currentPage === totalPages}
    className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-white/[0.05]"
  >
    Next
  </button>

</div>

    </div>
  );
}