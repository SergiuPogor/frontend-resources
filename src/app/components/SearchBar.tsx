"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  total: number;
}

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return (
    el.isContentEditable ||
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT"
  );
}

export function SearchBar({ value, onChange, total }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // "/" focuses search from anywhere on the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !isTypingTarget(e.target)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onChange("");
            e.currentTarget.blur();
          }
        }}
        placeholder={`Search ${total} resources`}
        aria-label="Search resources"
        className="h-14 w-full rounded-2xl border border-rule bg-bg pl-12 pr-14 text-base text-ink shadow-[0_1px_0_rgb(var(--rule))] placeholder:text-muted focus:border-link focus:outline-none focus:ring-4 focus:ring-link/15 sm:text-lg [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-ink"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      ) : (
        <kbd
          className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-rule bg-surface px-2 py-0.5 font-mono text-xs text-muted sm:block"
          aria-hidden="true"
        >
          /
        </kbd>
      )}
    </div>
  );
}
