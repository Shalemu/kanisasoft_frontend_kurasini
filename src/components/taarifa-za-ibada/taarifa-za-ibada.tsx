'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { apiFetch } from '@/lib/api';
import Pagination from '@/components/tables/Pagination';
import { FaUsers, FaMoneyBillWave } from 'react-icons/fa';

interface ServiceAttendance {
  id: number;
  date: string;
  service_name: string;
  preacher: string;
  attendance_children: number;
  attendance_women: number;
  attendance_men: number;
  total_offerings: number;
  leaders_on_duty?: string;
}

export default function TaarifaZaIbada() {
  const [attendanceData, setAttendanceData] = useState<ServiceAttendance[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const today = new Date().toISOString().split('T')[0];

  // 🔥 FILTERS
  const [filterDate, setFilterDate] = useState(today);
  const [filterService, setFilterService] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    const res = await apiFetch('/service-events');
    if (res.status === 'success') {
      setAttendanceData(res.service_events || []);
    }
    setLoading(false);
  };

  // reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDate, filterService, filterSearch]);

 
  const filteredData = attendanceData.filter(item => {
    const itemDate = item.date.slice(0, 10);

    const matchDate = filterDate ? itemDate === filterDate : true;
    const matchService = filterService
      ? item.service_name === filterService
      : true;

    const matchSearch =
      item.service_name.toLowerCase().includes(filterSearch.toLowerCase()) ||
      item.preacher.toLowerCase().includes(filterSearch.toLowerCase());

    return matchDate && matchService && matchSearch;
  });

  // 🔥 SUMMARY BASED ON FILTERED DATA
  const totalMembers = filteredData.reduce(
    (sum, s) =>
      sum +
      s.attendance_children +
      s.attendance_women +
      s.attendance_men,
    0
  );

  const totalSadaka = filteredData.reduce(
    (sum, s) => sum + Number(s.total_offerings || 0),
    0
  );

  // pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      icon: 'warning',
      title: 'Thibitisha',
      text: 'Una hakika unataka kufuta?',
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    await apiFetch(`/service-events/${id}`, { method: 'DELETE' });
    fetchAttendance();
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">

      {/* TITLE */}
      <h2 className="text-2xl font-bold mb-4">
        Mahudhurio & Sadaka
      </h2>

      {/* 🔵 FILTERS */}
      <div className="flex flex-wrap gap-3 mb-6">

        {/* DATE */}
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />

        {/* SERVICE */}
        <select
          value={filterService}
          onChange={(e) => setFilterService(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">Ibada Zote</option>
          <option value="Ibada ya kimataifa">Ibada ya kimataifa</option>
          <option value="Ibada ya Pili">Ibada ya Pili</option>
          <option value="Ibada ya Tatu">Ibada ya Tatu</option>
          <option value="Ibada ya Vijana">Ibada ya Vijana</option>
          <option value="Ibada ya wanawake">Ibada ya wanawake</option>
          <option value="Ibada ya Neno la Mungu">Ibada ya Neno la Mungu</option>
        </select>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Tafuta huduma au mhubiri..."
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
          className="border px-3 py-2 rounded flex-1"
        />
      </div>

      {/* SUMMARY */}
      <div className="flex gap-4 mb-6">

        <div className="flex-1 border rounded p-4 flex flex-col items-center">
          <FaUsers className="text-xl text-green-600" />
          <p className="text-gray-500 text-sm">Jumla ya Washirika</p>
          <p className="text-xl font-bold">
            {loading ? '...' : totalMembers}
          </p>
        </div>

        <div className="flex-1 border rounded p-4 flex flex-col items-center">
          <FaMoneyBillWave className="text-xl text-blue-600" />
          <p className="text-gray-500 text-sm">Jumla ya Sadaka</p>
          <p className="text-xl font-bold">
            {loading ? '...' : totalSadaka.toLocaleString()}
          </p>
        </div>

      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border">

          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-3 py-2">Tarehe</th>
              <th className="px-3 py-2">Huduma</th>
              <th className="px-3 py-2">Mhubiri</th>
              <th className="px-3 py-2">Watoto</th>
              <th className="px-3 py-2">Wanawake</th>
              <th className="px-3 py-2">Wanaume</th>
              <th className="px-3 py-2">Jumla</th>
              <th className="px-3 py-2">Sadaka</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map(item => {
              const total =
                item.attendance_children +
                item.attendance_women +
                item.attendance_men;

              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">{item.service_name}</td>
                  <td className="px-3 py-2">{item.preacher}</td>
                  <td className="px-3 py-2 text-center">{item.attendance_children}</td>
                  <td className="px-3 py-2 text-center">{item.attendance_women}</td>
                  <td className="px-3 py-2 text-center">{item.attendance_men}</td>
                  <td className="px-3 py-2 text-center font-semibold">{total}</td>
                  <td className="px-3 py-2 text-right">
                    {Number(item.total_offerings).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

    </div>
  );
}