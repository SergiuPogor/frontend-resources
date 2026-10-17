import type { Resource } from "../../lib/resources";
import { Favicon, displayHost } from "./Favicon";

interface FeaturedPicksProps {
  resources: ReadonlyArray<Resource>;
}

export function FeaturedPicks({ resources }: FeaturedPicksProps) {
  if (resources.length === 0) return null;
  return (
    <section aria-labelledby="picks-heading" className="pt-10">
      <h2 id="picks-heading" className="text-lg font-semibold tracking-tight">
        Start here
      </h2>
      <p className="mt-1 text-sm text-muted">
        The maintainers&apos; picks if you only open a few.
      </p>
      <ul className="mt-5 grid gap-3 md:grid-cols-3">
        {resources.map((r) => (
          <li
            key={r.id}
            className="group relative flex flex-col rounded-2xl bg-surface p-5 transition-colors hover:bg-surface/60 hover:ring-1 hover:ring-rule"
          >
            <Favicon url={r.url} category={r.category} size="lg" />
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 text-lg font-semibold leading-snug text-link decoration-2 underline-offset-4 visited:text-visited after:absolute after:inset-0 after:rounded-2xl after:content-[''] group-hover:underline"
            >
              {r.title}
            </a>
            <span className="text-sm text-muted">{displayHost(r.url)}</span>
            <p className="mt-3 line-clamp-3 text-[0.9375rem] leading-relaxed text-muted">
              {r.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
