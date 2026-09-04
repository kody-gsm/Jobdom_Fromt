"use client";

import { useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: ReactNode;
  error?: string;
  endElement?: ReactNode;
};

export const TextField = ({
  className = "",
  endElement,
  error,
  id,
  label,
  ...props
}: TextFieldProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <label htmlFor={inputId} className="flex w-full flex-col gap-2 text-sm font-medium text-[#202124]">
      <span>{label}</span>
      <span className="relative block">
        <input
          id={inputId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : undefined}          className={`h-12 w-full rounded-xl border bg-white px-4 text-base font-normal text-[#202124] outline-none transition-colors placeholder:text-[#9AA0A6] ${
            endElement ? "pr-12" : ""
          } ${
            error
              ? "border-[#E53935] focus:border-[#E53935]"
              : "border-[#DDE2E7] focus:border-[#02C551]"
          } ${className}`}
          {...props}
        />
        {endElement ? (
          <span className="absolute inset-y-0 right-4 flex items-center">{endElement}</span>
        ) : null}
      </span>
      {error ? (
        <span id={errorId} role="alert" className="text-sm font-normal text-[#D93025]">
          {error}
        </span>
      ) : null}
    </label>
  );
};