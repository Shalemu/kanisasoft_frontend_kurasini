'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export function useWaliostafu() {
  const [leaders, setLeaders] = useState([]);

  const fetchRetired = async () => {
    try {
      const res = await apiFetch('/retired-leaders');
      setLeaders(res.leaders || []);
    } catch (err) {
      console.log('FAILED TO LOAD RETIRED:', err);
    }
  };

  useEffect(() => {
    fetchRetired();
  }, []);

  return {
    leaders,
    refresh: fetchRetired,
  };
}