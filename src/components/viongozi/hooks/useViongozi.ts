'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import Swal from 'sweetalert2';

export interface Leader {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  roles: string[];
  user_id: number | null;
}

export interface Role {
  id: number;
  title: string;
  protected?: boolean;
}

export function useViongozi() {
  // DATA
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  // FILTERS
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('Yote');

  // SELECTION
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  // UI
  const [showRolesTable, setShowRolesTable] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  
  // FETCH
 
  const fetchLeaders = async () => {
    const res = await apiFetch('/leaders');
    setLeaders(res.leaders || []);
  };

  const fetchRoles = async () => {
    const res = await apiFetch('/leadership-roles');
    setRoles(res.roles || []);
  };

  const refresh = () => {
    fetchLeaders();
    fetchRoles();
  };

  useEffect(() => {
    refresh();
  }, []);

 
  // FILTER
 
  const filteredLeaders = leaders.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      l.email?.toLowerCase().includes(search.toLowerCase());

    const matchRole =
      filterRole === 'Yote' ||
      l.roles?.includes(filterRole) ||
      l.role === filterRole;

    return matchSearch && matchRole;
  });

  const totalPages = Math.ceil(filteredLeaders.length / itemsPerPage);

  const paginatedLeaders = filteredLeaders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterRole]);


  // SELECT
  
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(
      selectedIds.length === leaders.length
        ? []
        : leaders.map((l) => l.id)
    );
  };

  const toggleRoleSelect = (id: number) => {
    setSelectedRoleIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllRoles = () => {
    setSelectedRoleIds(
      selectedRoleIds.length === roles.length
        ? []
        : roles.map((r) => r.id)
    );
  };

 
  // RETIRE

 const handleRetireLeader = async () => {
  const result = await Swal.fire({
    title: 'Thibitisha',
    text: 'Kustaafisha viongozi?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ndiyo',
    cancelButtonText: 'Ghairi',
  });

  if (!result.isConfirmed) return;

  try {
    for (const id of selectedIds) {
      const res = await apiFetch(`/leaders/${id}/retire`, {
        method: 'POST',
      });

      // IMPORTANT: check backend response
      if (res?.status !== 'success') {
        throw new Error(res?.message || 'Failed');
      }
    }

    await fetchLeaders();
    setSelectedIds([]);

    Swal.fire({
      icon: 'success',
      title: 'Imefanikiwa',
      text: 'Viongozi wamestaafishwa kikamilifu',
    });

  } catch (err) {
    console.log('RETIRE ERROR:', err);

    Swal.fire(
      'Error',
      'Imeshindikana kustaafisha viongozi',
      'error'
    );
  }
};

  // DELETE

  const handleRemoveLeader = async () => {
    const result = await Swal.fire({
      title: 'Thibitisha',
      text: 'Kufuta viongozi?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ndiyo',
      cancelButtonText: 'Ghairi',
    });

    if (!result.isConfirmed) return;

    try {
      for (const id of selectedIds) {
        await apiFetch(`/leaders/${id}`, {
          method: 'DELETE',
        });
      }

      refresh();
      setSelectedIds([]);
    } catch (err) {
      Swal.fire('Error', 'Imeshindikana kufuta viongozi', 'error');
    }
  };


  // UPDATE ROLE

  const updateLeaderRole = async (roleId: number) => {
    if (!editId) return;

    try {
      await apiFetch(`/leaders/${editId}/role`, {
        method: 'POST',
        body: JSON.stringify({
          role_ids: [roleId],
        }),
      });

      refresh();
      setEditId(null);
    } catch (err) {
      Swal.fire('Error', 'Imeshindikana kusasisha nafasi', 'error');
    }
  };

  return {
    // data
    leaders,
    roles,
    filteredLeaders,
    paginatedLeaders,

    // pagination
    currentPage,
    setCurrentPage,
    totalPages,

    // filters
    search,
    setSearch,
    filterRole,
    setFilterRole,

    // selection
    selectedIds,
    toggleSelect,
    toggleSelectAll,

    selectedRoleIds,
    toggleRoleSelect,
    toggleSelectAllRoles,

    // UI
    showRolesTable,
    setShowRolesTable,
    editId,
    setEditId,
    editRole,
    setEditRole,
    selectedMemberId,
    setSelectedMemberId,

    // actions
    handleRetireLeader,
    handleRemoveLeader,
    updateLeaderRole,
  };
  }
