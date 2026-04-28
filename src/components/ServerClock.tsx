"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ServerClock as Clock } from "@/lib/serverTime";

const TICKET_OPEN_HOUR = 11;
const SETTINGS_KEY = "landers-alarm-settings";

type AlarmSettings = {
  fiveMin: boolean;
  oneMin: boolean;
  tenSec: boolean;
};

const DEFAULT_SETTINGS: AlarmSettings = {
  fiveMin: true,
  oneMin: true,
  tenSec: false,
};

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

const computeNextOpen = (nowMs: number) => {
  const d = new Date(nowMs);
  d.setHours(TICKET_OPEN_HOUR, 0, 0, 0);
  if (d.getTime() <= nowMs - 10_000) {
    d.setDate(d.getDate() + 1);
  }
  return d.getTime();
};

export default function ServerClockWidget() {
  const [time, setTime] = useState<Date | null>(null);
  const [synced, setSynced] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [source, setSource] = useState<"ssg" | "local">("local");
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [rtt, setRtt] = useState<number>(0);

  const [settings, setSettings] = useState<AlarmSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [target, setTarget] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number>(0);
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [notifGranted, setNotifGranted] = useState<boolean>(false);

  const triggeredRef = useRef<Set<string>>(new Set());
  const audioCtxRef = useRef<AudioContext | null>(null);
  const settingsBoxRef = useRef<HTMLDivElement | null>(null);
  const alertTimerRef = useRef<number | null>(null);

  // load settings
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AlarmSettings>;
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch {
      /* noop */
    }
    if ("Notification" in window) {
      setNotifGranted(Notification.permission === "granted");
    }
  }, []);

  // persist settings
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* noop */
    }
  }, [settings]);

  // recompute next open every 30s + on mount
  useEffect(() => {
    const update = () => {
      const next = computeNextOpen(Clock.now());
      setTarget((prev) => {
        if (prev !== next) triggeredRef.current.clear();
        return next;
      });
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  // close settings popover on outside click
  useEffect(() => {
    if (!showSettings) return;
    const onClick = (e: MouseEvent) => {
      if (
        settingsBoxRef.current &&
        !settingsBoxRef.current.contains(e.target as Node)
      ) {
        setShowSettings(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [showSettings]);

  const ensureAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const Ctor =
        window.AudioContext || (window as WebkitWindow).webkitAudioContext;
      if (Ctor) audioCtxRef.current = new Ctor();
    }
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }
  }, []);

  const beep = useCallback(
    (freq: number, duration: number, volume = 0.3) => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + duration,
        );
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {
        /* noop */
      }
    },
    [],
  );

  const notify = useCallback((title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, { body });
      } catch {
        /* noop */
      }
    }
  }, []);

  const flashAlert = useCallback((label: string) => {
    setActiveAlert(label);
    if (alertTimerRef.current) window.clearTimeout(alertTimerRef.current);
    alertTimerRef.current = window.setTimeout(
      () => setActiveAlert(null),
      4000,
    );
  }, []);

  const requestNotification = useCallback(async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      const result = await Notification.requestPermission();
      setNotifGranted(result === "granted");
    } else {
      setNotifGranted(Notification.permission === "granted");
    }
  }, []);

  const toggleSetting = (key: keyof AlarmSettings) => {
    ensureAudio();
    requestNotification();
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  };

  const doSync = useCallback(async () => {
    setSyncing(true);
    await Clock.sync();
    setSource(Clock.source);
    setRtt(Clock.rttMs);
    setLastSync(Clock.lastSyncAt);
    setSynced(true);
    setSyncing(false);
  }, []);

  useEffect(() => {
    doSync();
    const syncInterval = setInterval(doSync, 6_500);
    const tickInterval = setInterval(() => {
      const now = Clock.now();
      setTime(new Date(now));

      if (!target) return;
      const rem = target - now;
      setRemaining(rem);

      // 5분 전 (한 번)
      if (
        settings.fiveMin &&
        rem <= 300_000 &&
        rem > 299_000 &&
        !triggeredRef.current.has("5min")
      ) {
        triggeredRef.current.add("5min");
        beep(700, 0.2, 0.4);
        window.setTimeout(() => beep(700, 0.2, 0.4), 350);
        notify("⏰ 선예매 5분 전", "SSG 랜더스 티켓 선예매 5분 전입니다.");
        flashAlert("선예매 오픈 5분 전");
      }

      // 1분 전 (한 번)
      if (
        settings.oneMin &&
        rem <= 60_000 &&
        rem > 59_000 &&
        !triggeredRef.current.has("1min")
      ) {
        triggeredRef.current.add("1min");
        beep(900, 0.25, 0.45);
        window.setTimeout(() => beep(900, 0.25, 0.45), 350);
        notify("⏰ 선예매 1분 전", "곧 SSG 랜더스 티켓 선예매가 시작됩니다.");
        flashAlert("선예매 오픈 1분 전");
      }

      // 10초 카운트다운 (옵션)
      if (settings.tenSec && rem > 0 && rem <= 10_000) {
        const sec = Math.ceil(rem / 1000);
        const key = `t${sec}`;
        if (!triggeredRef.current.has(key)) {
          triggeredRef.current.add(key);
          beep(sec === 1 ? 1100 : 800, 0.08, 0.3);
        }
      }

      // 0초 도달
      if (rem <= 0 && rem > -2000 && !triggeredRef.current.has("zero")) {
        triggeredRef.current.add("zero");
        beep(1400, 0.5, 0.55);
        window.setTimeout(() => beep(1400, 0.5, 0.55), 600);
        window.setTimeout(() => beep(1400, 0.5, 0.55), 1200);
        notify(
          "🎫 선예매 오픈!",
          "SSG 랜더스 티켓 선예매가 시작되었습니다.",
        );
        flashAlert("🎫 선예매 오픈!");
      }
    }, 50);

    return () => {
      clearInterval(syncInterval);
      clearInterval(tickInterval);
    };
  }, [doSync, target, settings, beep, notify, flashAlert]);

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

  const formatRemaining = (ms: number) => {
    const sign = ms < 0 ? "-" : "";
    const abs = Math.abs(ms);
    const totalSec = Math.floor(abs / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const ms3 = String(abs % 1000).padStart(3, "0");
    const pad = (n: number) => String(n).padStart(2, "0");
    if (abs >= 3_600_000) {
      return `${sign}${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    if (abs >= 60_000) {
      return `${sign}${pad(m)}:${pad(s)}`;
    }
    return `${sign}${pad(s)}.${ms3}`;
  };

  const isLocal = source === "local";
  const isFinal10 = remaining > 0 && remaining <= 10_000;
  const isFinal60 = remaining > 0 && remaining <= 60_000;
  const isReached = remaining <= 0 && remaining > -10_000 && target !== null;
  const isTomorrow = target
    ? new Date(target).getDate() !== new Date(Clock.now()).getDate()
    : false;

  const countdownColor = isFinal10
    ? "text-landers-red"
    : isFinal60
    ? "text-landers-gold"
    : "text-text";

  return (
    <div
      className={`relative rounded-2xl border p-6 transition-all ${
        isLocal && synced
          ? "border-landers-gold bg-landers-gold-light"
          : isFinal10 || isReached
          ? "border-landers-red bg-surface"
          : "border-border bg-surface"
      }`}
    >
      {/* 알림 플래시 배너 */}
      {activeAlert && (
        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 animate-fade-in-down rounded-full bg-landers-red px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
          🔔 {activeAlert}
        </div>
      )}

      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className={`inline-block h-3 w-3 rounded-full ${
              isLocal && synced ? "bg-landers-red" : "bg-green-500"
            }`}
          />
          <span className="truncate text-sm text-text-dim">
            {isLocal && synced
              ? "로컬 시간 — 서버 동기화 실패"
              : "ticket.ssg.com 서버 시각"}
          </span>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <div className="relative" ref={settingsBoxRef}>
            <button
              onClick={() => {
                ensureAudio();
                setShowSettings((v) => !v);
              }}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                settings.fiveMin || settings.oneMin || settings.tenSec
                  ? "border-landers-red text-landers-red"
                  : "border-border text-text-dim hover:border-landers-red hover:text-landers-red"
              }`}
              title="알림 설정"
            >
              🔔 알림
            </button>
            {showSettings && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm sm:hidden"
                  aria-hidden="true"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setShowSettings(false);
                  }}
                />
                <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-5 shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-72 sm:max-w-none sm:translate-x-0 sm:translate-y-0 sm:p-4">
                <h4 className="mb-2 text-sm font-semibold text-text">
                  선예매 알림 설정
                </h4>
                <p className="mb-3 text-xs text-text-muted">
                  매일 오전 11시 (랜더스 선예매 오픈) 기준
                </p>
                <div className="space-y-2.5">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-text">
                    <input
                      type="checkbox"
                      checked={settings.fiveMin}
                      onChange={() => toggleSetting("fiveMin")}
                      className="h-4 w-4 accent-landers-red"
                    />
                    5분 전 알림
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-text">
                    <input
                      type="checkbox"
                      checked={settings.oneMin}
                      onChange={() => toggleSetting("oneMin")}
                      className="h-4 w-4 accent-landers-red"
                    />
                    1분 전 알림
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-text">
                    <input
                      type="checkbox"
                      checked={settings.tenSec}
                      onChange={() => toggleSetting("tenSec")}
                      className="h-4 w-4 accent-landers-red"
                    />
                    10초 카운트다운 비프음
                  </label>
                </div>
                <div className="mt-3 border-t border-border pt-3">
                  <button
                    onClick={() => {
                      ensureAudio();
                      requestNotification();
                      beep(900, 0.15, 0.35);
                    }}
                    className="w-full rounded-lg border border-border px-3 py-1.5 text-xs text-text-dim transition-all hover:border-landers-red hover:text-landers-red"
                  >
                    🔊 테스트 비프 / 알림 권한 활성화
                  </button>
                  <p className="mt-2 text-[11px] text-text-muted">
                    {notifGranted
                      ? "✅ 브라우저 알림 권한 허용됨"
                      : "⚠️ 브라우저 알림이 꺼져 있습니다 — 테스트 버튼 클릭 시 권한 요청"}
                  </p>
                </div>
              </div>
              </>
            )}
          </div>
          <button
            onClick={doSync}
            disabled={syncing}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-dim transition-all hover:border-landers-red hover:text-landers-red disabled:opacity-50"
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
            <span className="hidden sm:inline">
              {syncing ? "동기화 중..." : "수동 동기화"}
            </span>
          </button>
        </div>
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
              {!isLocal && rtt > 0 && (
                <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface2 px-2.5 py-1">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      rtt <= 100
                        ? "bg-green-500"
                        : rtt <= 300
                        ? "bg-yellow-500"
                        : "bg-landers-red"
                    }`}
                  />
                  <span className="text-xs font-mono text-text-dim">
                    {rtt}ms
                  </span>
                  <span className="text-[10px] text-text-muted">
                    (±{Math.round(rtt / 2)}ms 오차)
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-text-muted">
              ※ 6.5초마다 자동 재동기화 — 네트워크 RTT 절반 보정 적용
            </p>
          </div>
        </>
      )}

      {/* 11시 선예매 카운트다운 */}
      {target && synced && (
        <div
          className={`mt-5 rounded-xl border p-4 transition-all ${
            isReached
              ? "border-landers-red bg-landers-red/10"
              : isFinal10
              ? "border-landers-red bg-landers-red/5"
              : isFinal60
              ? "border-landers-gold bg-landers-gold-light"
              : "border-border bg-surface2"
          }`}
        >
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-text-dim">
              🎫 다음 선예매 오픈 ({isTomorrow ? "내일" : "오늘"} 11:00)
              {isReached ? " 도달 후 경과" : "까지"}
            </span>
            <div className="flex flex-wrap gap-1">
              {settings.fiveMin && (
                <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] text-text-muted">
                  5분
                </span>
              )}
              {settings.oneMin && (
                <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] text-text-muted">
                  1분
                </span>
              )}
              {settings.tenSec && (
                <span className="rounded-full border border-landers-red bg-surface px-2 py-0.5 text-[10px] text-landers-red">
                  10초 ⏱
                </span>
              )}
            </div>
          </div>
          <div
            className={`whitespace-nowrap font-countdown text-3xl font-bold tabular-nums tracking-wider sm:text-4xl ${countdownColor}`}
          >
            {formatRemaining(remaining)}
          </div>
        </div>
      )}
    </div>
  );
}
