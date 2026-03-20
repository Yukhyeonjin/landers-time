"use client";

import { useMemo, useState } from "react";
import { schedule2026, type Game } from "@/data/schedule2026";

type Membership = "landi_batty" | "poori" | "general";

const MEMBERSHIPS: { key: Membership; label: string; presaleDays: number }[] = [
  { key: "landi_batty", label: "랜디 · 배티", presaleDays: 7 },
  { key: "poori", label: "푸리", presaleDays: 6 },
  { key: "general", label: "일반", presaleDays: 5 },
];

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
};

function getPresaleOpenStr(gameDate: string, presaleDays: number): string {
  const d = new Date(gameDate + "T11:00:00+09:00");
  d.setDate(d.getDate() - presaleDays);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${m}/${day}(${["일","월","화","수","목","금","토"][d.getDay()]}) 11:00`;
}

function isPresaleOpen(gameDate: string, presaleDays: number): boolean {
  const now = new Date();
  const d = new Date(gameDate + "T11:00:00+09:00");
  d.setDate(d.getDate() - presaleDays);
  return now >= d;
}

function formatDate(dateStr: string, day: string): string {
  const [, m, d] = dateStr.split("-");
  return `${parseInt(m)}/${parseInt(d)}(${day})`;
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const gameDate = new Date(dateStr + "T00:00:00+09:00");
  const diff = gameDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function UpcomingGames() {
  const [membership, setMembership] = useState<Membership>("landi_batty");

  const selectedMembership = MEMBERSHIPS.find((m) => m.key === membership)!;

  const upcomingGames = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);

    return schedule2026
      .filter((game: Game) => game.home && game.date >= todayStr)
      .slice(0, 3);
  }, []);

  return (
    <div>
      {/* 멤버십 선택 */}
      <div className="mb-5 flex flex-wrap gap-2">
        {MEMBERSHIPS.map((m) => (
          <button
            key={m.key}
            onClick={() => setMembership(m.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              membership === m.key
                ? "bg-landers-red text-white shadow-md shadow-landers-red/25"
                : "bg-surface2 text-text-dim hover:text-text hover:bg-border"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* 경기 카드 3개 */}
      {upcomingGames.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="text-text-dim">남은 홈경기가 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {upcomingGames.map((game, i) => {
            const teamColor = TEAM_COLORS[game.opponent] || "#CE0E2D";
            const days = daysUntil(game.date);
            const isUrgent = days <= 2;
            const presaleOpen = isPresaleOpen(game.date, selectedMembership.presaleDays);
            const presaleDate = getPresaleOpenStr(game.date, selectedMembership.presaleDays);

            return (
              <div
                key={game.date + game.opponent}
                className="relative overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                {/* 상단 색상 바 */}
                <div
                  className="h-1.5"
                  style={{ backgroundColor: teamColor }}
                />

                <div className="p-5">
                  {/* D-day 배지 */}
                  <div className="mb-3 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        isUrgent
                          ? "bg-landers-red text-white"
                          : "bg-surface2 text-text-dim"
                      }`}
                    >
                      {days === 0 ? "오늘" : `D-${days}`}
                    </span>
                    {i === 0 && (
                      <span className="text-xs font-medium text-landers-red">
                        가장 가까운 경기
                      </span>
                    )}
                  </div>

                  {/* 상대팀 */}
                  <p className="font-display text-2xl text-text">
                    vs {game.opponent}
                  </p>

                  {/* 날짜 & 시간 */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-text-dim">
                      <span>📅</span>
                      <span>{formatDate(game.date, game.day)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-dim">
                      <span>⏰</span>
                      <span className="font-mono font-semibold text-text">{game.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-dim">
                      <span>🏟</span>
                      <span>{game.stadium}</span>
                    </div>
                  </div>

                  {/* 선예매 오픈 상태 */}
                  <div className={`mt-3 rounded-lg px-3 py-1.5 text-xs font-medium ${
                    presaleOpen
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-surface2 text-text-dim border border-border"
                  }`}>
                    {presaleOpen ? "선예매 오픈됨" : `선예매 ${presaleDate}`}
                  </div>

                  {/* 예매 버튼 */}
                  <a
                    href="https://ticket.ssg.com/ticket"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block rounded-xl bg-landers-red py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-landers-gold hover:text-text"
                  >
                    예매하기 →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
