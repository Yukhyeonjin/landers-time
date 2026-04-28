export const revalidate = 600;

export type TeamRankRow = {
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

const KBO_URL = "https://www.koreabaseball.com/Record/TeamRank/TeamRank.aspx";

const decodeHtml = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

const stripTags = (s: string) =>
  decodeHtml(s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());

function parseRanking(html: string): TeamRankRow[] {
  // 첫 번째 tData 테이블만 사용 (팀 순위)
  const tableMatch = html.match(
    /<table[^>]*class="tData"[^>]*>([\s\S]*?)<\/table>/i,
  );
  if (!tableMatch) return [];
  const tbodyMatch = tableMatch[1].match(/<tbody>([\s\S]*?)<\/tbody>/i);
  if (!tbodyMatch) return [];
  const rows: TeamRankRow[] = [];
  const trRegex = /<tr>([\s\S]*?)<\/tr>/gi;
  let m: RegExpExecArray | null;
  while ((m = trRegex.exec(tbodyMatch[1])) !== null) {
    const cells: string[] = [];
    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let tm: RegExpExecArray | null;
    while ((tm = tdRegex.exec(m[1])) !== null) {
      cells.push(stripTags(tm[1]));
    }
    if (cells.length < 12) continue;
    rows.push({
      rank: parseInt(cells[0], 10) || 0,
      team: cells[1],
      games: parseInt(cells[2], 10) || 0,
      wins: parseInt(cells[3], 10) || 0,
      losses: parseInt(cells[4], 10) || 0,
      draws: parseInt(cells[5], 10) || 0,
      winRate: cells[6],
      gamesBehind: cells[7],
      recent10: cells[8],
      streak: cells[9],
      home: cells[10],
      away: cells[11],
    });
  }
  return rows;
}

export async function GET() {
  try {
    const res = await fetch(KBO_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      next: { revalidate: 600 },
    });
    if (!res.ok) {
      return Response.json(
        { rows: [], error: `KBO 응답 오류: ${res.status}` },
        { status: 502 },
      );
    }
    const html = await res.text();
    const rows = parseRanking(html);
    if (rows.length === 0) {
      return Response.json(
        { rows: [], error: "팀 순위 테이블 파싱 실패" },
        { status: 502 },
      );
    }
    return Response.json({
      rows,
      fetchedAt: new Date().toISOString(),
    });
  } catch (e) {
    return Response.json(
      {
        rows: [],
        error: e instanceof Error ? e.message : "fetch failed",
      },
      { status: 500 },
    );
  }
}
