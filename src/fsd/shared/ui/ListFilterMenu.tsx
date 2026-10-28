"use client";

import { useEffect, useId, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        ref={buttonRef}
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
          className="absolute left-0 top-full z-[60] mt-2 max-h-[calc(100dvh-10rem)] w-[min(11rem,calc(100vw-3rem))] max-w-[calc(100vw-3rem)] overflow-y-auto rounded-xl border border-[#E1E6EB] bg-white p-1.5 shadow-lg sm:left-auto sm:right-0 sm:max-h-none sm:w-max sm:min-w-44 sm:max-w-none sm:overflow-visible"
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
