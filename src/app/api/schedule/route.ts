import {
  TEAM_CODE_TO_NAME,
  STADIUM_SHORT_TO_FULL,
  DAY_NAMES,
} from "@/lib/teamMapping";

export const revalidate = 3600;

export type ScheduleGame = {
  date: string;
  day: string;
  time: string;
  opponent: string;
  home: boolean;
  stadium: string;
  result: "승" | "패" | "무" | "취소" | null;
  hScore: number | null;
  vScore: number | null;
  ended: boolean;
  cancelled: boolean;
  doubleHeader: boolean;
};

type SsgGame = {
  date: string;
  badge: boolean;
  title: string | null;
  gTime: string;
  stadium: string;
  home_key: string;
  end_Flag: string;
  visit_key: string;
  dheader: string;
  hScore: number;
  vScore: number;
  cancel_Flag: number;
  skResult: string;
};

const SEASON_MONTHS = [3, 4, 5, 6, 7, 8, 9, 10];
const SEASON_YEAR = 2026;
const REGULAR_SEASON_START = "2026-03-28";

async function fetchMonth(year: number, month: number): Promise<SsgGame[]> {
  const url = `https://www.ssglanders.com/game/schedule/data?year=${year}&month=${month}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      "X-Requested-With": "XMLHttpRequest",
      Referer: "https://www.ssglanders.com/game/schedule",
      Accept: "application/json, text/javascript, */*; q=0.01",
    },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  try {
    const data = (await res.json()) as SsgGame[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function transform(raw: SsgGame): ScheduleGame | null {
  if (!raw.date) return null;
  const isHome = raw.home_key === "SK";
  const opponentCode = isHome ? raw.visit_key : raw.home_key;
  const opponent = TEAM_CODE_TO_NAME[opponentCode] ?? opponentCode;
  if (!opponent || opponent === "SSG") return null;
  const stadium =
    STADIUM_SHORT_TO_FULL[raw.stadium] ?? raw.stadium ?? "";
  const dateObj = new Date(raw.date + "T00:00:00+09:00");
  const day = DAY_NAMES[dateObj.getDay()];
  const ended = raw.end_Flag === "1";
  const cancelled = raw.cancel_Flag === 1;
  const result: ScheduleGame["result"] = cancelled
    ? "취소"
    : ended
    ? raw.skResult === "승" || raw.skResult === "패" || raw.skResult === "무"
      ? raw.skResult
      : null
    : null;
  return {
    date: raw.date,
    day,
    time: raw.gTime ?? "",
    opponent,
    home: isHome,
    stadium,
    result,
    hScore: ended && !cancelled ? raw.hScore : null,
    vScore: ended && !cancelled ? raw.vScore : null,
    ended,
    cancelled,
    doubleHeader: raw.dheader === "1",
  };
}

export async function GET() {
  try {
    const monthData = await Promise.all(
      SEASON_MONTHS.map((m) => fetchMonth(SEASON_YEAR, m)),
    );
    const flat = monthData.flat();
    const seen = new Set<string>();
    const games: ScheduleGame[] = [];
    for (const raw of flat) {
      const g = transform(raw);
      if (!g) continue;
      if (g.date < REGULAR_SEASON_START) continue;
      const key = `${g.date}-${g.opponent}-${g.doubleHeader}`;
      if (seen.has(key)) continue;
      seen.add(key);
      games.push(g);
    }
    games.sort((a, b) => a.date.localeCompare(b.date));
    return Response.json({
      year: SEASON_YEAR,
      games,
      fetchedAt: new Date().toISOString(),
    });
  } catch (e) {
    return Response.json(
      {
        year: SEASON_YEAR,
        games: [],
        error: e instanceof Error ? e.message : "fetch failed",
      },
      { status: 500 },
    );
  }
}
