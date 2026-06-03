'use client';

import { useState } from 'react';
import {
  FaUsers,
  FaSearch,
  FaCalendarAlt,
  FaPaperPlane,
  FaPlus,
  FaFilePdf,
  FaFileExcel,
} from 'react-icons/fa';

import Pagination from '@/components/tables/Pagination';
import SendMessageModal from '@/components/modals/SendMessageModal';

import { useVisitors } from '@/hooks/useVisitors';
import VisitorReasons from './VisitorsReason';
import SummaryCard from './SummaryCard';
import AddVisitorModal from './AddVisitorsModel';
import { apiFetch } from '@/lib/api';

import {
  exportVisitorsExcel,
  exportVisitorsPDF,
} from '@/util/visitorExport';

interface VisitorFormData {
  full_name: string;
  phone: string;
  church_origin: string;
  visit_date: string;
  prayer: boolean;
  salvation: boolean;
  joining: boolean;
  travel: boolean;
  other: string;
}

function toIsoDate(value: string | Date) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, month, day, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return value;
}

export default function WageniPage() {
  const [showMessageModal, setShowMessageModal] =
    useState(false);

  const [showAddModal, setShowAddModal] =
    useState(false);

  const {
    loading,

    search,
    setSearch,

    filterDate,
    setFilterDate,

    currentPage,
    setCurrentPage,

    totalPages,
    paginatedData,

    selectedIds,
    selectAll,

    toggleSelect,
    handleSelectAll,

    selectedVisitors,

    totalVisitors,
    totalPrayer,
    totalSalvation,
    totalJoining,
    totalTravel,

    fetchVisitors,
  } = useVisitors();

  const handleAddVisitor = async (data: VisitorFormData) => {
    try {
      await apiFetch('/guests', {
        method: 'POST',
        body: {
          ...data,
          visit_date: toIsoDate(data.visit_date),
        },
      });

      await fetchVisitors();

    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-gray-800 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 md:p-6">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

        {/* LEFT */}
        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center dark:bg-blue-500/10">
            <FaUsers className="text-blue-600 text-lg" />
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white/90">
              Wageni Waliohudhuria
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Jumla ya Wageni:
              {' '}
              {totalVisitors}
            </p>
          </div>

        </div>

        {/* RIGHT BUTTONS */}
        <div className="flex flex-wrap items-center gap-3">

          <button
            onClick={() =>
              exportVisitorsExcel(
                paginatedData
              )
            }
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <FaFileExcel />
            Excel
          </button>

          <button
            onClick={() =>
              exportVisitorsPDF(
                paginatedData
              )
            }
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <FaFilePdf />
            PDF
          </button>

          <button
            onClick={() =>
              setShowAddModal(true)
            }
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <FaPlus />
            Ongeza Mgeni
          </button>

          <button
            onClick={() =>
              setShowMessageModal(true)
            }
            disabled={
              selectedIds.length === 0
            }
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <FaPaperPlane />
            Tuma Ujumbe
          </button>

        </div>

      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">

        <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 w-full dark:border-gray-700 dark:bg-gray-900 md:w-64">
          <FaCalendarAlt className="text-gray-400 mr-2" />

          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(
                toIsoDate(e.target.value)
              );
              setCurrentPage(1);
            }}
            className="bg-transparent outline-none w-full text-gray-800 dark:text-white/90"
          />
        </div>

        <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 flex-1 dark:border-gray-700 dark:bg-gray-900">

          <FaSearch className="text-gray-400 mr-2" />

          <input
            type="text"
            placeholder="Tafuta jina, simu au kanisa..."
            value={search}
            onChange={(e) => {
              setSearch(
                e.target.value
              );
              setCurrentPage(1);
            }}
            className="bg-transparent outline-none w-full text-gray-800 placeholder:text-gray-400 dark:text-white/90 dark:placeholder:text-gray-500"
          />

        </div>

      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">

        <SummaryCard
          title="Jumla"
          value={totalVisitors}
        />

        <SummaryCard
          title="Maombi"
          value={totalPrayer}
        />

        <SummaryCard
          title="Kuokoka"
          value={totalSalvation}
        />

        <SummaryCard
          title="Kujiunga"
          value={totalJoining}
        />

        <SummaryCard
          title="Safari"
          value={totalTravel}
        />

      </div>

      {/* TABLE */}

      {loading ? (

        <div className="text-center py-10 text-gray-600 dark:text-gray-300">
          Inapakia...
        </div>

      ) : paginatedData.length === 0 ? (

        <div className="text-center py-10 text-gray-600 dark:text-gray-300">
          Hakuna wageni waliopatikana
        </div>

      ) : (

        <div className="overflow-x-auto border rounded-2xl border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">

          <table className="w-full text-sm text-gray-700 dark:text-gray-300">

            <thead className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-200">

              <tr>

                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={
                      handleSelectAll
                    }
                  />
                </th>

                <th className="px-4 py-3 text-left">
                  Tarehe
                </th>

                <th className="px-4 py-3 text-left">
                  Jina
                </th>

                <th className="px-4 py-3 text-left">
                  Simu
                </th>

                <th className="px-4 py-3 text-left">
                  Kanisa
                </th>

                <th className="px-4 py-3 text-left">
                  Sababu
                </th>

              </tr>

            </thead>

            <tbody>

              {paginatedData.map((v) => (

                <tr
                  key={v.id}
                  className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.04]"
                >

                  <td className="px-4 py-4">

                    <input
                      type="checkbox"
                      checked={selectedIds.includes(
                        v.id
                      )}
                      onChange={() =>
                        toggleSelect(v.id)
                      }
                    />

                  </td>

                  <td className="px-4 py-4">
                    {new Date(
                      v.visit_date
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-4 font-medium">
                    {v.full_name}
                  </td>

                  <td className="px-4 py-4">
                    {v.phone}
                  </td>

                  <td className="px-4 py-4">
                    {v.church_origin}
                  </td>

                  <td className="px-4 py-4">
                    <VisitorReasons visitor={v}/>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={
              setCurrentPage
            }
          />
        </div>
      )}

      <SendMessageModal
        open={showMessageModal}
        onClose={() =>
          setShowMessageModal(false)
        }
        selectedVisitors={
          selectedVisitors
        }
      />

      <AddVisitorModal
        open={showAddModal}
        onClose={() =>
          setShowAddModal(false)
        }
        onSubmit={
          handleAddVisitor
        }
      />

    </div>
  );
}
