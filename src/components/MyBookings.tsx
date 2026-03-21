"use client";

import { useEffect, useMemo, useState } from "react";
import { schedule2026, type Game } from "@/data/schedule2026";

type Membership = "landi_batty" | "poori" | "general";

const MEMBERSHIP_LABELS: Record<Membership, string> = {
  landi_batty: "랜디·배티",
  poori: "푸리",
  general: "일반",
};

const PRESALE_DAYS: Record<Membership, number> = {
  landi_batty: 7,
  poori: 6,
  general: 5,
};

function getPresaleDate(gameDate: string, presaleDays: number): Date {
  const d = new Date(gameDate + "T11:00:00+09:00");
  d.setDate(d.getDate() - presaleDays);
  return d;
}

function formatPresaleDate(d: Date): string {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const dayName = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${m}/${day}(${dayName}) 11:00`;
}

function daysUntil(target: Date): number {
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function MyBookings() {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [membership, setMembership] = useState<Membership>("landi_batty");

  // 초기 로드 + 외부 변경 감지
  useEffect(() => {
    function load() {
      try {
        const saved = JSON.parse(localStorage.getItem("bookmarkedGames") || "[]");
        setBookmarks(new Set(saved));
      } catch { setBookmarks(new Set()); }

      const m = localStorage.getItem("membership");
      if (m === "landi_batty" || m === "poori" || m === "general") setMembership(m);
    }
    load();
    window.addEventListener("bookmarks-changed", load);
    window.addEventListener("membership-changed", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("bookmarks-changed", load);
      window.removeEventListener("membership-changed", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const bookedGames = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return schedule2026
      .filter((g: Game) => g.home && bookmarks.has(g.date) && g.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [bookmarks]);

  const presaleDays = PRESALE_DAYS[membership];

  if (bookedGames.length === 0) return null;

  return (
    <div className="mb-6 rounded-2xl border border-landers-gold/30 bg-landers-gold-light p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-lg text-text">
          <span className="mr-1.5">★</span>찜한 경기 예매 일정
        </h3>
        <span className="rounded-full bg-landers-gold/20 px-2.5 py-0.5 text-xs font-medium text-text-dim">
          {MEMBERSHIP_LABELS[membership]} 기준
        </span>
      </div>

      <div className="space-y-2">
        {bookedGames.map((game) => {
          const presaleDate = getPresaleDate(game.date, presaleDays);
          const presaleOpen = new Date() >= presaleDate;
          const gameDay = daysUntil(new Date(game.date + "T00:00:00+09:00"));
          const presaleDaysLeft = presaleOpen ? 0 : daysUntil(presaleDate);

          return (
            <div
              key={game.date}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3"
            >
              {/* 경기 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-text">
                    vs {game.opponent}
                  </span>
                  <span className="text-xs text-text-dim">
                    {game.date.slice(5).replace("-", "/")}({game.day}) {game.time}
                  </span>
                  <span className="rounded-full bg-surface2 px-2 py-0.5 text-[11px] font-medium text-text-dim">
                    D-{gameDay}
                  </span>
                </div>
                {/* 예매 일정 */}
                <div className="mt-1 flex items-center gap-2">
                  {presaleOpen ? (
                    <span className="rounded-md bg-green-50 border border-green-200 px-2 py-0.5 text-xs font-medium text-green-700">
                      선예매 오픈됨
                    </span>
                  ) : (
                    <>
                      <span className="text-xs text-text-dim">
                        선예매: {formatPresaleDate(presaleDate)}
                      </span>
                      {presaleDaysLeft <= 3 && (
                        <span className="rounded-full bg-landers-red/10 px-2 py-0.5 text-[11px] font-semibold text-landers-red">
                          D-{presaleDaysLeft}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* 찜 해제 */}
              <button
                onClick={() => {
                  const next = new Set(bookmarks);
                  next.delete(game.date);
                  setBookmarks(next);
                  localStorage.setItem("bookmarkedGames", JSON.stringify([...next]));
                  window.dispatchEvent(new Event("bookmarks-changed"));
                }}
                className="flex-shrink-0 text-lg text-landers-gold hover:text-text-muted transition-colors"
                title="찜 해제"
              >
                ★
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
