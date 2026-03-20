"use client";

import { useEffect, useState } from "react";

type WeatherData = {
  weather: {
    temp: number;
    feelsLike: number;
    tempMin: number | null;
    tempMax: number | null;
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
  };
  dust?: {
    pm10: number;
    pm25: number;
    pm10Grade: "좋음" | "보통" | "나쁨" | "매우나쁨";
    pm25Grade: "좋음" | "보통" | "나쁨" | "매우나쁨";
  };
  updatedAt: string;
};

function getWeatherEmoji(icon: string): string {
  const code = icon.slice(0, 2);
  const isNight = icon.endsWith("n");
  switch (code) {
    case "01": return isNight ? "🌙" : "☀️";
    case "02": case "03": return "⛅";
    case "04": return "☁️";
    case "09": case "10": return "🌧️";
    case "11": return "⛈️";
    case "13": return "❄️";
    case "50": return "🌫️";
    default:   return "☀️";
  }
}

function getOutfitRecommendation(temp: number, pty: number): { emoji: string; text: string } {
  // 비/눈이 오는 경우
  if (pty === 1 || pty === 5) {
    return {
      emoji: "🧥☂️",
      text: "우비 필수! 야구장에선 우산보다 우비가 편해요. 방수 자켓 + 랜더스 우비 조합 추천",
    };
  }
  if (pty === 3 || pty === 7) {
    return {
      emoji: "🧣🧤",
      text: "눈 오는 경기! 롱패딩 + 핫팩 + 랜더스 머플러 필수. 방수 부츠도 챙기세요",
    };
  }
  if (pty === 2 || pty === 6) {
    return {
      emoji: "🧥☂️",
      text: "비눈 혼합! 방수 패딩 + 우비 + 핫팩 조합으로 완벽 무장하세요",
    };
  }

  // 기온별 복장
  if (temp < 0) {
    return {
      emoji: "🥶🧣",
      text: "극한 추위! 롱패딩 + 두꺼운 담요 + 핫팩 여러 개 필수. 랜더스 패딩 머플러 풀세트 추천",
    };
  }
  if (temp < 5) {
    return {
      emoji: "🫠🧤",
      text: "매우 추워요! 롱패딩 + 무릎담요 + 핫팩은 기본. 랜더스 후드 + 머플러 챙기세요",
    };
  }
  if (temp < 10) {
    return {
      emoji: "🧥✊",
      text: "쌀쌀해요! 두꺼운 겉옷 + 랜더스 후드집업 + 무릎담요 추천. 핫팩도 하나 챙겨가세요",
    };
  }
  if (temp < 15) {
    return {
      emoji: "🧢👕",
      text: "선선해요! 가벼운 자켓 안에 랜더스 유니폼, 저녁엔 기온 뚝 떨어지니 겉옷 필수",
    };
  }
  if (temp < 20) {
    return {
      emoji: "⚾👕",
      text: "야구 관람 최적 온도! 랜더스 유니폼 한 장이면 딱. 저녁 경기라면 얇은 카디건도 OK",
    };
  }
  if (temp < 25) {
    return {
      emoji: "😎🧢",
      text: "따뜻해요! 반팔 유니폼 + 랜더스 모자 조합. 선크림 잊지 마세요",
    };
  }
  if (temp < 30) {
    return {
      emoji: "🥵🧊",
      text: "더워요! 시원한 반팔 유니폼 + 랜더스 썬캡 + 선크림 필수. 물 넉넉히 챙기세요",
    };
  }
  return {
    emoji: "🫠💦",
    text: "폭염 주의! 썬캡 + 선크림 + 휴대용 선풍기 + 물 필수. 열사병 조심하세요!",
  };
}

const gradeColor: Record<string, string> = {
  "좋음":    "bg-blue-100 text-blue-700",
  "보통":    "bg-green-100 text-green-700",
  "나쁨":    "bg-orange-100 text-orange-700",
  "매우나쁨": "bg-red-100 text-red-700",
};

function formatUpdatedAt(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m} 기준`;
}

export default function WeatherWidget() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchWeather = async () => {
    try {
      const res = await fetch("/api/weather");
      if (!res.ok) throw new Error("fetch failed");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 space-y-3">
        <div className="h-10 w-32 animate-pulse rounded bg-surface2" />
        <div className="h-5 w-48 animate-pulse rounded bg-surface2" />
        <div className="h-4 w-64 animate-pulse rounded bg-surface2" />
        <div className="mt-4 flex gap-4">
          <div className="h-8 w-24 animate-pulse rounded bg-surface2" />
          <div className="h-8 w-24 animate-pulse rounded bg-surface2" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6">
        <p className="text-text-dim text-sm">날씨 정보를 불러올 수 없습니다.</p>
        <button
          onClick={fetchWeather}
          className="mt-3 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-dim transition-all hover:border-landers-red hover:text-landers-red"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const { weather, dust, updatedAt } = data;
  const pty = weather.icon.startsWith("10") ? 1 : weather.icon.startsWith("13") ? 3 : 0;
  const outfit = getOutfitRecommendation(weather.temp, pty);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      {/* Top row: temp + emoji */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-end gap-3">
            <span className="font-display text-5xl text-text">{weather.temp}°</span>
            <span className="mb-1 text-text-dim text-base">체감 {weather.feelsLike}°</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-text-dim text-sm">
            <span>{weather.description}</span>
            {weather.tempMin !== null && weather.tempMax !== null && (
              <span className="text-text-muted">
                · 최저 {weather.tempMin}° / 최고 {weather.tempMax}°
              </span>
            )}
          </div>
        </div>
        <span className="text-5xl leading-none" aria-hidden="true">
          {getWeatherEmoji(weather.icon)}
        </span>
      </div>

      {/* Middle: humidity + wind */}
      <div className="mt-4 flex gap-6 text-sm text-text-dim">
        <div className="flex items-center gap-1.5">
          <span>💧</span>
          <span>습도 <span className="text-text font-medium">{weather.humidity}%</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🍃</span>
          <span>바람 <span className="text-text font-medium">{weather.windSpeed} m/s</span></span>
        </div>
      </div>

      {/* Dust (optional) */}
      {dust && (
        <>
          <div className="my-4 border-t border-border" />
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-text-dim">미세먼지(PM10)</span>
              <span className="font-medium text-text">{dust.pm10} ㎍/㎥</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${gradeColor[dust.pm10Grade]}`}>
                {dust.pm10Grade}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-dim">초미세먼지(PM2.5)</span>
              <span className="font-medium text-text">{dust.pm25} ㎍/㎥</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${gradeColor[dust.pm25Grade]}`}>
                {dust.pm25Grade}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Outfit recommendation */}
      <div className="my-4 border-t border-border" />
      <div className="flex gap-3 items-start">
        <span className="text-2xl shrink-0">{outfit.emoji}</span>
        <div>
          <p className="text-sm font-semibold text-text">오늘의 직관 복장</p>
          <p className="mt-0.5 text-sm text-text-dim">{outfit.text}</p>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-4 text-xs text-text-muted">
        문학경기장 (SSG랜더스필드) · {formatUpdatedAt(updatedAt)}
      </p>
    </div>
  );
}
