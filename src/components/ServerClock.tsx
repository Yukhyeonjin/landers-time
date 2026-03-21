"use client";

import { useCallback, useEffect, useState } from "react";
import { ServerClock as Clock } from "@/lib/serverTime";

export default function ServerClockWidget() {
  const [time, setTime] = useState<Date | null>(null);
  const [synced, setSynced] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [source, setSource] = useState<"ssg" | "local">("local");
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [latency, setLatency] = useState<number>(0);

  const doSync = useCallback(async () => {
    setSyncing(true);
    await Clock.sync();
    setSource(Clock.source);
    setLatency(Clock.latencyMs);
    setLastSync(Clock.lastSyncAt);
    setSynced(true);
    setSyncing(false);
  }, []);

  useEffect(() => {
    doSync();
    const syncInterval = setInterval(doSync, 30_000);
    const tickInterval = setInterval(() => {
      setTime(new Date(Clock.now()));
    }, 50);

    return () => {
      clearInterval(syncInterval);
      clearInterval(tickInterval);
    };
  }, [doSync]);

  const formatTime = (d: Date) => {
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    const ms = String(d.getMilliseconds()).padStart(3, "0");
    return { date: `${y}-${mo}-${day}`, time: `${h}:${mi}:${s}`, ms };
  };

  const timeSinceSync = () => {
    if (!lastSync) return "—";
    const diff = Math.floor((Date.now() - lastSync) / 1000);
    if (diff < 5) return "방금 전";
    if (diff < 60) return `${diff}초 전`;
    return `${Math.floor(diff / 60)}분 전`;
  };

  const isLocal = source === "local";

  return (
    <div
      className={`rounded-2xl border p-6 transition-all ${
        isLocal && synced
          ? "border-landers-gold bg-landers-gold-light"
          : "border-border bg-surface"
      }`}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-3 w-3 rounded-full ${
              isLocal && synced ? "bg-landers-red" : "bg-green-500"
            }`}
          />
          <span className="text-sm text-text-dim">
            {isLocal && synced
              ? "로컬 시간 — 서버 동기화 실패"
              : "ticket.ssg.com 서버 시각"}
          </span>
        </div>
        <button
          onClick={doSync}
          disabled={syncing}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-dim transition-all hover:border-landers-red hover:text-landers-red disabled:opacity-50"
        >
          <svg
            className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {syncing ? "동기화 중..." : "수동 동기화"}
        </button>
      </div>

      {/* Clock Display */}
      {!synced || !time ? (
        <div className="space-y-3">
          <div className="h-6 w-32 animate-pulse rounded bg-surface2" />
          <div className="h-12 w-64 animate-pulse rounded bg-surface2" />
          <div className="h-4 w-48 animate-pulse rounded bg-surface2" />
        </div>
      ) : (
        <>
          <div className="font-mono text-lg text-text-dim mb-1">
            {formatTime(time).date}
          </div>
          <div className="font-mono text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-text whitespace-nowrap">
            {formatTime(time).time}
            <span className="text-landers-red min-w-[4ch] inline-block">
              .{formatTime(time).ms}
            </span>
          </div>

          {/* Info */}
          <div className="mt-5 space-y-1.5 text-sm text-text-dim">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p>
                마지막 동기화:{" "}
                <span className="text-text">{timeSinceSync()}</span>
              </p>
              {!isLocal && latency > 0 && (
                <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface2 px-2.5 py-1">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      latency <= 100
                        ? "bg-green-500"
                        : latency <= 300
                        ? "bg-yellow-500"
                        : "bg-landers-red"
                    }`}
                  />
                  <span className="text-xs font-mono text-text-dim">
                    {latency}ms
                  </span>
                  <span className="text-[10px] text-text-muted">
                    (±{Math.round(latency / 2)}ms 오차)
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-text-muted">
              ※ 네트워크 왕복 시간(RTT)의 절반을 보정하여 서버 시각을 추정합니다.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
