export const TEAM_CODE_TO_NAME: Record<string, string> = {
  SK: "SSG",
  WO: "키움",
  LT: "롯데",
  LG: "LG",
  OB: "두산",
  HT: "KIA",
  NC: "NC",
  KT: "KT",
  SS: "삼성",
  HH: "한화",
};

export const STADIUM_SHORT_TO_FULL: Record<string, string> = {
  인천: "SSG랜더스필드",
  사직: "사직 야구장",
  잠실: "잠실 야구장",
  창원: "창원NC파크",
  대구: "대구 삼성 라이온즈 파크",
  수원: "수원KT위즈파크",
  광주: "광주-기아 챔피언스 필드",
  고척: "고척 스카이돔",
  대전: "한화생명 이글스파크",
};

export const TEAM_COLORS: Record<string, string> = {
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

export const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

export function getDayName(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00+09:00");
  return DAY_NAMES[d.getDay()];
}

export function resolveStadium(short: string | null | undefined): string {
  if (!short) return "";
  return STADIUM_SHORT_TO_FULL[short] ?? short;
}

export function resolveTeamName(code: string | null | undefined): string {
  if (!code) return "";
  return TEAM_CODE_TO_NAME[code] ?? code;
}
