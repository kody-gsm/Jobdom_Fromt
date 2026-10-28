"use client";

import { useEffect, useId, useRef, useState } from "react";
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
  const [pendingValue, setPendingValue] = useState<T[]>(() => [...value]);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selected = new Set(pendingValue);
  const applied = new Set(value);
  const pendingOptions = options.filter((option) => selected.has(option.value));
  const appliedOptions = options.filter((option) => applied.has(option.value));
  const label = appliedOptions.length === 0
    ? allLabel
    : appliedOptions.length === 1
      ? appliedOptions[0].label
      : `${appliedOptions.length}개 선택`;

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

  const toggle = (option: T) => {
    const next = selected.has(option)
      ? pendingValue.filter((current) => current !== option)
      : [...pendingValue, option];
    setPendingValue(next);
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        ref={buttonRef}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          if (!open) setPendingValue([...value]);
          setOpen((current) => !current);
        }}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#E1E6EB] bg-white px-4 text-sm font-bold text-[#4E5B6B] transition-colors hover:border-brand hover:text-brand-accent focus-visible:outline-2 focus-visible:outline-brand"
      >
        <FiFilter aria-hidden="true" className="text-base" />
        <span>{label}</span>
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute left-0 top-full z-[60] mt-2 max-h-[calc(100dvh-10rem)] w-[min(13rem,calc(100vw-3rem))] max-w-[calc(100vw-3rem)] overflow-y-auto rounded-xl border border-[#E1E6EB] bg-white p-1.5 shadow-lg sm:left-auto sm:right-0 sm:max-h-none sm:w-max sm:min-w-52 sm:max-w-none sm:overflow-visible"
        >
          <button
            type="button"
            role="menuitemradio"
            aria-checked={pendingOptions.length === 0}
            onClick={() => setPendingValue([])}
            className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-brand-soft ${pendingOptions.length === 0 ? "bg-brand-soft text-brand-accent" : "text-[#4E5B6B]"}`}
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
            onClick={() => {
              onChange([...pendingValue]);
              setOpen(false);
            }}
            className="mt-1 block w-full rounded-lg border-t border-[#E1E6EB] px-3 py-2.5 text-center text-sm font-bold text-brand-accent hover:bg-brand-soft"
          >
            적용
          </button>
        </div>
      ) : null}
    </div>
  );
};
