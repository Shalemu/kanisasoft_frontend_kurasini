'use client';

import { useEffect, useState } from 'react';

export interface EventType {
  id: number;
  title: string;
  date: string;
  time?: string;
  location?: string;
  category: string;
  description?: string;
}

export interface Group {
  id: number;
  name: string;
}

export function useEvents() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  const getToken = () =>
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;


  // FETCH EVENTS
 
  const fetchEvents = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/events`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await res.json();

      if (data.status === 'success') {
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Fetch events error:', error);
    } finally {
      setLoading(false);
    }
  };


  // FETCH GROUPS
 
  const fetchGroups = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await res.json();

      if (data.status === 'success') {
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Fetch groups error:', error);
    }
  };


  // ADD EVENT

  const addEvent = async (form: Partial<EventType>) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (data.status !== 'success') {
        throw new Error(data.message || 'Failed to add event');
      }

      return data;
    } catch (error) {
      console.error('Add event error:', error);
      throw error;
    }
  };


  // INIT

  useEffect(() => {
    fetchEvents();
    fetchGroups();
  }, []);

  return {
    events,
    groups,
    loading,

    fetchEvents,
    fetchGroups,
    addEvent,

    setEvents,
  };
}