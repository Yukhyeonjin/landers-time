import ServerClockWidget from "@/components/ServerClock";
import TicketBanner from "@/components/TicketBanner";
import ScheduleTable from "@/components/ScheduleTable";
import UpcomingGames from "@/components/UpcomingGames";
import TicketInfo from "@/components/TicketInfo";
import MyBookings from "@/components/MyBookings";
import WeatherWidget from "@/components/WeatherWidget";
import ThemeToggle from "@/components/ThemeToggle";
import TicketingGame from "@/components/TicketingGame";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
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

      {/* SECTION 5: 예매 안내 가이드 */}
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
