"use client";

import { useEffect, useRef } from "react";

interface CategoryChipsProps {
  categories: ReadonlyArray<{ name: string; count: number }>;
  total: number;
  selected: ReadonlySet<string>;
  onToggle: (category: string) => void;
  onClear: () => void;
}

const base =
  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors";
const on = "border-ink bg-ink text-bg";
const off = "border-rule bg-bg text-ink hover:border-muted";

export function CategoryChips({
  categories,
  total,
  selected,
  onToggle,
  onClear,
}: CategoryChipsProps) {
  const none = selected.size === 0;
  const railRef = useRef<HTMLDivElement>(null);

  // Bring the first active chip into view (e.g. when arriving via ?cat=CSS).
  const firstSelected = categories.find((c) => selected.has(c.name))?.name;
  useEffect(() => {
    if (!firstSelected) return;
    const chip = railRef.current?.querySelector<HTMLElement>(
      `[data-chip="${CSS.escape(firstSelected)}"]`
    );
    chip?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [firstSelected]);

  return (
    <div
      ref={railRef}
      role="group"
      aria-label="Filter by category"
      className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 py-3 sm:mx-0 sm:px-0"
    >
      <button
        type="button"
        aria-pressed={none}
        onClick={onClear}
        className={`${base} ${none ? on : off}`}
      >
        All
        <span className={none ? "text-bg/70" : "text-muted"}>{total}</span>
      </button>
      {categories.map(({ name, count }) => {
        const active = selected.has(name);
        return (
          <button
            key={name}
            data-chip={name}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(name)}
            className={`${base} ${active ? on : off}`}
          >
            {name}
            <span className={active ? "text-bg/70" : "text-muted"}>{count}</span>
          </button>
        );
      })}
    </div>
  );
}
