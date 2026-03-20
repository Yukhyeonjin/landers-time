import { NextResponse } from "next/server";

// SSG랜더스필드 (인천 미추홀구) 기상청 격자 좌표
const NX = 54;
const NY = 124;
// OpenWeatherMap용 위경도 (미세먼지)
const LAT = 37.437;
const LON = 126.693;

const KMA_BASE = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0";

function getKST(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 9 * 3600000);
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

/** 초단기실황: 매시 정각 발표, ~40분 후 제공 */
function getNcstBase(): { baseDate: string; baseTime: string } {
  const kst = getKST();
  if (kst.getMinutes() < 40) {
    kst.setHours(kst.getHours() - 1);
  }
  return {
    baseDate: formatDate(kst),
    baseTime: `${String(kst.getHours()).padStart(2, "0")}00`,
  };
}

function getWeatherDescription(pty: number): string {
  switch (pty) {
    case 1: return "비";
    case 2: return "비/눈";
    case 3: return "눈";
    case 5: return "빗방울";
    case 6: return "빗방울눈날림";
    case 7: return "눈날림";
    default: return "맑음";
  }
}

/** PTY → OWM 호환 icon 코드 (WeatherWidget emoji 매퍼 호환) */
function getWeatherIcon(pty: number): string {
  const hour = getKST().getHours();
  const s = hour >= 6 && hour < 18 ? "d" : "n";
  switch (pty) {
    case 1: case 5: return `10${s}`;
    case 2: case 6: return `13${s}`;
    case 3: case 7: return `13${s}`;
    default: return `01${s}`;
  }
}

/** 체감온도 근사 (기상청은 체감온도를 직접 제공하지 않음) */
function calcFeelsLike(temp: number, wind: number, humidity: number): number {
  const wKmh = wind * 3.6;
  if (temp <= 10 && wKmh > 4.8) {
    return Math.round(
      13.12 + 0.6215 * temp - 11.37 * wKmh ** 0.16 + 0.3965 * temp * wKmh ** 0.16
    );
  }
  if (temp >= 25) {
    return Math.round(temp - 0.55 * (1 - humidity / 100) * (temp - 14.5));
  }
  return temp;
}

function getPm10Grade(v: number): "좋음" | "보통" | "나쁨" | "매우나쁨" {
  if (v <= 30) return "좋음";
  if (v <= 80) return "보통";
  if (v <= 150) return "나쁨";
  return "매우나쁨";
}

function getPm25Grade(v: number): "좋음" | "보통" | "나쁨" | "매우나쁨" {
  if (v <= 15) return "좋음";
  if (v <= 35) return "보통";
  if (v <= 75) return "나쁨";
  return "매우나쁨";
}

export async function GET() {
  const weatherKey = process.env.WEATHER_API_KEY;
  if (!weatherKey) {
    return NextResponse.json({ error: "WEATHER_API_KEY not configured" }, { status: 500 });
  }

  try {
    const ncst = getNcstBase();

    const ncstParams = new URLSearchParams({
      ServiceKey: weatherKey,
      numOfRows: "10",
      pageNo: "1",
      dataType: "JSON",
      base_date: ncst.baseDate,
      base_time: ncst.baseTime,
      nx: String(NX),
      ny: String(NY),
    });

    const ncstRes = await fetch(
      `${KMA_BASE}/getUltraSrtNcst?${ncstParams}`,
      { next: { revalidate: 600 } }
    );

    const ncstText = await ncstRes.text();

    // data.go.kr XML 에러 응답 처리
    if (ncstText.startsWith("<")) {
      return NextResponse.json(
        { error: "기상청 API XML error", raw: ncstText.slice(0, 200) },
        { status: 502 }
      );
    }

    const ncstData = JSON.parse(ncstText);

    if (ncstData?.response?.header?.resultCode !== "00") {
      return NextResponse.json(
        { error: ncstData?.response?.header?.resultMsg ?? "실황 조회 실패" },
        { status: 502 }
      );
    }

    // 실황 데이터 파싱
    const ncstItems = ncstData?.response?.body?.items?.item ?? [];
    const obs: Record<string, string> = {};
    for (const item of ncstItems) {
      obs[item.category] = item.obsrValue;
    }

    const temp = Math.round(parseFloat(obs["T1H"] ?? "0"));
    const humidity = parseInt(obs["REH"] ?? "0", 10);
    const windSpeed = Math.round(parseFloat(obs["WSD"] ?? "0") * 10) / 10;
    const pty = parseInt(obs["PTY"] ?? "0", 10);
    const feelsLike = calcFeelsLike(temp, windSpeed, humidity);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = {
      weather: {
        temp,
        feelsLike,
        humidity,
        windSpeed,
        description: getWeatherDescription(pty),
        icon: getWeatherIcon(pty),
      },
      updatedAt: new Date().toISOString(),
    };

    // 미세먼지: OpenWeatherMap (선택적)
    const owmKey = process.env.OPENWEATHER_API_KEY;
    if (owmKey) {
      try {
        const dustRes = await fetch(
          `https://api.openweathermap.org/data/2.5/air_pollution?lat=${LAT}&lon=${LON}&appid=${owmKey}`,
          { next: { revalidate: 600 } }
        );
        if (dustRes.ok) {
          const dustData = await dustRes.json();
          const c = dustData?.list?.[0]?.components ?? {};
          const pm10 = Math.round(c.pm10 ?? 0);
          const pm25 = Math.round(c.pm2_5 ?? 0);
          result.dust = {
            pm10,
            pm25,
            pm10Grade: getPm10Grade(pm10),
            pm25Grade: getPm25Grade(pm25),
          };
        }
      } catch {
        // 미세먼지 실패해도 날씨는 반환
      }
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "날씨 조회 실패" }, { status: 500 });
  }
}
