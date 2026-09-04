"use client";

import { useId } from "react";
import type { ReactNode, TextareaHTMLAttributes } from "react";

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: ReactNode;
  error?: string;
};

export const TextAreaField = ({
  className = "",
  error,
  id,
  label,
  ...props
}: TextAreaFieldProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <label htmlFor={inputId} className="flex w-full flex-col gap-2 text-sm font-medium text-[#202124]">
      <span>{label}</span>
      <textarea
        id={inputId}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? errorId : undefined}
        className={`min-h-32 resize-y rounded-xl border bg-white px-4 py-3 text-base font-normal text-[#202124] outline-none transition-colors placeholder:text-[#9AA0A6] ${
          error
            ? "border-[#E53935] focus:border-[#E53935]"
            : "border-[#DDE2E7] focus:border-[#02C551]"
        } ${className}`}
        {...props}
      />
      {error ? (
        <span id={errorId} role="alert" className="text-sm font-normal text-[#D93025]">
          {error}
        </span>
      ) : null}
    </label>
  );
};
