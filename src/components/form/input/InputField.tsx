import React, { forwardRef } from "react";

interface InputProps {
  type?: "text" | "number" | "email" | "password" | "date" | "time" | string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string;
  max?: string;
  step?: number;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}

const InputField = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "text",
      id,
      name,
      placeholder,
      defaultValue,
      value,
      onChange,
      className = "",
      min,
      max,
      step,
      disabled = false,
      success = false,
      error = false,
      hint,
      inputMode,
    },
    ref
  ) => {
    let inputClasses = `
      h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm
      shadow-theme-xs placeholder:text-gray-400
      focus:outline-none focus:ring-3
      dark:bg-gray-900 dark:text-white/90
      dark:placeholder:text-white/30
      ${className}
    `;

    if (disabled) {
      inputClasses += `
        text-gray-500 border-gray-300 cursor-not-allowed
        dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700
      `;
    } else if (error) {
      inputClasses += `
        text-error-800 border-error-500
        focus:ring-error-500/10
      `;
    } else if (success) {
      inputClasses += `
        text-success-500 border-success-400
        focus:ring-success-500/10
      `;
    } else {
      inputClasses += `
        bg-transparent text-gray-800 border-gray-300
        focus:border-brand-300 focus:ring-brand-500/10
        dark:border-gray-700
      `;
    }

    return (
      <div className="relative">
        <input
          ref={ref}
          type={type}
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          inputMode={inputMode}
          className={inputClasses}
        />

        {hint && (
          <p
            className={`mt-1.5 text-xs ${
              error
                ? "text-error-500"
                : success
                ? "text-success-500"
                : "text-gray-500"
            }`}
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;