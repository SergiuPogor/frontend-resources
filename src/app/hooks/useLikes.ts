"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabase } from "../../lib/supabase";

/**
 * Single seam for the likes backend. The UI only sees this union, so swapping
 * Supabase for another store (e.g. Upstash via a route handler) touches this
 * file only.
 */
export type LikesState =
  | { status: "loading" }
  | { status: "unavailable" }
  | {
      status: "ready";
      counts: ReadonlyMap<string, number>;
      liked: ReadonlySet<string>;
    };

type Ready = Extract<LikesState, { status: "ready" }>;

function applyToggle(state: Ready, id: string, like: boolean): Ready {
  const liked = new Set(state.liked);
  const counts = new Map(state.counts);
  const current = counts.get(id) ?? 0;
  if (like) {
    liked.add(id);
    counts.set(id, current + 1);
  } else {
    liked.delete(id);
    counts.set(id, Math.max(0, current - 1));
  }
  return { status: "ready", counts, liked };
}

export function useLikes(): {
  state: LikesState;
  toggle: (resourceId: string) => Promise<void>;
} {
  const [state, setState] = useState<LikesState>({ status: "loading" });
  const stateRef = useRef(state);
  stateRef.current = state;
  const inFlight = useRef(new Set<string>());

  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabase();
    if (!supabase) {
      setState({ status: "unavailable" });
      return;
    }

    (async () => {
      try {
        let {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          const { data, error } = await supabase.auth.signInAnonymously();
          if (error) console.warn("Anonymous sign-in failed:", error.message);
          session = data.session;
        }

        const { data: countsData, error: countsError } = await supabase
          .from("resources")
          .select("id, like_count");
        if (countsError) throw countsError;

        const counts = new Map<string, number>(
          (countsData ?? []).map((r: { id: string; like_count: number | null }) => [
            r.id,
            r.like_count ?? 0,
          ])
        );

        let liked = new Set<string>();
        if (session) {
          const { data: likesData, error: likesError } = await supabase
            .from("likes")
            .select("resource_id")
            .eq("user_id", session.user.id);
          if (likesError) {
            console.warn("Could not load your likes:", likesError.message);
          } else {
            liked = new Set(
              (likesData ?? []).map((l: { resource_id: string }) => l.resource_id)
            );
          }
        }

        if (!cancelled) setState({ status: "ready", counts, liked });
      } catch (err) {
        console.error("Likes backend unavailable:", err);
        if (!cancelled) setState({ status: "unavailable" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback(async (resourceId: string) => {
    const current = stateRef.current;
    const supabase = getSupabase();
    if (current.status !== "ready" || !supabase) return;
    if (inFlight.current.has(resourceId)) return; // ignore double clicks
    inFlight.current.add(resourceId);

    const like = !current.liked.has(resourceId);
    setState((s) => (s.status === "ready" ? applyToggle(s, resourceId, like) : s));

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const { error } = await supabase.functions.invoke("toggle-like", {
        body: { resource_id: resourceId },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
    } catch (err) {
      console.error("Could not save like:", err);
      // Revert by applying the inverse to *current* state, so concurrent
      // toggles on other resources aren't clobbered.
      setState((s) =>
        s.status === "ready" ? applyToggle(s, resourceId, !like) : s
      );
    } finally {
      inFlight.current.delete(resourceId);
    }
  }, []);

  return { state, toggle };
}
