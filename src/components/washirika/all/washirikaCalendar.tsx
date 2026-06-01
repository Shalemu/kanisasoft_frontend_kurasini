"use client";

import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  EventInput,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";

import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
  };
}

const WashirikaCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("");

  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const calendarsEvents = {
    Danger: "danger",
    Success: "success",
    Primary: "primary",
    Warning: "warning",
  };

  // Initial events
  useEffect(() => {
    setEvents([
      {
        id: "1",
        title: "Mkutano wa Washirika",
        start: new Date().toISOString().split("T")[0],
        extendedProps: { calendar: "Primary" },
      },
      {
        id: "2",
        title: "Maombi ya Jumuiya",
        start: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        extendedProps: { calendar: "Success" },
      },
    ]);
  }, []);

  // Select date
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetForm();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    openModal();
  };

  // Click event
  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;

    setSelectedEvent(event as unknown as CalendarEvent);
    setEventTitle(event.title);
    setEventStartDate(event.start?.toISOString().split("T")[0] || "");
    setEventEndDate(event.end?.toISOString().split("T")[0] || "");
    setEventLevel(event.extendedProps.calendar);

    openModal();
  };

  // Add or update
  const handleSaveEvent = () => {
    if (!eventTitle || !eventStartDate) return;

    if (selectedEvent) {
      // Update
      setEvents((prev) =>
        prev.map((e) =>
          e.id === selectedEvent.id
            ? {
                ...e,
                title: eventTitle,
                start: eventStartDate,
                end: eventEndDate,
                extendedProps: { calendar: eventLevel || "Primary" },
              }
            : e
        )
      );
    } else {
      // Create
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: eventTitle,
        start: eventStartDate,
        end: eventEndDate,
        allDay: true,
        extendedProps: { calendar: eventLevel || "Primary" },
      };

      setEvents((prev) => [...prev, newEvent]);
    }

    closeModal();
    resetForm();
  };

  const resetForm = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("");
    setSelectedEvent(null);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/5">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable
        events={events}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventContent={renderEventContent}
        headerToolbar={{
          left: "prev,next today addEventButton",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        customButtons={{
          addEventButton: {
            text: "Add Event +",
            click: openModal,
          },
        }}
      />

      {/* MODAL */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-lg p-6"
      >
        <h3 className="text-lg font-semibold mb-4">
          {selectedEvent ? "Edit Event" : "Add Event"}
        </h3>

        <div className="space-y-4">
          {/* Title */}
          <input
            type="text"
            placeholder="Event title"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            className="w-full border p-2 rounded"
          />

          {/* Color */}
          <div className="flex gap-3 flex-wrap">
            {Object.keys(calendarsEvents).map((key) => (
              <button
                key={key}
                onClick={() => setEventLevel(key)}
                className={`px-3 py-1 rounded border ${
                  eventLevel === key ? "bg-black text-white" : ""
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Dates */}
          <input
            type="date"
            value={eventStartDate}
            onChange={(e) => setEventStartDate(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <input
            type="date"
            value={eventEndDate}
            onChange={(e) => setEventEndDate(e.target.value)}
            className="w-full border p-2 rounded"
          />

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>

            <button
              onClick={handleSaveEvent}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {selectedEvent ? "Update" : "Add"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Custom event UI
const renderEventContent = (eventInfo: EventContentArg) => {
  return (
    <div className="text-xs p-1 rounded bg-gray-200">
      <b>{eventInfo.timeText}</b> {eventInfo.event.title}
    </div>
  );
};

export default WashirikaCalendar;