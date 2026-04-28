import ServerClockWidget from "@/components/ServerClock";
import TeamRank from "@/components/TeamRank";
import TicketBanner from "@/components/TicketBanner";
import ScheduleTable from "@/components/ScheduleTable";
import UpcomingGames from "@/components/UpcomingGames";
import TicketInfo from "@/components/TicketInfo";
import MyBookings from "@/components/MyBookings";
import WeatherWidget from "@/components/WeatherWidget";
import ThemeToggle from "@/components/ThemeToggle";
import TicketingGame from "@/components/TicketingGame";
import SeatGuide from "@/components/SeatGuide";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "랜더스타임",
      alternateName: ["LandersTime", "SSG 랜더스 타임"],
      url: "https://landers-time.vercel.app",
      description:
        "SSG 랜더스 2026 경기 일정, 티켓 예매 서버 시각, 좌석 배치도, 멤버십 선예매 안내",
    },
    {
      "@type": "SportsTeam",
      name: "SSG 랜더스",
      alternateName: "SSG Landers",
      sport: "야구",
      memberOf: {
        "@type": "SportsOrganization",
        name: "KBO 리그",
      },
      location: {
        "@type": "StadiumOrArena",
        name: "인천 SSG 랜더스필드",
        address: {
          "@type": "PostalAddress",
          addressLocality: "인천광역시",
          addressRegion: "미추홀구",
          addressCountry: "KR",
        },
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "SSG 랜더스 티켓 예매는 어디서 하나요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ticket.ssg.com 또는 SSG 랜더스 앱에서 예매할 수 있습니다. 멤버십 등급에 따라 경기 5~7일 전 선예매가 가능합니다.",
          },
        },
        {
          "@type": "Question",
          name: "SSG 랜더스필드 좌석 시야는 어떻게 확인하나요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "랜더스타임에서 공식 좌석 배치도를 확대해서 확인하고, 자리어때(myseatcheck.com)에서 구역별 실제 시야 사진 9,765장을 무료로 볼 수 있습니다.",
          },
        },
        {
          "@type": "Question",
          name: "SSG 랜더스 2026 멤버십 종류와 가격은?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "랜디(199,000원), 배티(99,000원), 푸리(50,000원), 일반(무료)이 있으며, 랜디·배티는 경기 7일 전, 푸리는 6일 전 선예매가 가능합니다.",
          },
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* SECTION 1: 히어로 헤더 */}
      <header className="relative mb-10 overflow-hidden rounded-3xl bg-surface px-6 py-12 text-center md:py-16 border border-border">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 30% 20%, rgba(206,14,45,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 70% 80%, rgba(240,192,64,0.06) 0%, transparent 60%)",
          }}
        />
        <div className="relative">
          <h1 className="animate-fade-in-down font-display text-5xl md:text-7xl text-landers-red">
            랜더스타임
          </h1>
          <p
            className="animate-fade-in-down mt-1 text-lg md:text-xl font-semibold tracking-widest text-text-dim"
            style={{ animationDelay: "0.1s" }}
          >
            Landers Time
          </p>
          <p
            className="animate-fade-in-down mt-2 text-sm md:text-base text-text-muted"
            style={{ animationDelay: "0.2s" }}
          >
            SSG 랜더스 홈경기 일정 &amp; 티켓팅 서버 시각
          </p>
        </div>
      </header>

      {/* SECTION 2: 서버 시각 위젯 */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl text-text">
            <span className="mr-2">⏱</span>서버 시각
          </h2>
          <TicketingGame />
        </div>
        <ServerClockWidget />
      </section>

      {/* SECTION 2.3: 경기장 날씨 */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-2xl text-text">
          <span className="mr-2">🌤</span>문학경기장 날씨
        </h2>
        <WeatherWidget />
      </section>

      {/* SECTION 2.4: 팀 순위 */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-2xl text-text">
          <span className="mr-2">🏆</span>KBO 팀 순위
        </h2>
        <TeamRank />
      </section>

      {/* SECTION 2.5: 나의 멤버십 */}
      <section className="mb-10">
        <h2 className="mb-1 font-display text-2xl text-text">
          <span className="mr-2">🎟</span>나의 멤버십
        </h2>
        <p className="mb-4 text-xs text-text-muted">멤버십 선예매는 현재 앱에서만 가능합니다</p>
        <UpcomingGames />
      </section>

      {/* SECTION 3: 예매 빠른 이동 */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-2xl text-text">
          <span className="mr-2">🎫</span>예매 빠른 이동
        </h2>
        <TicketBanner />
      </section>

      {/* SECTION 4: 홈경기 일정 */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-2xl text-text">
          <span className="mr-2">📅</span>2026 경기 일정
        </h2>
        <MyBookings />
        <ScheduleTable />
      </section>

      {/* SECTION 5: 좌석 가이드 */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-2xl text-text">
          <span className="mr-2">💺</span>좌석 가이드
        </h2>
        <SeatGuide />
      </section>

      {/* SECTION 6: 예매 안내 가이드 */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-2xl text-text">
          <span className="mr-2">📋</span>예매 안내
        </h2>

        <TicketInfo />

        {/* 꿀팁 카드 */}
        <div className="grid gap-4 sm:grid-cols-2 mt-10">
          {[
            {
              icon: "⏱",
              title: "서버 시각 활용",
              text: "이 페이지 서버 시각 기준으로 오픈 순간 예매 사이트 접속",
            },
            {
              icon: "📱",
              title: "앱 사전 준비",
              text: "SSG닷컴 앱 미리 설치 + 회원가입 + 결제수단 등록 필수",
            },
            {
              icon: "🎟",
              title: "멤버십 가입",
              text: "인기 경기 확보를 위해 최소 배티 이상 가입 권장 (3월 말 마감)",
            },
            {
              icon: "🔄",
              title: "취소표 노리기",
              text: "자정 0시 10분, 미결제 취소표 대량 방출 — 앱+PC 동시 접속",
            },
          ].map((tip) => (
            <div
              key={tip.icon}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{tip.icon}</span>
                <span className="font-semibold text-sm text-text">{tip.title}</span>
              </div>
              <p className="text-sm text-text-dim">{tip.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-border py-8 text-center text-sm text-text-dim">
        <p className="mb-4">
          본 사이트는 SSG 랜더스 공식 사이트가 아닙니다.
          <br />
          정확한 예매 일정은 구단 공식 채널을 확인하세요.
        </p>
        <div className="mb-4 flex flex-wrap justify-center gap-4">
          <a
            href="https://www.ssglanders.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-landers-red transition-colors"
          >
            SSG 랜더스 공식
          </a>
          <span className="text-text-muted">|</span>
          <a
            href="https://ticket.ssg.com/ticket"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-landers-red transition-colors"
          >
            ticket.ssg.com
          </a>
          <span className="text-text-muted">|</span>
          <a
            href="https://www.koreabaseball.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-landers-red transition-colors"
          >
            KBO 공식
          </a>
        </div>
        <p className="text-text-muted">&copy; 2026 랜더스타임</p>
      </footer>
    </main>
  );
}
