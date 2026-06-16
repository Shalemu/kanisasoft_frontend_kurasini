'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import Swal from 'sweetalert2';
import { apiFetch } from '@/lib/api';
import Pagination from '@/components/tables/Pagination';
import { FaUsers, FaMoneyBillWave } from 'react-icons/fa';

interface ServiceAttendance {
  id: number;
  date: string;
  title?: string;
  service_name: string;
  preacher: string;
  attendance_children: number;
  attendance_women: number;
  attendance_men: number;
  total_offerings: number;
  leaders_on_duty?: string;
  preacher_description?: string;
  message?: string;
}

interface EditFieldProps {
  label: string;
  htmlFor: string;
  className?: string;
  children: ReactNode;
}

function EditField({ label, htmlFor, className = '', children }: EditFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function TaarifaZaIbada() {
  const [attendanceData, setAttendanceData] = useState<ServiceAttendance[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [filterDate, setFilterDate] = useState('');
  const [filterService, setFilterService] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [editingItem, setEditingItem] = useState<ServiceAttendance | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingEditId, setLoadingEditId] = useState<number | null>(null);

  const getServiceName = (item: ServiceAttendance) =>
    item.service_name || item.title || '';

  const normalizeServiceEvent = (response: any, fallback?: ServiceAttendance): ServiceAttendance => {
    const source = response?.edit_data ?? response?.service_event ?? response?.data?.edit_data ?? response?.data?.service_event ?? response?.data ?? response;

    return {
      ...(fallback ?? {}),
      ...source,
      date: (source?.date ?? fallback?.date ?? '').slice(0, 10),
      service_name: source?.service_name ?? source?.title ?? fallback?.service_name ?? fallback?.title ?? '',
      title: source?.title ?? source?.service_name ?? fallback?.title ?? fallback?.service_name ?? '',
      attendance_children: Number(source?.attendance_children ?? fallback?.attendance_children ?? 0),
      attendance_women: Number(source?.attendance_women ?? fallback?.attendance_women ?? 0),
      attendance_men: Number(source?.attendance_men ?? fallback?.attendance_men ?? 0),
      total_offerings: Number(source?.total_offerings ?? fallback?.total_offerings ?? 0),
    } as ServiceAttendance;
  };

  async function fetchAttendance() {
    try {
      setLoading(true);
      const res = await apiFetch('/service-events');
      if (res.status === 'success') {
        setAttendanceData(res.service_events || []);
      }
    } catch (error) {
      console.error('Failed to load taarifa za ibada', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void (async () => {
      await fetchAttendance();
    })();
  }, []);

 
  const filteredData = attendanceData.filter(item => {
    const itemDate = item.date.slice(0, 10);

    const matchDate = filterDate ? itemDate === filterDate : true;
    const serviceName = getServiceName(item);

    const matchService = filterService
      ? serviceName === filterService
      : true;

    const matchSearch =
      serviceName.toLowerCase().includes(filterSearch.toLowerCase()) ||
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

    try {
      await apiFetch(`/service-events/${id}`, { method: 'DELETE' });
      await fetchAttendance();
      await Swal.fire('Imefutwa', 'Taarifa imefutwa.', 'success');
    } catch (error) {
      await Swal.fire('Hitilafu', error instanceof Error ? error.message : 'Imeshindikana kufuta.', 'error');
    }
  };

  const openEditForm = async (item: ServiceAttendance) => {
    try {
      setLoadingEditId(item.id);
      const response = await apiFetch(`/service-events/${item.id}`);
      setEditingItem(normalizeServiceEvent(response, item));
    } catch (error) {
      await Swal.fire('Hitilafu', error instanceof Error ? error.message : 'Imeshindikana kupata taarifa za kuhariri.', 'error');
    } finally {
      setLoadingEditId(null);
    }
  };

  const updateField = (name: keyof ServiceAttendance, value: string) => {
    setEditingItem((current) => current ? { ...current, [name]: value } : current);
  };

  const editInputClass = 'w-full rounded border border-gray-300 bg-white p-2 text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500';

  const handleUpdate = async () => {
    if (!editingItem) return;

    try {
      setSaving(true);
      await apiFetch(`/service-events/${editingItem.id}`, {
        method: 'PUT',
        body: {
          ...editingItem,
          date: editingItem.date.slice(0, 10),
          title: getServiceName(editingItem),
          service_name: getServiceName(editingItem),
          attendance_children: Number(editingItem.attendance_children || 0),
          attendance_women: Number(editingItem.attendance_women || 0),
          attendance_men: Number(editingItem.attendance_men || 0),
          total_offerings: Number(editingItem.total_offerings || 0),
        },
      });
      setEditingItem(null);
      await fetchAttendance();
      await Swal.fire('Imefanikiwa', 'Taarifa za ibada zimehaririwa.', 'success');
    } catch (error) {
      await Swal.fire('Hitilafu', error instanceof Error ? error.message : 'Imeshindikana kuhifadhi.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 text-gray-800 shadow-md dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90">

      {/* TITLE */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white/90">
        Mahudhurio & Sadaka
      </h2>

      {/* 🔵 FILTERS */}
      <div className="flex flex-wrap gap-3 mb-6">

        {/* DATE */}
        <input
          type="date"
          value={filterDate}
          onChange={(e) => {
            setFilterDate(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />

        {(filterDate || filterService || filterSearch) && (
          <button
            onClick={() => {
              setFilterDate('');
              setFilterService('');
              setFilterSearch('');
              setCurrentPage(1);
            }}
            className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/[0.04]"
          >
            Ondoa vichujio
          </button>
        )}

        {/* SERVICE */}
        <select
          value={filterService}
          onChange={(e) => {
            setFilterService(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
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
          onChange={(e) => {
            setFilterSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500"
        />
      </div>

      {/* SUMMARY */}
      <div className="flex gap-4 mb-6">

        <div className="flex flex-1 flex-col items-center rounded border border-gray-200 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
          <FaUsers className="text-xl text-green-600" />
          <p className="text-gray-500 text-sm">Jumla ya Washirika</p>
          <p className="text-xl font-bold">
            {loading ? '...' : totalMembers}
          </p>
        </div>

        <div className="flex flex-1 flex-col items-center rounded border border-gray-200 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
          <FaMoneyBillWave className="text-xl text-blue-600" />
          <p className="text-gray-500 text-sm">Jumla ya Sadaka</p>
          <p className="text-xl font-bold">
            {loading ? '...' : totalSadaka.toLocaleString()}
          </p>
        </div>

      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm">

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
                <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.04]">
                  <td className="px-3 py-2">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">{getServiceName(item)}</td>
                  <td className="px-3 py-2">{item.preacher}</td>
                  <td className="px-3 py-2 text-center">{item.attendance_children}</td>
                  <td className="px-3 py-2 text-center">{item.attendance_women}</td>
                  <td className="px-3 py-2 text-center">{item.attendance_men}</td>
                  <td className="px-3 py-2 text-center font-semibold">{total}</td>
                  <td className="px-3 py-2 text-right">
                    {Number(item.total_offerings).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <button disabled={loadingEditId === item.id} onClick={() => openEditForm(item)} className="rounded bg-blue-600 px-2 py-1 text-xs text-white disabled:opacity-60">{loadingEditId === item.id ? 'Inapakia...' : 'Edit'}</button>
                      <button onClick={() => handleDelete(item.id)} className="rounded bg-red-500 px-2 py-1 text-xs text-white">Delete</button>
                    </div>
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

      {editingItem && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-5">
              <h3 className="text-xl font-bold">Hariri Taarifa za Ibada</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {getServiceName(editingItem) || 'Ibada'} · {editingItem.date ? new Date(editingItem.date).toLocaleDateString() : 'Tarehe haipo'}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <EditField label="Tarehe ya Ibada" htmlFor="service-date">
                <input id="service-date" className={editInputClass} type="date" value={editingItem.date} onChange={(e) => updateField('date', e.target.value)} />
              </EditField>
              <EditField label="Aina ya Ibada" htmlFor="service-name">
                <input id="service-name" className={editInputClass} placeholder="Aina ya ibada" value={getServiceName(editingItem)} onChange={(e) => updateField('service_name', e.target.value)} />
              </EditField>
              <EditField label="Mhubiri" htmlFor="service-preacher">
                <input id="service-preacher" className={editInputClass} placeholder="Mhubiri" value={editingItem.preacher || ''} onChange={(e) => updateField('preacher', e.target.value)} />
              </EditField>
              <EditField label="Kiongozi wa Ibada" htmlFor="service-leaders">
                <input id="service-leaders" className={editInputClass} placeholder="Kiongozi wa ibada" value={editingItem.leaders_on_duty || ''} onChange={(e) => updateField('leaders_on_duty', e.target.value)} />
              </EditField>
              <EditField label="Mahudhurio ya Watoto" htmlFor="service-children">
                <input id="service-children" className={editInputClass} type="number" placeholder="Watoto" value={editingItem.attendance_children} onChange={(e) => updateField('attendance_children', e.target.value)} />
              </EditField>
              <EditField label="Mahudhurio ya Wanawake" htmlFor="service-women">
                <input id="service-women" className={editInputClass} type="number" placeholder="Wanawake" value={editingItem.attendance_women} onChange={(e) => updateField('attendance_women', e.target.value)} />
              </EditField>
              <EditField label="Mahudhurio ya Wanaume" htmlFor="service-men">
                <input id="service-men" className={editInputClass} type="number" placeholder="Wanaume" value={editingItem.attendance_men} onChange={(e) => updateField('attendance_men', e.target.value)} />
              </EditField>
              <EditField label="Jumla ya Sadaka" htmlFor="service-offerings">
                <input id="service-offerings" className={editInputClass} type="number" placeholder="Sadaka" value={editingItem.total_offerings} onChange={(e) => updateField('total_offerings', e.target.value)} />
              </EditField>
              <EditField label="Ujumbe" htmlFor="service-message" className="md:col-span-2">
                <textarea id="service-message" className={editInputClass} placeholder="Ujumbe" value={editingItem.message || ''} onChange={(e) => updateField('message', e.target.value)} />
              </EditField>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditingItem(null)} className="rounded border border-gray-300 px-4 py-2 dark:border-gray-700">Ghairi</button>
              <button disabled={saving} onClick={handleUpdate} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60">{saving ? 'Inahifadhi...' : 'Hifadhi Mabadiliko'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
