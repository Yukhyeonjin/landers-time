import { NextResponse } from "next/server";

const BASE_URL =
  "https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const solYear = searchParams.get("solYear") ?? new Date().getFullYear().toString();
  const apiKey = process.env.HOLIDAY_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const params = new URLSearchParams({
    solYear,
    ServiceKey: apiKey,
    _type: "json",
    numOfRows: "100",
  });

  try {
    const res = await fetch(`${BASE_URL}?${params.toString()}`, {
      next: { revalidate: 86400 }, // 24시간 캐시
    });

    const text = await res.text();

    // XML 에러 응답 처리
    if (text.startsWith("<")) {
      return NextResponse.json({ error: "API error", raw: text }, { status: 502 });
    }

    const data = JSON.parse(text);
    const header = data?.response?.header;

    if (header?.resultCode !== "00") {
      return NextResponse.json(
        { error: header?.resultMsg ?? "Unknown error" },
        { status: 502 }
      );
    }

    const items = data?.response?.body?.items?.item;
    if (!items) {
      return NextResponse.json({ holidays: {} });
    }

    const list = Array.isArray(items) ? items : [items];

    // { "2026-05-05": "어린이날", ... } 형태로 변환
    const holidays: Record<string, string> = {};
    for (const item of list) {
      if (item.isHoliday === "Y") {
        const raw = String(item.locdate);
        const dateStr = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
        holidays[dateStr] = item.dateName;
      }
    }

    return NextResponse.json({ holidays });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch holidays" },
      { status: 500 }
    );
  }
}
