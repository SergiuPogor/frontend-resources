import { Heart } from "lucide-react";

interface LikeButtonProps {
  title: string;
  count: number;
  isLiked: boolean;
  onToggle: () => void;
}

export function LikeButton({ title, count, isLiked, onToggle }: LikeButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isLiked}
      aria-label={isLiked ? `Unlike ${title}` : `Like ${title}`}
      className={`relative z-10 inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-full px-2.5 text-sm tabular-nums transition-colors ${
        isLiked
          ? "text-like"
          : "text-muted hover:bg-surface hover:text-ink"
      }`}
    >
      <Heart
        className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
        strokeWidth={2}
      />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
