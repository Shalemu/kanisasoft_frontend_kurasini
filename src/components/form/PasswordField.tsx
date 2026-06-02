"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface Props {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export default function PasswordField({
  label,
  name,
  value,
  onChange,
  placeholder = "Ingiza nenosiri",
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="w-full">

      {/* Label */}
      <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
        {label}
      </label>

      {/* Input wrapper */}
      <div className="relative">

        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="
            w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12
            text-gray-900 placeholder:text-gray-500 shadow-sm outline-none transition

            focus:border-blue-500 focus:ring-4 focus:ring-blue-100
            hover:border-gray-400
            dark:border-gray-700 dark:bg-gray-900 dark:text-white/90
            dark:placeholder:text-gray-500 dark:focus:ring-blue-500/10
            dark:hover:border-gray-600
          "
        />

        {/* Toggle button */}
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            text-gray-500 hover:text-gray-700 transition
            dark:text-gray-400 dark:hover:text-white
          "
        >
          {show ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
        </button>
      </div>
    </div>
  );
}
