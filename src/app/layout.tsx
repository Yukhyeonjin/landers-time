import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://landers-time.vercel.app";

export const metadata: Metadata = {
  title: "랜더스타임 — SSG 랜더스 경기 일정·티켓 예매·좌석 가이드 2026",
  description:
    "SSG 랜더스 2026 정규시즌 경기 일정, 티켓 예매 서버 시각 실시간 표시, 좌석 배치도·시야 사진, 멤버십 선예매 안내, 인천 랜더스필드 날씨까지. 예매 오픈 순간을 정확히 노리세요.",
  keywords: [
    "SSG 랜더스", "SSG 랜더스 예매", "SSG 랜더스 티켓", "SSG 랜더스 경기 일정",
    "SSG 랜더스 좌석 추천", "SSG 랜더스 좌석 시야", "랜더스필드 좌석 배치도",
    "SSG 랜더스 2026", "SSG 랜더스 티켓 가격", "SSG 랜더스 멤버십",
    "인천 야구 티켓", "인천 야구장", "랜더스필드", "티켓팅 서버 시각",
    "랜더스타임", "SSG 랜더스 일정표",
  ],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "랜더스타임 — SSG 랜더스 경기 일정·예매·좌석 가이드",
    description:
      "2026 SSG 랜더스 경기 일정, 티켓 예매 서버 시각, 좌석 배치도·시야 사진, 멤버십 선예매, 경기장 날씨 정보",
    url: SITE_URL,
    siteName: "랜더스타임",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "랜더스타임 — SSG 랜더스 경기 일정·예매·좌석 가이드",
    description:
      "2026 SSG 랜더스 경기 일정, 티켓 예매 서버 시각, 좌석 배치도·시야 사진, 멤버십 선예매 안내",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "K0c-Wr0Ze6thHPxaHGXn_HCF12vJhm9lhtSC4JUABEQ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function() {
  var theme = localStorage.getItem('theme');
  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else if (theme === 'light') {
    document.documentElement.classList.add('light');
  }
})();` }} />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;800&display=swap"
        />
      </head>
      <body className="min-h-screen bg-bg-soft font-body text-text antialiased">
        {children}
      </body>
    </html>
  );
}
