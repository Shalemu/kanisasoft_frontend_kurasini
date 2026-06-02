'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  FaCalendarAlt,
  FaSearch,
  FaClock,
  FaMapMarkerAlt,
} from 'react-icons/fa';

import { Card, CardContent } from '@/components/ui/card';
import { Dialog } from '@headlessui/react';
import { useEvents } from '@/hooks/useEvents';
import AddEventModal from '../AddEventModal';

interface EventType {
  id: number;
  title: string;
  date: string;
  time?: string;
  location?: string;
  category: string;
  description?: string;
}

export default function Matukio() {
  const { events, loading, fetchEvents, addEvent } = useEvents();

  const [groups, setGroups] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [showAddModal, setShowAddModal] = useState(false);

  // VIEW/EDIT MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] =
    useState<EventType | null>(null);
  const [isEditing, setIsEditing] = useState(false);


  // FETCH GROUPS

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
      setGroups(data.groups || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchEvents();
  }, []);

 
  // FILTER EVENTS

  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => {
        const matchSearch = e.title
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchCategory =
          selectedCategory === 'All' ||
          e.category === selectedCategory;

        return matchSearch && matchCategory;
      })
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      );
  }, [events, search, selectedCategory]);

 
  // MODAL HANDLERS

  const openModal = (event: EventType, edit = false) => {
    setSelectedEvent(event);
    setIsEditing(edit);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setIsEditing(false);
    setIsModalOpen(false);
  };

 
  // ADD EVENT

  const handleSave = async (form: any) => {
    await addEvent(form);
    await fetchEvents(); // refresh list
  };

  return (
    <div className="p-6 text-gray-800 dark:text-white/90">

      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-white/90">
          <FaCalendarAlt /> Matukio
        </h2>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          + Ongeza Tukio
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tafuta tukio..."
            className="border border-gray-300 bg-white pl-10 pr-4 py-2 rounded w-full text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) =>
            setSelectedCategory(e.target.value)
          }
          className="border border-gray-300 bg-white px-4 py-2 rounded text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          <option value="All">Zote</option>
          {groups.map((g) => (
            <option key={g.id} value={g.name}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* CONTENT */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredEvents.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">Hakuna matukio</p>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id}>
              <CardContent>
                <div className="flex justify-between">
                  <h3 className="font-bold text-gray-800 dark:text-white/90">{event.title}</h3>
                  <span className="text-xs bg-indigo-100 px-2 rounded text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                    {event.category}
                  </span>
                </div>

                <div className="mt-3 text-sm space-y-1 text-gray-600 dark:text-gray-300">
                  <div className="flex gap-2">
                    <FaCalendarAlt />
                    {new Date(event.date).toLocaleDateString()}
                  </div>

                  {event.time && (
                    <div className="flex gap-2">
                      <FaClock />
                      {event.time}
                    </div>
                  )}

                  {event.location && (
                    <div className="flex gap-2">
                      <FaMapMarkerAlt />
                      {event.location}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openModal(event)}
                    className="flex-1 border border-gray-200 py-1 text-indigo-600 hover:bg-indigo-50 dark:border-gray-700 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
                  >
                    Angalia
                  </button>

                  <button
                    onClick={() => openModal(event, true)}
                    className="flex-1 border border-gray-200 py-1 text-yellow-600 hover:bg-yellow-50 dark:border-gray-700 dark:text-yellow-300 dark:hover:bg-yellow-500/10"
                  >
                    Hariri
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ADD MODAL */}
      <AddEventModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSave}
        groups={groups}
      />

      {/* VIEW / EDIT MODAL */}
      <Dialog open={isModalOpen} onClose={closeModal}>
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md text-gray-800 shadow-xl dark:bg-gray-900 dark:text-white/90">

            <h2 className="text-xl font-bold mb-4">
              {isEditing
                ? 'Hariri Tukio'
                : selectedEvent?.title}
            </h2>

            {!isEditing ? (
              <p>{selectedEvent?.description}</p>
            ) : (
              <input
                value={selectedEvent?.title || ''}
                onChange={(e) =>
                  setSelectedEvent((prev) =>
                    prev
                      ? {
                          ...prev,
                          title: e.target.value,
                        }
                      : prev
                  )
                }
                className="border border-gray-300 bg-white p-2 w-full text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
              />
            )}

            <button
              onClick={closeModal}
              className="mt-4 border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
            >
              Funga
            </button>
          </div>
        </div>
      </Dialog>

    </div>
  );
}
