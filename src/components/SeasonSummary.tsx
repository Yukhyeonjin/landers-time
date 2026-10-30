"use client";

import { useEffect, useMemo, useState } from "react";
import { useSchedule, type ScheduleGame } from "@/lib/useSchedule";
import { TEAM_COLORS } from "@/lib/teamMapping";

// 2027 개막일 발표 시 "YYYY-MM-DD"로 채우기
const OPENING_DAY: string | null = null;

type Record_ ={ w: number; d: number; l: number };

function tally(games: ScheduleGame[]): Record_ {
  const r = { w: 0, d: 0, l: 0 };
  for (const g of games) {
    if (g.result === "승") r.w++;
    else if (g.result === "무") r.d++;
    else if (g.result === "패") r.l++;
  }
  return r;
}

// KBO 승률은 무승부 제외
const pct = (r: Record_) =>
  r.w + r.l === 0 ? ".000" : (r.w / (r.w + r.l)).toFixed(3).replace(/^0/, "");

const fmt = (r: Record_) => `${r.w}승 ${r.d}무 ${r.l}패`;

export default function SeasonSummary() {
  const { games } = useSchedule();
  const [rank, setRank] = useState<number | null>(null);

  const seasonOver =
    games.length > 0 && games.every((g) => g.ended || g.cancelled);

  useEffect(() => {
    if (!seasonOver) return;
    fetch("/api/team-rank")
      .then((r) => r.json())
      .then((d: { rows?: { team: string; rank: number }[] }) =>
        setRank(d.rows?.find((r) => r.team === "SSG")?.rank ?? null),
      )
      .catch(() => {});
  }, [seasonOver]);

  const stats = useMemo(() => {
    const months = [...new Set(games.map((g) => Number(g.date.slice(5, 7))))];
    const opponents = [...new Set(games.map((g) => g.opponent))];
    return {
      total: tally(games),
      home: tally(games.filter((g) => g.home)),
      away: tally(games.filter((g) => !g.home)),
      monthly: months.map((m) => ({
        m,
        r: tally(games.filter((g) => Number(g.date.slice(5, 7)) === m)),
      })),
      vs: opponents
        .map((o) => ({ o, r: tally(games.filter((g) => g.opponent === o)) }))
        .sort((a, b) => b.r.w - b.r.l - (a.r.w - a.r.l)),
    };
  }, [games]);

  if (!seasonOver) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-4 font-display text-2xl text-text">
        <span className="mr-2">🏁</span>2026 시즌 결산
      </h2>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs text-text-muted">정규시즌 최종 성적</p>
            <p className="mt-1 text-3xl font-bold text-text">
              {fmt(stats.total)}
            </p>
            <p className="mt-1 text-sm text-text-dim">
              승률 {pct(stats.total)}
              {rank && <> · <span className="font-semibold text-landers-red">{rank}위</span></>}
            </p>
          </div>
          <div className="flex gap-3 text-sm">
            {([
              ["홈", stats.home],
              ["원정", stats.away],
            ] as const).map(([label, r]) => (
              <div key={label} className="rounded-xl bg-surface2 px-4 py-2 text-center">
                <p className="text-xs text-text-muted">{label}</p>
                <p className="font-semibold text-text">{fmt(r)}</p>
                <p className="text-xs text-text-dim">{pct(r)}</p>
              </div>
            ))}
          </div>
        </div>

        <h3 className="mt-6 mb-2 text-sm font-semibold text-text">월별 승률</h3>
        <div className="space-y-1.5">
          {stats.monthly.map(({ m, r }) => {
            const p = r.w + r.l === 0 ? 0 : r.w / (r.w + r.l);
            return (
              <div key={m} className="flex items-center gap-3 text-xs">
                <span className="w-8 text-text-dim">{m}월</span>
                <div className="relative h-4 flex-1 overflow-hidden rounded bg-surface2">
                  <div
                    className="h-full rounded bg-landers-red/80"
                    style={{ width: `${p * 100}%` }}
                  />
                  {/* 5할 기준선 */}
                  <div className="absolute inset-y-0 left-1/2 w-px bg-text-muted/50" />
                </div>
                <span className="w-28 text-right tabular-nums text-text-dim">
                  {r.w}-{r.d}-{r.l} · {pct(r)}
                </span>
              </div>
            );
          })}
        </div>

        <h3 className="mt-6 mb-2 text-sm font-semibold text-text">상대 전적</h3>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {stats.vs.map(({ o, r }) => (
            <div
              key={o}
              className="rounded-lg border border-border px-2 py-2 text-center"
              style={{ borderTopColor: TEAM_COLORS[o], borderTopWidth: 3 }}
            >
              <p className="text-xs font-semibold text-text">vs {o}</p>
              <p
                className={`text-sm tabular-nums ${
                  r.w > r.l ? "text-landers-red font-semibold" : r.w < r.l ? "text-blue-500" : "text-text-dim"
                }`}
              >
                {r.w}-{r.d}-{r.l}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl bg-surface2 px-4 py-3 text-center text-sm text-text-dim">
          {OPENING_DAY ? (
            <>
              ⚾ 2027 개막까지{" "}
              <span className="font-bold text-landers-red">
                D-{Math.max(0, Math.ceil((new Date(OPENING_DAY + "T00:00:00+09:00").getTime() - Date.now()) / 86_400_000))}
              </span>
            </>
          ) : (
            <>
              <span className="inline-block animate-pulse">💤</span> 랜더스는 지금 겨울잠 중… 2027 개막일이 발표되면 D-day를 알려드릴게요
            </>
          )}
        </div>
      </div>
    </section>
  );
}
