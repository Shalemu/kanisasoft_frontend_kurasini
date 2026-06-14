import type { ChangeEvent, InputHTMLAttributes } from "react";

interface Props {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
}

export default function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  maxLength,
  inputMode,
  pattern,
}: Props) {
  return (
    <div className="w-full">

      {/* Label */}
      <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {/* Input */}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete="off"
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        inputMode={inputMode}
        pattern={pattern}
        className="
          w-full rounded-xl border border-gray-300 bg-white px-4 py-3
          text-gray-900 placeholder:text-gray-500
          shadow-sm outline-none transition

          focus:border-blue-500 focus:ring-4 focus:ring-blue-100
          hover:border-gray-400
          dark:border-gray-700 dark:bg-gray-900 dark:text-white/90
          dark:placeholder:text-gray-500 dark:focus:ring-blue-500/10
          dark:hover:border-gray-600
        "
      />
    </div>
  );
}
