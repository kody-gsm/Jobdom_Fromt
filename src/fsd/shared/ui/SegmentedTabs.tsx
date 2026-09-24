import { useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

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
  id?: string;
  getTabPanelId?: (value: T) => string;
};

export function SegmentedTabs<T extends string>({
  ariaLabel,
  className = "",
  items,
  onChange,
  value,
  id,
  getTabPanelId,
}: SegmentedTabsProps<T>) {
  const selectedIndex = Math.max(0, items.findIndex((item) => item.value === value));
  const [focusedIndex, setFocusedIndex] = useState(selectedIndex);
  const rovingIndex = items[focusedIndex]?.value === value ? focusedIndex : selectedIndex;
  const idPrefix = id ?? `segmented-${ariaLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!items.length) return;
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % items.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + items.length) % items.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = items.length - 1;
    else return;

    event.preventDefault();
    setFocusedIndex(nextIndex);
    onChange(items[nextIndex].value);
    document.getElementById(`${idPrefix}-tab-${items[nextIndex].value}`)?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`inline-flex rounded-xl bg-[#F3F5F7] p-1 ${className}`}
    >
      {items.map((item, index) => {
        const isSelected = item.value === value;
        const tabId = `${idPrefix}-tab-${item.value}`;
        return (
          <button
            key={item.value}
            id={tabId}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-controls={getTabPanelId?.(item.value) ?? `${idPrefix}-panel-${item.value}`}
            tabIndex={index === rovingIndex ? 0 : -1}
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`min-h-11 min-w-24 rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200 ease-out ${
              isSelected
                ? "bg-white text-[#10243E] shadow-sm"
                : "text-[#607089] hover:text-[#315B83]"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
