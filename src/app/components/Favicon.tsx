"use client";

import { useEffect, useRef, useState } from "react";
import { TechIcon } from "./TechIcon";

interface FaviconProps {
  url: string;
  category: string;
  size?: "md" | "lg";
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/** Site favicon (DuckDuckGo's icon service: no cookies, no Google ping) with a category-icon fallback. */
export function Favicon({ url, category, size = "md" }: FaviconProps) {
  const host = hostnameOf(url);
  const [failed, setFailed] = useState(host === null);
  const imgRef = useRef<HTMLImageElement>(null);

  // The SSR'd <img> can fail before React attaches onError during hydration.
  useEffect(() => {
    const el = imgRef.current;
    if (el?.complete && el.naturalWidth === 0) setFailed(true);
  }, []);
  const box = size === "lg" ? "h-11 w-11 rounded-xl" : "h-9 w-9 rounded-lg";
  const img = size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <span
      className={`${box} flex shrink-0 items-center justify-center border border-rule bg-surface text-muted`}
      aria-hidden="true"
    >
      {failed || !host ? (
        <TechIcon category={category} className={img} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- third-party icon, no optimisation needed
        <img
          ref={imgRef}
          src={`https://icons.duckduckgo.com/ip3/${host}.ico`}
          alt=""
          width={20}
          height={20}
          loading="lazy"
          decoding="async"
          className={`${img} object-contain`}
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

export function displayHost(url: string): string {
  const host = hostnameOf(url);
  return host ? host.replace(/^www\./, "") : url;
}
