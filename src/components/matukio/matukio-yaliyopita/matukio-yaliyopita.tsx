'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaSearch,
} from 'react-icons/fa';
import { Dialog } from '@headlessui/react';
import Swal from 'sweetalert2';
import { Card, CardContent } from '@/components/ui/card';

interface EventType {
  id: number;
  title: string;
  date: string;
  time?: string;
  location?: string;
  category: string;
  description?: string;
}

interface Group {
  id: number;
  name: string;
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default function MatukioYaliyopita() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPastEvents();
    fetchGroups();
  }, []);

  const fetchPastEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/events/past`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const data = await res.json();
      if (data.status === 'success') setEvents(data.events);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const data = await res.json();
      if (data.status === 'success') setGroups(data.groups);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEvents = useMemo(() => {
    return [...events]
      .filter((event) => {
        const matchSearch = event.title
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchCategory =
          selectedCategory === 'All' ||
          event.category === selectedCategory;

        return matchSearch && matchCategory;
      })
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  }, [events, search, selectedCategory]);

  const openModal = (event: EventType, edit = false) => {
    setSelectedEvent({ ...event });
    setIsEditing(edit);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setIsEditing(false);
    setIsModalOpen(false);
  };

  const handleDelete = (event: EventType) => {
    Swal.fire({
      title: 'Una uhakika?',
      text: `Tukio "${event.title}" litaondolewa kabisa!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ndiyo, futa!',
      cancelButtonText: 'Hapana',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/events/${event.id}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
          const data = await res.json();

          if (data.status === 'success') {
            setEvents(events.filter((e) => e.id !== event.id));
            Swal.fire(
              'Imefutwa!',
              'Tukio limefutwa kwa mafanikio.',
              'success'
            );
          } else {
            Swal.fire('Hitilafu', 'Imeshindikana kufuta tukio.', 'error');
          }
        } catch (err) {
          Swal.fire('Hitilafu', 'Imeshindikana kufuta tukio.', 'error');
        }
      }
    });
  };

  const handleSaveEdit = async () => {
    if (!selectedEvent) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/events/${selectedEvent.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(selectedEvent),
        }
      );

      const data = await res.json();

      if (data.status === 'success') {
        setEvents(
          events.map((e) =>
            e.id === selectedEvent.id ? selectedEvent : e
          )
        );

        Swal.fire('Imefanikiwa!', 'Tukio limehifadhiwa.', 'success');
        closeModal();
      } else {
        Swal.fire('Hitilafu', 'Imeshindikana kuhifadhi.', 'error');
      }
    } catch (err) {
      Swal.fire('Hitilafu', 'Imeshindikana kuhifadhi.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">

      {/* HEADER */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
        <FaCalendarAlt className="text-3xl text-[#f0ce32]" />
          <h2 className="text-3xl font-bold text-slate-800">
            Matukio Yaliyopita
          </h2>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tafuta tukio..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 rounded-xl border md:w-64"
        >
          <option value="All">Aina zote</option>
          {groups.map((g) => (
            <option key={g.id} value={g.name}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* CONTENT */}
      {isLoading ? (
        <LoadingSpinner />
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-2xl">
          Hakuna matukio yaliyopita.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card
              key={event.id}
              className="group hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />

              <CardContent>
                <div className="flex justify-between mb-4">
                  <h3 className="font-bold">{event.title}</h3>
                  <span className="text-xs bg-indigo-100 px-2 rounded">
                    {event.category}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <FaCalendarAlt />{' '}
                    {new Date(event.date).toLocaleDateString()}
                  </div>

                  {event.time && (
                    <div className="flex gap-2">
                      <FaClock /> {event.time}
                    </div>
                  )}

                  {event.location && (
                    <div className="flex gap-2">
                      <FaMapMarkerAlt /> {event.location}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openModal(event)}
                    className="flex-1 border py-1 text-indigo-600"
                  >
                    Angalia
                  </button>

                  <button
                    onClick={() => openModal(event, true)}
                    className="flex-1 border py-1 text-yellow-600"
                  >
                    Hariri
                  </button>

                  <button
                    onClick={() => handleDelete(event)}
                    className="flex-1 border py-1 text-red-600"
                  >
                    Futa
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL */}
      <Dialog open={isModalOpen} onClose={closeModal}>
        {selectedEvent && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {selectedEvent.title}
              </h2>

              <p>{selectedEvent.description}</p>

              <button onClick={closeModal} className="mt-4 border px-4 py-2">
                Funga
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}