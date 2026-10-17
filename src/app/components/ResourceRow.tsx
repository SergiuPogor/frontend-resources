import type { Resource } from "../../lib/resources";
import { Favicon, displayHost } from "./Favicon";
import { LikeButton } from "./LikeButton";

interface ResourceRowProps {
  resource: Resource;
  /** null hides the like control (backend loading or unavailable). */
  likes: { count: number; isLiked: boolean } | null;
  onLikeToggle: () => void;
  onTagClick: (tag: string) => void;
}

/**
 * One row of the index. The title is a real <a> so the browser's :visited
 * state applies — opened resources turn purple. A stretched ::after makes the
 * whole row clickable; tags and like sit above it with z-10.
 */
export function ResourceRow({
  resource,
  likes,
  onLikeToggle,
  onTagClick,
}: ResourceRowProps) {
  return (
    <li className="group relative flex gap-4 py-5 sm:gap-5">
      <Favicon url={resource.url} category={resource.category} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[1.0625rem] font-semibold leading-snug text-link decoration-2 underline-offset-4 visited:text-visited after:absolute after:inset-0 after:content-[''] group-hover:underline"
          >
            {resource.title}
          </a>
          <span className="text-sm text-muted">{displayHost(resource.url)}</span>
        </div>

        <p className="mt-1 line-clamp-2 max-w-[68ch] text-[0.9375rem] leading-relaxed text-muted">
          {resource.description}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="text-ink/80 md:hidden">{resource.category}</span>
          {resource.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick(tag)}
              className="relative z-10 text-muted hover:text-ink hover:underline underline-offset-2"
              aria-label={`Search for ${tag}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      <span className="hidden w-36 shrink-0 pt-0.5 text-sm text-ink/80 md:block">
        {resource.category}
      </span>

      <div className="w-14 shrink-0 text-right">
        {likes && (
          <LikeButton
            title={resource.title}
            count={likes.count}
            isLiked={likes.isLiked}
            onToggle={onLikeToggle}
          />
        )}
      </div>
    </li>
  );
}
