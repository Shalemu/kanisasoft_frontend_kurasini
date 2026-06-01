"use client";

import { useEffect } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { Calendar } from "lucide-react";

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: (dates: Date[]) => void;
  defaultDate?: Date | Date[];
  label?: string;
  placeholder?: string;
};

export default function DatePicker({
  id,
  mode = "single",
  onChange,
  label,
  defaultDate,
  placeholder = "Chagua tarehe",
}: PropsType) {
  useEffect(() => {
    const instance = flatpickr(`#${id}`, {
      mode,
      static: true,
      monthSelectorType: "static",
      dateFormat: "Y-m-d",
      defaultDate,
      onChange: (selectedDates: Date[]) => {
        if (onChange) {
          onChange(selectedDates);
        }
      },
    });

    return () => {
      if (!Array.isArray(instance)) {
        instance.destroy();
      }
    };
  }, [id, mode, defaultDate, onChange]);

  return (
    <div className="w-full">

      {/* Label */}
      {label && (
        <Label htmlFor={id}>
          {label}
        </Label>
      )}

      {/* Input */}
      <div className="relative">

        <input
          id={id}
          placeholder={placeholder}
          className="
            w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12
            text-gray-900 shadow-sm outline-none transition
            placeholder:text-gray-400
            focus:border-blue-500 focus:ring-4 focus:ring-blue-100
          "
        />

        {/* Calendar Icon */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Calendar size={18} />
        </span>

      </div>
    </div>
  );
}