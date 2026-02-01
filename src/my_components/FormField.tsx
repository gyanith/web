"use client";

import React from "react";

type FormFieldProps = {
  label: string;
  placeholder: string;
  type: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
};

const FormField = ({
  label,
  type,
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
}: FormFieldProps) => {
  return (
    <div className="w-full h-fit mx-auto px-4 sm:px-0">
      <label className="block text-white text-sm mb-3">{label}</label>

      <div className="relative">
        <input
          aria-label={label}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full bg-transparent focus:outline-0 font-bold border-b border-[#FFFFFF30] transition-all text-white duration-200 placeholder:font-light placeholder:text-[#FFFFFF50] shadow-sm pb-2 ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          } ${error ? "border-red-500" : ""}`}
          name={label}
          type={type}
        />
        {error && (
          <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default FormField;
