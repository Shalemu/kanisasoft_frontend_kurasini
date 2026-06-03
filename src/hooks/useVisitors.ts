'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface Visitor {
  id:number;
  full_name:string;
  phone:string;
  email?:string;
  church_origin:string;
  visit_date:string;
  prayer:boolean;
  salvation:boolean;
  joining:boolean;
  travel:boolean;
  other:string;
}

interface VisitorSummary {
  total_guests: number;
  total_prayer: number;
  total_salvation: number;
  total_joining: number;
  total_travel: number;
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

export function useVisitors() {
  const [data,setData] = useState<Visitor[]>([]);
  const [loading,setLoading] = useState(false);
  const [summary,setSummary] = useState<VisitorSummary>({
    total_guests: 0,
    total_prayer: 0,
    total_salvation: 0,
    total_joining: 0,
    total_travel: 0,
  });

  const today = new Date().toISOString().split('T')[0];

  const [search,setSearch] = useState('');
  const [filterDate,setFilterDate] = useState(today);

  const [selectedIds,setSelectedIds] = useState<number[]>([]);
  const [selectAll,setSelectAll] = useState(false);

  const [currentPage,setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const fetchVisitors = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      const isoDate = filterDate ? toIsoDate(filterDate) : '';

      if (isoDate) params.set('date', isoDate);
      if (search.trim()) params.set('search', search.trim());

      const query = params.toString();
      const res = await apiFetch(`/guests${query ? `?${query}` : ''}`);
      const responseData = res?.data || {};

      setData(responseData.guests || []);
      setSelectedIds([]);
      setSelectAll(false);
      setSummary({
        total_guests: Number(responseData.summary?.total_guests || 0),
        total_prayer: Number(responseData.summary?.total_prayer || 0),
        total_salvation: Number(responseData.summary?.total_salvation || 0),
        total_joining: Number(responseData.summary?.total_joining || 0),
        total_travel: Number(responseData.summary?.total_travel || 0),
      });
    } catch(err){
      console.error(err);
      setData([]);
      setSummary({
        total_guests: 0,
        total_prayer: 0,
        total_salvation: 0,
        total_joining: 0,
        total_travel: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [filterDate, search]);

  useEffect(()=>{
    void (async () => {
      await fetchVisitors();
    })();
  },[fetchVisitors]);

  const totalPages = Math.ceil(
    data.length/itemsPerPage
  );

  const paginatedData = data.slice(
    (currentPage-1)*itemsPerPage,
    currentPage*itemsPerPage
  );

  const toggleSelect=(id:number)=>{
    setSelectedIds(prev=>
      prev.includes(id)
      ? prev.filter(x=>x!==id)
      : [...prev,id]
    );
  };

  const handleSelectAll=()=>{
    if(selectAll){
      setSelectedIds([]);
    }else{
      setSelectedIds(data.map(v=>v.id));
    }

    setSelectAll(!selectAll);
  };

  const selectedVisitors=data.filter(v=>
    selectedIds.includes(v.id)
  );

  return {
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
    fetchVisitors,
    totalVisitors: summary.total_guests,
    totalPrayer: summary.total_prayer,
    totalSalvation: summary.total_salvation,
    totalJoining: summary.total_joining,
    totalTravel: summary.total_travel,
  };
}
