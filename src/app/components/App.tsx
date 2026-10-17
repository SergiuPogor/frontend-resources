"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Github, Plus, Star } from "lucide-react";
import { getResources, type Resource } from "../../lib/resources";
import { useLikes } from "../hooks/useLikes";
import { SearchBar } from "./SearchBar";
import { CategoryChips } from "./CategoryChips";
import { ResourceRow } from "./ResourceRow";
import { FeaturedPicks } from "./FeaturedPicks";

type SortKey = "featured" | "popular" | "newest";
const SORT_LABELS: Record<SortKey, string> = {
  featured: "Featured first",
  popular: "Most liked",
  newest: "Newest",
};
const isSortKey = (v: string | null): v is SortKey =>
  v === "featured" || v === "popular" || v === "newest";

interface AppProps {
  githubStars: number | null;
  repo: string;
}

function matches(resource: Resource, q: string): boolean {
  if (!q) return true;
  return (
    resource.title.toLowerCase().includes(q) ||
    resource.description.toLowerCase().includes(q) ||
    resource.category.toLowerCase().includes(q) ||
    resource.tags.some((t) => t.toLowerCase().includes(q))
  );
}

const byNewest = (a: Resource, b: Resource) =>
  new Date(b.addedOn).getTime() - new Date(a.addedOn).getTime();

