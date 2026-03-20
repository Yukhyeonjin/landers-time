"use client";

import { useEffect, useMemo, useState } from "react";
import { schedule2026, type Game } from "@/data/schedule2026";

const MONTHS = [3, 4, 5, 6, 7, 8, 9];
const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

type LocationFilter = "all" | "home" | "away";

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

// API 실패 시 사용할 폴백 데이터
const HOLIDAYS_FALLBACK: Record<string, string> = {
  "2026-05-05": "어린이날",
  "2026-05-24": "부처님오신날",
  "2026-06-06": "현충일",
  "2026-08-15": "광복절",
  "2026-09-26": "추석 연휴",
  "2026-09-27": "추석",
  "2026-09-28": "추석 연휴",
};

function getToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ScheduleTable() {
  const today = getToday();
  const currentMonth = new Date().getMonth() + 1;
  const defaultMonth = MONTHS.includes(currentMonth) ? currentMonth : 3;
  const [activeMonth, setActiveMonth] = useState(defaultMonth);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [locationFilter, setLocationFilter] = useState<LocationFilter>("all");
  const [holidays, setHolidays] = useState<Record<string, string>>(HOLIDAYS_FALLBACK);

  useEffect(() => {
    fetch(`/api/holidays?solYear=2026`)
      .then((res) => res.json())
      .then((data) => {
        if (data.holidays && Object.keys(data.holidays).length > 0) {
          setHolidays(data.holidays);
        }
      })
      .catch(() => {});
  }, []);

  function getDayColor(dayOfWeek: number, dateStr: string) {
    if (holidays[dateStr]) return "text-landers-red";
    if (dayOfWeek === 0) return "text-landers-red";
    if (dayOfWeek === 6) return "text-blue-500";
    return "text-text";
  }

  // 목록용: 해당 월 + 필터
  const filtered = useMemo(() => {
    return schedule2026.filter((g: Game) => {
      const month = parseInt(g.date.split("-")[1], 10);
      if (month !== activeMonth) return false;
      if (locationFilter === "home") return g.home;
      if (locationFilter === "away") return !g.home;
      return true;
    });
  }, [activeMonth, locationFilter]);

  // 달력용: 전체 경기 맵 (전후월 포함)
  const gameMap = useMemo(() => {
    const map: Record<string, Game> = {};
    const games = schedule2026.filter((g: Game) => {
      if (locationFilter === "home") return g.home;
      if (locationFilter === "away") return !g.home;
      return true;
    });
    for (const g of games) {
      map[g.date] = g;
    }
    return map;
  }, [locationFilter]);

  const isPast = (date: string) => date < today;
  const isToday = (date: string) => date === today;

  // 달력 데이터 생성 (전후월 포함 7x5 = 35칸)
  const calendarDays = useMemo(() => {
    const year = 2026;
    const firstDay = new Date(year, activeMonth - 1, 1);
    const lastDay = new Date(year, activeMonth, 0);
    const startPad = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: Array<{ date: string; day: number; dayOfWeek: number; isCurrentMonth: boolean }> = [];

    // 이전 달 날짜 채우기
    if (startPad > 0) {
      const prevLastDay = new Date(year, activeMonth - 1, 0);
      const prevTotal = prevLastDay.getDate();
      const prevMonth = activeMonth - 1;
      for (let i = startPad - 1; i >= 0; i--) {
        const d = prevTotal - i;
        const dateStr = `2026-${String(prevMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const dayOfWeek = new Date(year, prevMonth - 1, d).getDay();
        days.push({ date: dateStr, day: d, dayOfWeek, isCurrentMonth: false });
      }
    }

    // 현재 달 날짜
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `2026-${String(activeMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayOfWeek = new Date(year, activeMonth - 1, d).getDay();
      days.push({ date: dateStr, day: d, dayOfWeek, isCurrentMonth: true });
    }

    // 다음 달 날짜로 35칸(5주) 채우기
    const totalCells = 35;
    const remaining = totalCells - days.length;
    const nextMonth = activeMonth + 1;
    for (let d = 1; d <= remaining; d++) {
      const dateStr = `2026-${String(nextMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayOfWeek = new Date(year, nextMonth - 1, d).getDay();
      days.push({ date: dateStr, day: d, dayOfWeek, isCurrentMonth: false });
    }

    return days;
  }, [activeMonth]);

  return (
    <div>
      {/* Month Tabs + Filters */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {MONTHS.map((m) => (
            <button
              key={m}
              onClick={() => setActiveMonth(m)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                activeMonth === m
                  ? "bg-landers-red text-white shadow-sm"
                  : "bg-surface2 text-text-dim hover:text-text hover:bg-border"
              }`}
            >
              {m}월
            </button>
          ))}
        </div>
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1.5 text-xs font-medium transition-all ${
              view === "list"
                ? "bg-landers-red text-white"
                : "bg-surface text-text-dim hover:text-text"
            }`}
          >
            목록
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`px-3 py-1.5 text-xs font-medium transition-all ${
              view === "calendar"
                ? "bg-landers-red text-white"
                : "bg-surface text-text-dim hover:text-text"
            }`}
          >
            달력
          </button>
        </div>
      </div>

      {/* Location Filter */}
      <div className="mb-6 flex gap-2">
        {([
          { key: "all", label: "전체" },
          { key: "home", label: "홈" },
          { key: "away", label: "원정" },
        ] as const).map((f) => (
          <button
            key={f.key}
            onClick={() => setLocationFilter(f.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              locationFilter === f.key
                ? "bg-text text-surface shadow-sm"
                : "bg-surface2 text-text-dim hover:text-text hover:bg-border"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List View */}
      {view === "list" && (
        <>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-text-dim">
              이 달의 경기 일정이 없습니다.
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((game) => {
                const dateObj = new Date(game.date + "T00:00:00");
                const dayOfWeek = dateObj.getDay();
                const dayColor = getDayColor(dayOfWeek, game.date);
                const holidayName = holidays[game.date];
                const teamColor = !game.home ? (TEAM_COLORS[game.opponent] || "#6B7280") : undefined;

                return (
                  <div
                    key={game.date + game.opponent}
                    className={`grid grid-cols-[3.5rem_3.5rem_1fr] sm:grid-cols-[4.5rem_4rem_1fr_auto] items-center gap-x-3 gap-y-0 rounded-xl border p-3 sm:p-4 transition-all ${
                      isToday(game.date)
                        ? "border-landers-gold ring-2 ring-landers-gold/40 bg-landers-gold-light"
                        : "border-border bg-surface"
                    } ${isPast(game.date) ? "opacity-40" : ""} border-l-4`}
                    style={{
                      borderLeftColor: game.home ? "#CE0E2D" : teamColor,
                    }}
                  >
                    {/* 날짜 */}
                    <div className="text-center">
                      <div className={`font-mono text-sm font-semibold leading-tight ${dayColor}`}>
                        {game.date.slice(5)}
                      </div>
                      <div className={`text-xs font-medium ${dayColor}`}>
                        ({game.day})
                      </div>
                      {holidayName && (
                        <div className="text-[10px] leading-tight text-landers-red mt-0.5">
                          {holidayName}
                        </div>
                      )}
                    </div>

                    {/* 시간 */}
                    <div className="font-mono text-base sm:text-lg font-semibold text-landers-red text-center">
                      {game.time}
                    </div>

                    {/* 상대팀 + 구장 */}
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="font-semibold text-text text-sm sm:text-base">
                          vs {game.opponent}
                        </span>
                        <span className={`text-[11px] font-medium ${game.home ? "text-landers-red" : "text-blue-500"}`}>
                          {game.home ? "홈" : "원정"}
                        </span>
                      </div>
                      <div className="text-xs text-text-muted truncate">
                        {game.stadium}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Calendar View */}
      {view === "calendar" && (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border bg-surface2">
            {DAY_NAMES.map((name, i) => (
              <div
                key={name}
                className={`py-2 text-center text-xs font-medium ${
                  i === 0
                    ? "text-landers-red"
                    : i === 6
                    ? "text-blue-500"
                    : "text-text-dim"
                }`}
              >
                {name}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((cell) => {
              const game = gameMap[cell.date];
              const past = isPast(cell.date);
              const todayCell = isToday(cell.date);
              const holiday = holidays[cell.date];
              const dayColor = cell.isCurrentMonth
                ? getDayColor(cell.dayOfWeek, cell.date)
                : "text-text-muted";
              const teamColor = game && !game.home ? (TEAM_COLORS[game.opponent] || "#6B7280") : "";

              return (
                <div
                  key={cell.date}
                  className={`relative min-h-[5rem] border-b border-r border-border p-1.5 transition-all ${
                    !cell.isCurrentMonth
                      ? "bg-surface2/30"
                      : todayCell
                      ? "bg-landers-gold-light ring-2 ring-inset ring-landers-gold"
                      : game
                      ? game.home
                        ? "bg-landers-red-light"
                        : ""
                      : ""
                  } ${past ? "opacity-40" : ""}`}
                >
                  <div className={`text-xs font-medium ${dayColor}`}>
                    {cell.day}
                    {holiday && cell.isCurrentMonth && (
                      <span className="ml-0.5 text-[10px] text-landers-red">
                        *
                      </span>
                    )}
                  </div>
                  {game && game.home && (
                    <div className="mt-1 rounded-md bg-landers-red px-1 py-0.5 text-[10px] leading-tight text-white">
                      <span className="font-semibold">{game.time}</span>
                      <br />
                      vs {game.opponent}
                    </div>
                  )}
                  {game && !game.home && (
                    <div
                      className="mt-1 rounded-md px-1 py-0.5 text-[10px] leading-tight text-white"
                      style={{ backgroundColor: teamColor }}
                    >
                      <span className="font-semibold">{game.time}</span>
                      <br />
                      vs {game.opponent}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 border-t border-border px-4 py-2 text-[11px] text-text-dim">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-landers-red-light border border-landers-red/20" />
              홈경기
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm border border-border" style={{ background: "linear-gradient(135deg, #315288, #570514)" }} />
              원정경기
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-landers-gold-light border border-landers-gold/30" />
              오늘
            </span>
            <span className="text-landers-red">일/공휴일</span>
            <span className="text-blue-500">토요일</span>
          </div>
        </div>
      )}
    </div>
  );
}
