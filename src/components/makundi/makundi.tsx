'use client';

import { useEffect, useState } from 'react';
import {
  FaPlus,
  FaUsers,
  FaSearch,
  FaEdit,
  FaTrash,
  FaWhatsapp,
  FaLink,
} from 'react-icons/fa';
import { Dialog } from '@headlessui/react';
import Swal from 'sweetalert2';
import { Card, CardContent } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';

interface Leader {
  full_name: string;
  membership_number: string;
  phone?: string | null;
}

interface Group {
  id: number;
  name: string;
  leader?: Leader | null;
  whatsapp_link?: string | null;
  members?: unknown[];
  members_count?: number;
  member_count?: number;
}

interface GroupDetails extends Group {
  description?: string | null;
  leaders?: Leader[];
  members?: {
    id: number;
    full_name: string;
    membership_number?: string | null;
    phone?: string | null;
  }[];
}

export default function MakundiTab() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedGroupDetails, setSelectedGroupDetails] = useState<GroupDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    leader_membership_number: '',
    whatsapp_link: '',
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const data = await apiFetch('/groups');

      if (data.status === 'success') {
        setGroups(data.groups);
        setFilteredGroups(data.groups);
      } else if (Array.isArray(data.groups)) {
        setGroups(data.groups);
        setFilteredGroups(data.groups);
      }
    } catch (err) {
      Swal.fire('Hitilafu', 'Imeshindikana kupata makundi.', 'error');
    }
  };

  const openGroupDetails = async (group: Group) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    setSelectedGroupDetails(group as GroupDetails);

    try {
      const data = await apiFetch(`/groups/${group.id}`);
      setSelectedGroupDetails(data.group ?? data.data?.group ?? data);
    } catch (error) {
      Swal.fire('Hitilafu', 'Imeshindikana kupata taarifa za kundi.', 'error');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value.toLowerCase();
    setSearchQuery(q);

    const filtered = groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.leader?.full_name.toLowerCase().includes(q) ||
        g.leader?.membership_number.toLowerCase().includes(q)
    );

    setFilteredGroups(filtered);
  };

  const openAddDialog = () => {
    setEditingGroup(null);
    setFormData({
      name: '',
      leader_membership_number: '',
      whatsapp_link: '',
    });
    setIsOpen(true);
  };

  const openEditDialog = (group: Group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      leader_membership_number: group.leader?.membership_number || '',
      whatsapp_link: group.whatsapp_link || '',
    });
    setIsOpen(true);
  };

  const saveGroup = async () => {
    setLoading(true);

    try {
      const method = editingGroup ? 'PUT' : 'POST';
      const data = await apiFetch(editingGroup ? `/groups/${editingGroup.id}` : '/groups', {
        method,
        body: formData,
      });

      if (data.status === 'success' || !data.error) {
        fetchGroups();
        setIsOpen(false);
        Swal.fire('Imefanikiwa!', 'Kundi limehifadhiwa.', 'success');
      } else {
        Swal.fire('Hitilafu', data.message || 'Imeshindikana.', 'error');
      }
    } catch {
      Swal.fire('Hitilafu', 'Imeshindikana kuhifadhi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (id: number) => {
    Swal.fire({
      title: 'Una uhakika?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Futa',
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        await apiFetch(`/groups/${id}`, { method: 'DELETE' });

        setGroups((prev) => prev.filter((g) => g.id !== id));
        setFilteredGroups((prev) => prev.filter((g) => g.id !== id));
        Swal.fire('Imefutwa!', '', 'success');
      } catch {
        Swal.fire('Hitilafu', 'Imeshindikana kufuta.', 'error');
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 md:px-8 py-8 text-slate-800 dark:bg-gray-900 dark:text-white/90">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-slate-800 dark:text-white/90">
          <FaUsers className="text-blue-600" />
          Makundi ya Kanisa
        </h1>

        <button
          onClick={openAddDialog}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-500 transition shadow-sm"
        >
          <FaPlus /> Ongeza
        </button>
      </div>

      {/* SEARCH */}
      <div className="mb-6 flex items-center gap-3 max-w-md">
        <FaSearch className="text-slate-400" />
        <input
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Tafuta..."
          className="flex-1 border border-slate-200 bg-white px-4 py-2.5 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500"
        />
      </div>

      {/* GROUP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <Card
            key={group.id}
            onClick={() => openGroupDetails(group)}
            className="group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

            <CardContent>

              {/* ICON */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center dark:bg-blue-500/10">
                  <FaUsers className="text-blue-600 text-xl" />
                </div>
              </div>

              {/* NAME */}
              <h3 className="text-lg font-bold text-center text-slate-800 dark:text-white/90">
                {group.name}
              </h3>
              <p className="mt-1 text-center text-xs font-medium text-blue-600 dark:text-blue-300">
                Washirika: {group.members_count ?? group.member_count ?? group.members?.length ?? 0}
              </p>

              {/* LEADER */}
              {group.leader && (
                <p className="text-xs text-center text-slate-500 mt-1 dark:text-gray-400">
                  {group.leader.full_name}
                </p>
              )}

              {/* WHATSAPP */}
              {group.whatsapp_link && (
                <div className="mt-3 flex justify-center">
                  <a
                    href={group.whatsapp_link}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-green-600 text-xs hover:underline"
                  >
                    <FaWhatsapp /> WhatsApp <FaLink />
                  </a>
                </div>
              )}

              {/* ACTIONS */}
              <div className="mt-5 pt-4 border-t border-slate-200 flex justify-center gap-4 dark:border-gray-800">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditDialog(group);
                  }}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FaEdit />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteGroup(group.id);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {/* MODAL */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4 text-slate-800 shadow-xl dark:bg-gray-900 dark:text-white/90">

            <h2 className="text-lg font-bold">
              {editingGroup ? 'Hariri Kundi' : 'Ongeza Kundi'}
            </h2>

            <input
              placeholder="Jina la kundi"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border border-slate-200 bg-white px-3 py-2 rounded text-slate-800 placeholder:text-slate-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500"
            />

            <input
              placeholder="Membership No"
              value={formData.leader_membership_number}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  leader_membership_number: e.target.value,
                })
              }
              className="w-full border border-slate-200 bg-white px-3 py-2 rounded text-slate-800 placeholder:text-slate-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500"
            />

            <input
              placeholder="WhatsApp link"
              value={formData.whatsapp_link}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  whatsapp_link: e.target.value,
                })
              }
              className="w-full border border-slate-200 bg-white px-3 py-2 rounded text-slate-800 placeholder:text-slate-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500"
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setIsOpen(false)} className="text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white">Cancel</button>

              <button
                onClick={saveGroup}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>

          </div>
        </div>
      </Dialog>

      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)}>
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 text-slate-800 shadow-xl dark:bg-gray-900 dark:text-white/90">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedGroupDetails?.name ?? 'Kundi'}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
                  {selectedGroupDetails?.description || 'Taarifa za kundi na washirika wake'}
                </p>
              </div>
              <button onClick={() => setDetailsOpen(false)} className="rounded-lg border border-slate-200 px-3 py-1 text-sm dark:border-gray-700">
                Funga
              </button>
            </div>

            {detailsLoading ? (
              <div className="py-10 text-center text-slate-500">Inapakia taarifa za kundi...</div>
            ) : (
              <>
                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <DetailSummary title="Jumla ya Washirika" value={selectedGroupDetails?.members_count ?? selectedGroupDetails?.member_count ?? selectedGroupDetails?.members?.length ?? 0} />
                  <DetailSummary title="Viongozi" value={selectedGroupDetails?.leaders?.length ?? (selectedGroupDetails?.leader ? 1 : 0)} />
                  <DetailSummary title="WhatsApp" value={selectedGroupDetails?.whatsapp_link ? 'Ipo' : 'Hakuna'} />
                </div>

                <div className="mb-5 rounded-xl border border-slate-200 p-4 dark:border-gray-800">
                  <h3 className="mb-3 font-semibold">Viongozi wa Kundi</h3>
                  {selectedGroupDetails?.leaders?.length ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {selectedGroupDetails.leaders.map((leader) => (
                        <div key={`${leader.membership_number}-${leader.full_name}`} className="rounded-lg bg-slate-50 p-3 dark:bg-gray-800">
                          <p className="font-medium">{leader.full_name}</p>
                          <p className="text-xs text-slate-500">{leader.membership_number || leader.phone || '—'}</p>
                        </div>
                      ))}
                    </div>
                  ) : selectedGroupDetails?.leader ? (
                    <div className="rounded-lg bg-slate-50 p-3 dark:bg-gray-800">
                      <p className="font-medium">{selectedGroupDetails.leader.full_name}</p>
                      <p className="text-xs text-slate-500">{selectedGroupDetails.leader.membership_number || '—'}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Hakuna kiongozi aliyesajiliwa.</p>
                  )}
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-gray-800">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-left dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Jina</th>
                        <th className="px-4 py-3">Namba</th>
                        <th className="px-4 py-3">Simu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedGroupDetails?.members?.length ? (
                        selectedGroupDetails.members.map((member, index) => (
                          <tr key={member.id} className="border-t border-slate-100 dark:border-gray-800">
                            <td className="px-4 py-3">{index + 1}</td>
                            <td className="px-4 py-3 font-medium">{member.full_name}</td>
                            <td className="px-4 py-3">{member.membership_number || '—'}</td>
                            <td className="px-4 py-3">{member.phone || '—'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-500">Hakuna washirika kwenye kundi hili.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function DetailSummary({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800">
      <p className="text-xs font-medium uppercase text-slate-500 dark:text-gray-400">{title}</p>
      <p className="mt-2 text-xl font-bold">{value}</p>
    </div>
  );
}
