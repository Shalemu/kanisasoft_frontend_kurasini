import React from "react";

interface TextareaProps {
  placeholder?: string;
  rows?: number;
  value?: string;
  name?: string;

  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;

  className?: string;
  disabled?: boolean;
  error?: boolean;
  hint?: string;
}

const TextArea: React.FC<TextareaProps> = ({
  placeholder = "Enter your message",
  rows = 3,
  value = "",
  name,
  onChange,
  className = "",
  disabled = false,
  error = false,
  hint = "",
}) => {
  let textareaClasses = `w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden ${className}`;

  if (disabled) {
    textareaClasses += ` bg-gray-100 opacity-50 text-gray-500 border-gray-300 cursor-not-allowed`;
  } else if (error) {
    textareaClasses += ` border-error-500 focus:ring-error-500/10`;
  } else {
    textareaClasses += ` border-gray-300 focus:ring-brand-500/10`;
  }

  return (
    <div className="relative">
      <textarea
        name={name}
        placeholder={placeholder}
        rows={rows}
        value={value}
        disabled={disabled}
        className={textareaClasses}
        onChange={onChange}   // ✅ direct event
      />

      {hint && (
        <p className={`mt-2 text-sm ${error ? "text-error-500" : "text-gray-500"}`}>
          {hint}
        </p>
      )}
    </div>
  );
};

export default TextArea;