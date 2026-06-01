'use client';

import { useEffect, useMemo, useState } from 'react';
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

export function useVisitors() {
  const [data,setData] = useState<Visitor[]>([]);
  const [loading,setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const [search,setSearch] = useState('');
  const [filterDate,setFilterDate] = useState(today);

  const [selectedIds,setSelectedIds] = useState<number[]>([]);
  const [selectAll,setSelectAll] = useState(false);

  const [currentPage,setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const fetchVisitors = async () => {
    setLoading(true);

    try {
      const res = await apiFetch('/guests');

      if(res?.guests){
        setData(res.guests);
      }
    } catch(err){
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    fetchVisitors();
  },[]);

  const filtered = useMemo(()=>{
    return data.filter((v)=>{
      const matchDate =
        filterDate
        ? v.visit_date.slice(0,10)===filterDate
        : true;

      const matchSearch =
        v.full_name.toLowerCase().includes(search.toLowerCase()) ||
        v.phone.includes(search) ||
        v.church_origin.toLowerCase().includes(search.toLowerCase());

      return matchDate && matchSearch;
    });
  },[data,search,filterDate]);

  const summary = useMemo(()=>({
    totalVisitors: filtered.length,
    totalPrayer: filtered.filter(v=>v.prayer).length,
    totalSalvation: filtered.filter(v=>v.salvation).length,
    totalJoining: filtered.filter(v=>v.joining).length,
    totalTravel: filtered.filter(v=>v.travel).length,
  }),[filtered]);

  const totalPages = Math.ceil(
    filtered.length/itemsPerPage
  );

  const paginatedData = filtered.slice(
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
      setSelectedIds(filtered.map(v=>v.id));
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
    ...summary
  };
}