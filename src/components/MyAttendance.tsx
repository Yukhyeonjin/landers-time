"use client";

import { useEffect, useMemo, useState } from "react";
import { useSchedule, type ScheduleGame } from "@/lib/useSchedule";

const STORAGE_KEY = "attendedGames";
const ALL_STADIUMS = 9;

// 더블헤더 대비 date+time 키
const keyOf = (g: ScheduleGame) => `${g.date}|${g.time}`;

export function titleFor(w: number, l: number, n: number): string {
  if (n < 3) return "🐣 아기 직관러";
  const p = w + l === 0 ? 0 : w / (w + l);
  if (p >= 0.7) return "🧚 인천 승리요정";
  if (p >= 0.55) return "🍀 행운의 직관러";
  if (p >= 0.45) return "⚾ 든든한 직관러";
  if (p >= 0.3) return "🌧 비구름 요정";
  return "👻 패배요정 (미안해…)";
}

async function shareCard(o: {
  n: number; w: number; d: number; l: number; pct: string; title: string; stadiums: number;
}) {
  const c = document.createElement("canvas");
  c.width = 1080;
  c.height = 1350;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, c.height);
  g.addColorStop(0, "#CE0E2D");
  g.addColorStop(1, "#7a0618");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  const font = (s: number, w = 800) => `${w} ${s}px Pretendard, sans-serif`;
  ctx.font = font(56, 600);
  ctx.fillText("2026 나의 랜더스 직관", 540, 200);
  ctx.font = font(220);
  ctx.fillText(o.pct, 540, 500);
  ctx.font = font(72, 700);
  ctx.fillText(`${o.n}경기 · ${o.w}승 ${o.d}무 ${o.l}패`, 540, 640);
  ctx.fillStyle = "#F0C040";
  ctx.font = font(84);
  ctx.fillText(o.title, 540, 830);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = font(48, 500);
  ctx.fillText(`방문 구장 ${o.stadiums}/${ALL_STADIUMS}`, 540, 940);
  ctx.font = font(40, 500);
  ctx.fillText("landers-time.vercel.app", 540, 1250);

  const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/png"));
  if (!blob) return;
  const file = new File([blob], "landers-jikgwan-2026.png", { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: "나의 랜더스 직관" }).catch(() => {});
    return;
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = file.name;
  a.click();
  // 다운로드 시작 전에 해제하면 일부 브라우저에서 실패
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export default function MyAttendance() {
  const { games } = useSchedule();
  const [attended, setAttended] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      setAttended(new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")));
    } catch { /* ignore */ }
  }, []);

  const toggle = (k: string) =>
    setAttended((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch { /* ignore */ }
      return next;
    });

  const played = useMemo(() => games.filter((g) => g.ended && !g.cancelled), [games]);

  const byMonth = useMemo(() => {
    const m = new Map<number, ScheduleGame[]>();
    for (const g of played) {
      const k = Number(g.date.slice(5, 7));
      m.set(k, [...(m.get(k) ?? []), g]);
    }
    return [...m];
  }, [played]);

  const stats = useMemo(() => {
    const mine = played.filter((g) => attended.has(keyOf(g)));
    const w = mine.filter((g) => g.result === "승").length;
    const d = mine.filter((g) => g.result === "무").length;
    const l = mine.filter((g) => g.result === "패").length;
    const pct = w + l === 0 ? ".000" : (w / (w + l)).toFixed(3).replace(/^0/, "");
    const stadiums = new Set(mine.map((g) => g.stadium)).size;
    const homeN = mine.filter((g) => g.home).length;
    return { n: mine.length, w, d, l, pct, stadiums, homeN, title: titleFor(w, l, mine.length) };
  }, [played, attended]);

  if (played.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-1 font-display text-2xl text-text">
        <span className="mr-2">📒</span>나의 직관 다이어리
      </h2>
      <p className="mb-4 text-xs text-text-muted">
        직관한 경기에 도장을 찍으면 직관 승률이 계산돼요 (이 브라우저에만 저장)
      </p>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-lg font-bold text-landers-red">{stats.title}</p>
            <p className="mt-1 text-sm text-text-dim">
              {stats.n}경기 · {stats.w}승 {stats.d}무 {stats.l}패 · 직관 승률{" "}
              <span className="font-semibold text-text">{stats.pct}</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
              <span className="rounded-full bg-surface2 px-2 py-0.5 text-text-dim">
                🏟 구장 {stats.stadiums}/{ALL_STADIUMS}
              </span>
              {stats.stadiums >= ALL_STADIUMS && (
                <span className="rounded-full bg-landers-gold/20 px-2 py-0.5 text-text">🗺 전국 원정러</span>
              )}
              {stats.homeN >= 10 && (
                <span className="rounded-full bg-landers-gold/20 px-2 py-0.5 text-text">🏠 문학 지박령</span>
              )}
            </div>
          </div>
          <button
            onClick={() => shareCard(stats)}
            disabled={stats.n === 0}
            className="rounded-xl bg-landers-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-landers-gold hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
          >
            📸 직관 카드 만들기
          </button>
        </div>

        <details className="group mt-5">
          <summary className="cursor-pointer select-none text-sm font-semibold text-text-dim hover:text-landers-red">
            <span className="group-open:hidden">🔴 도장판 열기</span>
            <span className="hidden group-open:inline">🔴 도장판 접기</span>
            <span className="ml-1 font-normal text-text-muted">({played.length}경기)</span>
          </summary>
        <div className="mt-3 space-y-3">
          {byMonth.map(([m, list]) => (
            <div key={m}>
              <p className="mb-1.5 text-xs font-semibold text-text-dim">{m}월</p>
              <div className="flex flex-wrap gap-1.5">
                {list.map((g) => {
                  const k = keyOf(g);
                  const on = attended.has(k);
                  return (
                    <button
                      key={k}
                      onClick={() => toggle(k)}
                      aria-pressed={on}
                      title={`${g.date.slice(5).replace("-", "/")} vs ${g.opponent} ${g.result ?? ""}`}
                      className={`relative flex h-11 w-11 flex-col items-center justify-center rounded-full border text-[10px] leading-tight transition-transform active:scale-90 ${
                        on
                          ? "border-landers-red bg-landers-red text-white"
                          : g.home
                          ? "border-border bg-surface2 text-text-dim hover:border-landers-red"
                          : "border-dashed border-border text-text-muted hover:border-landers-red"
                      }`}
                    >
                      <span className="font-semibold">{Number(g.date.slice(8))}</span>
                      <span className="opacity-80">{g.opponent}</span>
                      {on && (
                        <span className="absolute -right-1 -top-1 rotate-12 rounded-full bg-landers-gold px-1 text-[9px] font-bold text-text">
                          {g.result}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-text-muted">실선 = 홈 · 점선 = 원정</p>
        </details>
      </div>
    </section>
  );
}
