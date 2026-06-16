'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiAuthError, apiFetch } from '@/lib/api';

export interface Visitor {
  id: number;
  full_name: string;
  phone: string;
  email?: string;
  church_origin: string;
  visit_date: string;
  prayer?: boolean;
  salvation?: boolean;
  joining?: boolean;
  travel?: boolean;
  other: string;
}

export function useVisitors() {
  const [data, setData] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.set('start_date', fromDate);
      if (toDate) params.set('end_date', toDate);
      const query = params.toString();
      const res = await apiFetch(`/guests${query ? `?${query}` : ''}`);
      const guests = res?.data?.guests ?? res?.guests ?? [];
      setData(Array.isArray(guests) ? guests : []);
      setSelectedIds([]);
      setSelectAll(false);
    } catch (error) {
      if (error instanceof ApiAuthError) return;

      console.error(error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => { void fetchVisitors(); }, [fetchVisitors]);

  const filteredData = useMemo(() => {
    const term = search.trim().toLowerCase();
    return data.filter((visitor) => {
      const date = visitor.visit_date?.slice(0, 10) || '';
      const matchesSearch = !term || visitor.full_name?.toLowerCase().includes(term) || visitor.phone?.toLowerCase().includes(term) || visitor.church_origin?.toLowerCase().includes(term);
      return matchesSearch && (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
    });
  }, [data, fromDate, search, toDate]);

  const now = new Date();
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const totalThisMonth = data.filter((visitor) => {
    const date = new Date(visitor.visit_date);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;
  const totalLastMonth = data.filter((visitor) => {
    const date = new Date(visitor.visit_date);
    return date.getMonth() === previousMonth.getMonth() && date.getFullYear() === previousMonth.getFullYear();
  }).length;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const toggleSelect = (id: number) => setSelectedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  const handleSelectAll = () => {
    setSelectedIds(selectAll ? [] : filteredData.map((visitor) => visitor.id));
    setSelectAll(!selectAll);
  };
  const clearFilters = () => {
    setSearch('');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  return {
    loading, search, setSearch, fromDate, setFromDate, toDate, setToDate, clearFilters,
    currentPage, setCurrentPage, totalPages, paginatedData, filteredData, selectedIds,
    selectAll, toggleSelect, handleSelectAll,
    selectedVisitors: data.filter((visitor) => selectedIds.includes(visitor.id)),
    fetchVisitors, totalVisitors: data.length, totalThisMonth, totalLastMonth,
  };
}
