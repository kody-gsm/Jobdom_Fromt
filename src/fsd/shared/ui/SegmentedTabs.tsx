import type { ReactNode } from "react";

export type SegmentedTabItem<T extends string> = {
  value: T;
  label: ReactNode;
};

type SegmentedTabsProps<T extends string> = {
  ariaLabel: string;
  className?: string;
  items: readonly SegmentedTabItem<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedTabs<T extends string>({
  ariaLabel,
  className = "",
  items,
  onChange,
  value,
}: SegmentedTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`inline-flex rounded-xl bg-[#F3F5F7] p-1 ${className}`}
    >
      {items.map((item) => {
        const isSelected = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(item.value)}
            className={`min-w-24 rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
              isSelected
                ? "bg-white text-[#02C551] shadow-sm"
                : "text-[#777C82] hover:text-[#202124]"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
