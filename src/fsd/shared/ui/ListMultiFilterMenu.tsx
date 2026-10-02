"use client";

import { useId, useState } from "react";
import { FiFilter } from "react-icons/fi";
import type { ListFilterOption } from "./ListFilterMenu.tsx";

type ListMultiFilterMenuProps<T extends string> = {
  value: readonly T[];
  options: readonly ListFilterOption<T>[];
  onChange: (value: T[]) => void;
  ariaLabel: string;
  allLabel?: string;
};

export const ListMultiFilterMenu = <T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  allLabel = "전체",
}: ListMultiFilterMenuProps<T>) => {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const selected = new Set(value);
  const selectedOptions = options.filter((option) => selected.has(option.value));
  const label = selectedOptions.length === 0
    ? allLabel
    : selectedOptions.length === 1
      ? selectedOptions[0].label
      : `${selectedOptions.length}개 선택`;

  const toggle = (option: T) => {
    const next = selected.has(option)
      ? value.filter((current) => current !== option)
      : [...value, option];
    onChange(next);
  };

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
        <span>{label}</span>
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 min-w-52 rounded-xl border border-[#E1E6EB] bg-white p-1.5 shadow-lg"
        >
          <button
            type="button"
            role="menuitemradio"
            aria-checked={selectedOptions.length === 0}
            onClick={() => onChange([])}
            className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-brand-soft ${selectedOptions.length === 0 ? "bg-brand-soft text-brand-accent" : "text-[#4E5B6B]"}`}
          >
            {allLabel}
          </button>
          {options.map((option) => {
            const checked = selected.has(option.value);
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemcheckbox"
                aria-checked={checked}
                onClick={() => toggle(option.value)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-brand-soft ${checked ? "bg-brand-soft text-brand-accent" : "text-[#4E5B6B]"}`}
              >
                <span aria-hidden="true" className="inline-flex h-4 w-4 items-center justify-center rounded border border-current text-[11px] leading-none">
                  {checked ? "✓" : null}
                </span>
                {option.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-1 block w-full rounded-lg border-t border-[#E1E6EB] px-3 py-2.5 text-center text-sm font-bold text-brand-accent hover:bg-brand-soft"
          >
            적용
          </button>
        </div>
      ) : null}
    </div>
  );
};
