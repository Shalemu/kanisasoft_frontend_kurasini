"use client";

interface Option {
  value: string;
  label: string;
}

interface Props {
  label?: string;
  name?: string;
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  className?: string;
}

export default function Select({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "-- Chagua --",
  className = "",
}: Props) {
  return (
    <div className="w-full">

      {/* Label */}
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
          {label}
        </label>
      )}

      {/* Select */}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`
          w-full rounded-xl border border-gray-300 bg-white px-4 py-3
          text-gray-900 shadow-sm outline-none transition

          focus:border-blue-500 focus:ring-4 focus:ring-blue-100
          hover:border-gray-400
          dark:border-gray-700 dark:bg-gray-900 dark:text-white/90
          dark:focus:ring-blue-500/10 dark:hover:border-gray-600

          ${className}
        `}
      >

        {/* Placeholder */}
        <option value="" className="text-gray-400">
          {placeholder}
        </option>

        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
