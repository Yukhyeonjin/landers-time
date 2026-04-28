"use client";

import { useEffect, useState } from "react";

type TeamRankRow = {
  rank: number;
  team: string;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: string;
  gamesBehind: string;
  recent10: string;
  streak: string;
  home: string;
  away: string;
};

type RankResponse = {
  rows: TeamRankRow[];
  fetchedAt?: string;
  error?: string;
};

const TEAM_COLORS: Record<string, string> = {
  KIA: "#EA0029",
  두산: "#131230",
  NC: "#315288",
  롯데: "#041E42",
  한화: "#FF6600",
  삼성: "#074CA1",
  LG: "#C30452",
  키움: "#570514",
  KT: "#000000",
  SSG: "#CE0E2D",
};

function StreakBadge({ value }: { value: string }) {
  const isWin = value.endsWith("승");
  const isLoss = value.endsWith("패");
  const cls = isWin
    ? "bg-landers-red/10 text-landers-red"
    : isLoss
    ? "bg-blue-500/10 text-blue-500"
    : "bg-surface2 text-text-dim";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      {value || "-"}
    </span>
  );
}

export default function TeamRank() {
  const [data, setData] = useState<RankResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/team-rank")
      .then((r) => r.json())
      .then((d: RankResponse) => {
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setData({ rows: [], error: e instanceof Error ? e.message : "fail" });
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="h-6 w-40 animate-pulse rounded bg-surface2" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-8 animate-pulse rounded bg-surface2"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.rows.length === 0) {
    return (
      <div className="rounded-2xl border border-landers-red bg-landers-red/5 p-6 text-sm text-landers-red">
        KBO 팀 순위를 불러오지 못했습니다.
        {data?.error && <div className="mt-1 text-xs">({data.error})</div>}
      </div>
    );
  }

  const ssgRow = data.rows.find((r) => r.team === "SSG");
  const fetchedLabel = data.fetchedAt
    ? new Date(data.fetchedAt).toLocaleString("ko-KR", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-surface2 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-dim">
            KBO 리그 팀 순위
          </span>
          {ssgRow && (
            <span className="rounded-full bg-landers-red px-2 py-0.5 text-[11px] font-semibold text-white">
              SSG {ssgRow.rank}위
            </span>
          )}
        </div>
        {fetchedLabel && (
          <span className="text-[10px] text-text-muted">
            {fetchedLabel} 기준
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface2 text-xs text-text-dim">
            <tr>
              <th className="px-2 py-2 text-center font-medium">순위</th>
              <th className="px-2 py-2 text-left font-medium">팀</th>
              <th className="px-2 py-2 text-center font-medium">경기</th>
              <th className="px-2 py-2 text-center font-medium">승</th>
              <th className="px-2 py-2 text-center font-medium">패</th>
              <th className="px-2 py-2 text-center font-medium">무</th>
              <th className="px-2 py-2 text-center font-medium">승률</th>
              <th className="hidden sm:table-cell px-2 py-2 text-center font-medium">
                게임차
              </th>
              <th className="hidden md:table-cell px-2 py-2 text-center font-medium">
                최근10
              </th>
              <th className="px-2 py-2 text-center font-medium">연속</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => {
              const isSSG = row.team === "SSG";
              const color = TEAM_COLORS[row.team] ?? "#888";
              return (
                <tr
                  key={`${row.rank}-${row.team}`}
                  className={`border-b border-border last:border-b-0 ${
                    isSSG
                      ? "bg-landers-red/5 font-semibold"
                      : "hover:bg-surface2"
                  }`}
                >
                  <td className="px-2 py-2 text-center">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                        row.rank <= 5
                          ? "bg-landers-gold-light text-landers-red"
                          : "text-text-dim"
                      }`}
                    >
                      {row.rank}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-left">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-sm"
                        style={{ backgroundColor: color }}
                      />
                      <span className={isSSG ? "text-landers-red" : "text-text"}>
                        {row.team}
                      </span>
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center font-mono text-text-dim">
                    {row.games}
                  </td>
                  <td className="px-2 py-2 text-center font-mono text-text">
                    {row.wins}
                  </td>
                  <td className="px-2 py-2 text-center font-mono text-text-dim">
                    {row.losses}
                  </td>
                  <td className="px-2 py-2 text-center font-mono text-text-muted">
                    {row.draws}
                  </td>
                  <td className="px-2 py-2 text-center font-mono text-text">
                    {row.winRate}
                  </td>
                  <td className="hidden sm:table-cell px-2 py-2 text-center font-mono text-text-dim">
                    {row.gamesBehind}
                  </td>
                  <td className="hidden md:table-cell px-2 py-2 text-center text-xs text-text-dim">
                    {row.recent10}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <StreakBadge value={row.streak} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border bg-surface2 px-4 py-2 text-[10px] text-text-muted">
        ※ 출처: koreabaseball.com — 10분마다 자동 갱신
      </div>
    </div>
  );
}
