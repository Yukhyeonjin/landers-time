"use client";

import { useEffect, useState } from "react";
import type { ScheduleGame } from "@/app/api/schedule/route";

type State = {
  games: ScheduleGame[];
  loading: boolean;
  error: string | null;
};

let cache: ScheduleGame[] | null = null;
let pending: Promise<ScheduleGame[]> | null = null;
const subscribers = new Set<(games: ScheduleGame[]) => void>();

async function loadOnce(): Promise<ScheduleGame[]> {
  if (cache) return cache;
  if (pending) return pending;
  pending = fetch("/api/schedule")
    .then((r) => r.json())
    .then((data: { games?: ScheduleGame[] }) => {
      cache = data.games ?? [];
      subscribers.forEach((fn) => fn(cache!));
      return cache;
    })
    .catch((e) => {
      pending = null;
      throw e;
    });
  return pending;
}

export function useSchedule(): State {
  const [state, setState] = useState<State>(() => ({
    games: cache ?? [],
    loading: cache === null,
    error: null,
  }));

  useEffect(() => {
    let cancelled = false;
    const sub = (games: ScheduleGame[]) => {
      if (!cancelled) setState({ games, loading: false, error: null });
    };
    if (cache) {
      sub(cache);
    } else {
      subscribers.add(sub);
      loadOnce().catch((e) => {
        if (cancelled) return;
        setState({
          games: [],
          loading: false,
          error: e instanceof Error ? e.message : "fetch failed",
        });
      });
    }
    return () => {
      cancelled = true;
      subscribers.delete(sub);
    };
  }, []);

  return state;
}

export type { ScheduleGame };
