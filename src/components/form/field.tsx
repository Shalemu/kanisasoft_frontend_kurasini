interface Props {
  label: string;
  name: string;
  value: string;
  onChange: any;
  type?: string;
  required?: boolean;
  placeholder?: string;
}

export default function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: Props) {
  return (
    <div className="w-full">

      {/* Label */}
      <label className="mb-2 block text-sm font-medium text-gray-800">
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
        className="
          w-full rounded-xl border border-gray-300 bg-white px-4 py-3
          text-gray-900 placeholder:text-gray-500
          shadow-sm outline-none transition

          focus:border-blue-500 focus:ring-4 focus:ring-blue-100
          hover:border-gray-400
        "
      />
    </div>
  );
}