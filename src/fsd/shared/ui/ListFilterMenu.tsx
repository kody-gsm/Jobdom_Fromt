"use client";

import { useId, useState } from "react";
import { FiFilter } from "react-icons/fi";

export type ListFilterOption<T extends string> = {
  value: T;
  label: string;
};

type ListFilterMenuProps<T extends string> = {
  value: T;
  options: readonly ListFilterOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
};

export const ListFilterMenu = <T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: ListFilterMenuProps<T>) => {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const selected = options.find((option) => option.value === value) || options[0];

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#E1E6EB] bg-white px-4 text-sm font-bold text-[#4E5B6B] transition-colors hover:border-brand hover:text-brand-accent focus-visible:outline-2 focus-visible:outline-brand"
      >
        <FiFilter aria-hidden="true" className="text-base" />
        <span>{selected?.label || "필터"}</span>
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 min-w-44 rounded-xl border border-[#E1E6EB] bg-white p-1.5 shadow-lg"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={option.value === value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-brand-soft ${option.value === value ? "bg-brand-soft text-brand-accent" : "text-[#4E5B6B]"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};
