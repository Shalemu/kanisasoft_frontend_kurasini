"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaSearch,
  FaTrash,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { Dialog } from "@headlessui/react";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";

interface Group {
  id: number;
  name: string;
}

interface EventRecord {
  id: number;
  title: string;
  type: "Tangazo" | "Tukio" | string;
  description?: string | null;
  start_date: string;
  end_date?: string | null;
  start_time?: string | null;
  location?: string | null;
  audience_groups?: Group[];
  audience_group_ids?: number[];
}

interface EventForm {
  title: string;
  type: "Tangazo" | "Tukio" | "";
  description: string;
  start_date: string;
  end_date: string;
  start_time: string;
  location: string;
  audience_group_ids: number[];
}

const emptyForm: EventForm = {
  title: "",
  type: "",
  description: "",
  start_date: "",
  end_date: "",
  start_time: "",
  location: "",
  audience_group_ids: [],
};

const fieldClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:ring-indigo-500/10";

function normalizeDate(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function normalizeTime(value?: string | null) {
  return value ? value.slice(0, 5) : "";
}

function getRecords(response: any): EventRecord[] {
  const payload = response?.data ?? response ?? {};
  const records = payload.events ?? payload.data ?? response?.events ?? [];

  return Array.isArray(records) ? records : [];
}

function getGroups(response: any): Group[] {
  const payload = response?.data ?? response ?? {};
  const records = payload.groups ?? payload.data ?? response?.groups ?? [];

  return Array.isArray(records) ? records : [];
}

function eventToForm(event: EventRecord): EventForm {
  return {
    title: event.title ?? "",
    type: event.type === "Tangazo" || event.type === "Tukio" ? event.type : "",
    description: event.description ?? "",
    start_date: normalizeDate(event.start_date),
    end_date: normalizeDate(event.end_date),
    start_time: normalizeTime(event.start_time),
    location: event.location ?? "",
    audience_group_ids:
      event.audience_group_ids ??
      event.audience_groups?.map((group) => group.id) ??
      [],
  };
}

function buildPayload(form: EventForm) {
  return {
    title: form.title.trim(),
    type: form.type,
    description: form.description.trim(),
    start_date: form.start_date,
    end_date: form.end_date,
    start_time: form.start_time,
    location: form.location.trim(),
    audience_group_ids: form.audience_group_ids,
  };
}

export default function Matukio() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);

  const fetchGroups = async () => {
    const response = await apiFetch("/groups");
    setGroups(getGroups(response));
  };

  const fetchEvents = async () => {
    const response = await apiFetch("/events?scope=all");
    setEvents(getRecords(response));
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchGroups(), fetchEvents()]);
    } catch (error) {
      await Swal.fire(
        "Hitilafu",
        error instanceof Error ? error.message : "Imeshindikana kupakia matangazo na matukio.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events
      .filter((event) => {
        const groupNames = event.audience_groups?.map((group) => group.name).join(" ") ?? "";
        const matchesSearch = [event.title, event.description, event.location, groupNames]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
        const matchesType = selectedType === "All" || event.type === selectedType;

        return matchesSearch && matchesType;
      })
      .sort(
        (a, b) =>
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      );
  }, [events, search, selectedType]);

  const openCreateModal = () => {
    setEditingEvent(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (event: EventRecord) => {
    setEditingEvent(event);
    setForm(eventToForm(event));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setForm(emptyForm);
  };

  const toggleGroup = (groupId: number) => {
    setForm((current) => ({
      ...current,
      audience_group_ids: current.audience_group_ids.includes(groupId)
        ? current.audience_group_ids.filter((id) => id !== groupId)
        : [...current.audience_group_ids, groupId],
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim() || !form.type || !form.start_date) {
      await Swal.fire(
        "Taarifa Hazijakamilika",
        "Jaza kichwa, aina na tarehe ya kuanza.",
        "warning"
      );
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(form);

      if (editingEvent) {
        await apiFetch(`/events/${editingEvent.id}`, {
          method: "PATCH",
          body: payload,
        });
      } else {
        await apiFetch("/events", {
          method: "POST",
          body: payload,
        });
      }

      await fetchEvents();
      closeModal();
      await Swal.fire(
        "Imefanikiwa",
        editingEvent ? "Taarifa imehaririwa." : "Taarifa imeongezwa.",
        "success"
      );
    } catch (error) {
      await Swal.fire(
        "Hitilafu",
        error instanceof Error ? error.message : "Imeshindikana kuhifadhi taarifa.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (event: EventRecord) => {
    const result = await Swal.fire({
      title: "Futa taarifa?",
      text: `"${event.title}" itaondolewa kwenye mfumo.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Futa",
      cancelButtonText: "Ghairi",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(event.id);
      await apiFetch(`/events/${event.id}`, { method: "DELETE" });
      await fetchEvents();
      await Swal.fire("Imefutwa", "Taarifa imeondolewa.", "success");
    } catch (error) {
      await Swal.fire(
        "Hitilafu",
        error instanceof Error ? error.message : "Imeshindikana kufuta taarifa.",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const audienceNames = (event: EventRecord) =>
    event.audience_groups?.map((group) => group.name).join(", ") || "—";

  return (
    <div className="p-6 text-gray-800 dark:text-white/90">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-white/90">
          <FaCalendarAlt /> Matangazo & Matukio
        </h2>

        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
        >
          + Ongeza
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px]">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tafuta kichwa, maelezo, mahali au kundi..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500"
          />
        </div>

        <select
          value={selectedType}
          onChange={(event) => setSelectedType(event.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          <option value="All">Zote</option>
          <option value="Tangazo">Tangazo</option>
          <option value="Tukio">Tukio</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Inapakia...</p>
      ) : filteredEvents.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Hakuna matangazo au matukio.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="rounded-lg">
              <CardContent>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-gray-800 dark:text-white/90">
                    {event.title}
                  </h3>
                  <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                    {event.type}
                  </span>
                </div>

                {event.description && (
                  <p className="mt-3 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
                    {event.description}
                  </p>
                )}

                <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex gap-2">
                    <FaCalendarAlt className="mt-0.5 shrink-0" />
                    <span>
                      {normalizeDate(event.start_date)}
                      {event.end_date ? ` - ${normalizeDate(event.end_date)}` : ""}
                    </span>
                  </div>

                  {event.start_time && (
                    <div className="flex gap-2">
                      <FaClock className="mt-0.5 shrink-0" />
                      <span>{normalizeTime(event.start_time)}</span>
                    </div>
                  )}

                  {event.location && (
                    <div className="flex gap-2">
                      <FaMapMarkerAlt className="mt-0.5 shrink-0" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Wahusika:
                  </span>{" "}
                  {audienceNames(event)}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(event)}
                    className="flex-1 rounded-md border border-gray-200 py-1.5 text-indigo-600 hover:bg-indigo-50 dark:border-gray-700 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
                  >
                    Hariri
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteEvent(event)}
                    disabled={deletingId === event.id}
                    className="flex items-center justify-center gap-2 rounded-md bg-red-600 px-3 py-1.5 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FaTrash />
                    {deletingId === event.id ? "Inafuta..." : "Futa"}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onClose={closeModal} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 overflow-y-auto p-4">
          <div className="flex min-h-full items-center justify-center">
            <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white p-6 text-gray-800 shadow-xl dark:bg-gray-900 dark:text-white/90">
              <Dialog.Title className="mb-4 text-xl font-bold">
                {editingEvent ? "Hariri Tangazo / Tukio" : "Ongeza Tangazo / Tukio"}
              </Dialog.Title>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Kichwa</label>
                    <input
                      className={fieldClass}
                      value={form.title}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, title: event.target.value }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Aina</label>
                    <select
                      className={fieldClass}
                      value={form.type}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          type: event.target.value as EventForm["type"],
                        }))
                      }
                      required
                    >
                      <option value="">Chagua aina</option>
                      <option value="Tangazo">Tangazo</option>
                      <option value="Tukio">Tukio</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Tarehe ya Kuanza
                    </label>
                    <input
                      className={fieldClass}
                      type="date"
                      value={form.start_date}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, start_date: event.target.value }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Tarehe ya Kumalizika
                    </label>
                    <input
                      className={fieldClass}
                      type="date"
                      value={form.end_date}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, end_date: event.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Saa ya Kuanza</label>
                    <input
                      className={fieldClass}
                      type="time"
                      value={form.start_time}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, start_time: event.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Mahali</label>
                    <input
                      className={fieldClass}
                      value={form.location}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, location: event.target.value }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Maelezo</label>
                  <textarea
                    className={`${fieldClass} min-h-24 resize-y`}
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, description: event.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Wahusika</label>
                  <div className="max-h-44 overflow-y-auto rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                    {groups.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Hakuna makundi yaliyopatikana.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {groups.map((group) => (
                          <label
                            key={group.id}
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                          >
                            <input
                              type="checkbox"
                              checked={form.audience_group_ids.includes(group.id)}
                              onChange={() => toggleGroup(group.id)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{group.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
                  >
                    Ghairi
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Inahifadhi..." : "Hifadhi"}
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