export default function App({ githubStars, repo }: AppProps) {
  const resources = useMemo(() => getResources(), []);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortKey>("featured");
  const { state: likes, toggle } = useLikes();

  // Hydrate filters from the URL once, then keep the URL in sync so a
  // filtered view ("all CSS resources") is shareable.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQuery(p.get("q") ?? "");
    const cats = p.get("cat");
    if (cats) setSelected(new Set(cats.split(",").filter(Boolean)));
    const sort = p.get("sort");
    if (isSortKey(sort)) setSortBy(sort);
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (selected.size) p.set("cat", [...selected].join(","));
    if (sortBy !== "featured") p.set("sort", sortBy);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [hydrated, query, selected, sortBy]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of resources) counts.set(r.category, (counts.get(r.category) ?? 0) + 1);
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [resources]);

  const toggleCategory = useCallback((name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setQuery("");
    setSelected(new Set());
  }, []);

  const q = query.trim().toLowerCase();
  const isBrowsing = q === "" && selected.size === 0;

  const featured = useMemo(
    () => resources.filter((r) => r.isFeatured).sort(byNewest),
    [resources]
  );

  const visible = useMemo(() => {
    const filtered = resources.filter(
      (r) => (selected.size === 0 || selected.has(r.category)) && matches(r, q)
    );
    const countOf = (id: string) =>
      likes.status === "ready" ? likes.counts.get(id) ?? 0 : 0;
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return countOf(b.id) - countOf(a.id) || byNewest(a, b);
        case "newest":
          return byNewest(a, b);
        case "featured":
          return Number(!!b.isFeatured) - Number(!!a.isFeatured) || byNewest(a, b);
      }
    });
  }, [resources, selected, q, sortBy, likes]);

  // While browsing, picks render above the list, so don't repeat them.
  const showPicks = isBrowsing && sortBy === "featured" && featured.length > 0;
  const listed = showPicks ? visible.filter((r) => !r.isFeatured) : visible;

  const repoUrl = `https://github.com/${repo}`;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="/" className="flex min-w-0 items-center gap-2.5" aria-label="Frontend Resources home">
          <Image src="/logo.png" alt="" width={28} height={28} className="shrink-0" priority />
          <span className="truncate font-semibold tracking-tight">Frontend Resources</span>
        </a>
        <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm text-muted hover:bg-surface hover:text-ink"
            aria-label={
              githubStars !== null
                ? `GitHub repository, ${githubStars} stars`
                : "GitHub repository"
            }
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            {githubStars !== null && (
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Star className="h-3.5 w-3.5" aria-hidden="true" />
                {githubStars.toLocaleString()}
              </span>
            )}
          </a>
          <a
            href={`${repoUrl}/blob/main/CONTRIBUTING.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-3.5 text-sm font-medium text-bg hover:bg-ink/85"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Suggest a resource</span>
            <span className="sm:hidden">Suggest</span>
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-12 sm:px-6 sm:pt-20">
        <h1 className="max-w-[18ch] text-[2.5rem] font-bold leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
          {resources.length} good links for building the web.
        </h1>
        <p className="mt-5 max-w-[56ch] text-lg leading-relaxed text-muted">
          Tools, libraries and guides for frontend developers, picked by the
          community and maintained in the open on GitHub.
        </p>
        <div className="mt-8 max-w-3xl">
          <SearchBar value={query} onChange={setQuery} total={resources.length} />
          <p className="mt-3 flex items-center gap-2 text-sm text-muted">
            <span className="h-2 w-2 rounded-full bg-visited" aria-hidden="true" />
            Links you&apos;ve already opened turn purple.
          </p>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-0 z-30 border-y border-rule bg-bg/90 backdrop-blur supports-[backdrop-filter]:bg-bg/75">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="[mask-image:linear-gradient(to_right,black_calc(100%-40px),transparent)]">
            <CategoryChips
              categories={categories}
              total={resources.length}
              selected={selected}
              onToggle={toggleCategory}
              onClear={() => setSelected(new Set())}
            />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        {showPicks && <FeaturedPicks resources={featured} />}

        <div className="flex items-center justify-between gap-4 pb-3 pt-10">
          <h2 className="text-lg font-semibold tracking-tight" aria-live="polite">
            {isBrowsing
              ? "Everything"
              : `${visible.length} of ${resources.length} resources`}
          </h2>
          <div className="flex shrink-0 items-center gap-4">
            {!isBrowsing && (
              <button
                type="button"
                onClick={clearAll}
                className="hidden text-sm text-link underline-offset-4 hover:underline sm:inline"
              >
                Clear filters
              </button>
            )}
            <label className="relative shrink-0">
              <span className="sr-only">Sort resources</span>
              <select
                value={sortBy}
                onChange={(e) => isSortKey(e.target.value) && setSortBy(e.target.value)}
                className="h-9 cursor-pointer appearance-none rounded-full border border-rule bg-bg pl-3.5 pr-8 text-sm text-ink hover:border-muted focus:border-link focus:outline-none"
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <option key={key} value={key} disabled={key === "popular" && likes.status !== "ready"}>
                    {SORT_LABELS[key]}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden="true"
                viewBox="0 0 12 12"
                className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted"
              >
                <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </label>
          </div>
        </div>

        {listed.length > 0 ? (
          <ul className="divide-y divide-rule border-t border-rule">
            {listed.map((r) => (
              <ResourceRow
                key={r.id}
                resource={r}
                likes={
                  likes.status === "ready"
                    ? { count: likes.counts.get(r.id) ?? 0, isLiked: likes.liked.has(r.id) }
                    : null
                }
                onLikeToggle={() => void toggle(r.id)}
                onTagClick={(tag) => {
                  setQuery(tag);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl bg-surface px-6 py-14 text-center">
            <p className="text-lg font-semibold">
              Nothing matches{q ? ` “${query.trim()}”` : " these filters"}.
            </p>
            <p className="mx-auto mt-2 max-w-[48ch] text-muted">
              Try a broader term, or remove a category. If it should be here,
              suggest it on GitHub.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={clearAll}
                className="h-10 rounded-full bg-ink px-4 text-sm font-medium text-bg hover:bg-ink/85"
              >
                Clear search and filters
              </button>
              <a
                href={`${repoUrl}/blob/main/CONTRIBUTING.md`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center rounded-full border border-rule px-4 text-sm font-medium hover:border-muted"
              >
                Suggest a resource
              </a>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Open source under the MIT license.</p>
          <p>
            Curated by{" "}
            <a href="https://codesandtags.io" className="text-ink hover:underline underline-offset-4">
              codesandtags
            </a>{" "}
            and{" "}
            <a
              href={`${repoUrl}/graphs/contributors`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink hover:underline underline-offset-4"
            >
              contributors
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
