import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://landers-time.vercel.app";

export const metadata: Metadata = {
  title: "랜더스타임 — SSG 랜더스 홈경기 일정 & 티켓팅 서버 시각",
  description:
    "SSG 랜더스 2026 정규시즌 홈경기 일정 확인, ticket.ssg.com 서버 시각 실시간 표시, 빠른 예매 이동까지. 랜더스타임에서 예매 오픈 순간을 정확히 노리세요.",
  keywords: ["SSG 랜더스", "티켓팅", "서버 시각", "예매", "홈경기 일정", "랜더스타임", "SSG랜더스필드", "인천 야구"],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "랜더스타임 — SSG 랜더스 홈경기 일정 & 티켓팅",
    description: "2026 SSG 랜더스 홈경기 일정, 멤버십 선예매 안내, 서버 시각 실시간 표시",
    url: SITE_URL,
    siteName: "랜더스타임",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "랜더스타임 — SSG 랜더스 홈경기 일정 & 티켓팅",
    description: "2026 SSG 랜더스 홈경기 일정, 멤버십 선예매 안내, 서버 시각 실시간 표시",
  },
  robots: {
    index: true,
    follow: true,
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
      </head>
      <body className="min-h-screen bg-bg-soft font-body text-text antialiased">
        {children}
      </body>
    </html>
  );
}
