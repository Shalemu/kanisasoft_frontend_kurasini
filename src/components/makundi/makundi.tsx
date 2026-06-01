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

interface Leader {
  full_name: string;
  membership_number: string;
}

interface Group {
  id: number;
  name: string;
  leader?: Leader | null;
  whatsapp_link?: string | null;
}

export default function MakundiTab({
  onGroupSelect,
}: {
  onGroupSelect: (groupId: number) => void;
}) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [isOpen, setIsOpen] = useState(false);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/groups`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();

      if (data.status === 'success') {
        setGroups(data.groups);
        setFilteredGroups(data.groups);
      }
    } catch (err) {
      Swal.fire('Hitilafu', 'Imeshindikana kupata makundi.', 'error');
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
      const url = editingGroup
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/${editingGroup.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups`;

      const method = editingGroup ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
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
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/${id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (res.ok) {
          setGroups((prev) => prev.filter((g) => g.id !== id));
          setFilteredGroups((prev) => prev.filter((g) => g.id !== id));
          Swal.fire('Imefutwa!', '', 'success');
        } else {
          Swal.fire('Hitilafu', 'Imeshindikana kufuta.', 'error');
        }
      } catch {
        Swal.fire('Hitilafu', 'Imeshindikana kufuta.', 'error');
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 md:px-8 py-8">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-slate-800">
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
          className="flex-1 border border-slate-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
        />
      </div>

      {/* GROUP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <Card
            key={group.id}
            onClick={() => onGroupSelect(group.id)}
            className="group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

            <CardContent>

              {/* ICON */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <FaUsers className="text-blue-600 text-xl" />
                </div>
              </div>

              {/* NAME */}
              <h3 className="text-lg font-bold text-center text-slate-800">
                {group.name}
              </h3>

              {/* LEADER */}
              {group.leader && (
                <p className="text-xs text-center text-slate-500 mt-1">
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
              <div className="mt-5 pt-4 border-t flex justify-center gap-4">
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
          <div className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4">

            <h2 className="text-lg font-bold">
              {editingGroup ? 'Hariri Kundi' : 'Ongeza Kundi'}
            </h2>

            <input
              placeholder="Jina la kundi"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border px-3 py-2 rounded"
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
              className="w-full border px-3 py-2 rounded"
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
              className="w-full border px-3 py-2 rounded"
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setIsOpen(false)}>Cancel</button>

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
    </div>
  );
}