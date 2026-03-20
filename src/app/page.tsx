import ServerClockWidget from "@/components/ServerClock";
import TicketBanner from "@/components/TicketBanner";
import ScheduleTable from "@/components/ScheduleTable";
import UpcomingGames from "@/components/UpcomingGames";
import WeatherWidget from "@/components/WeatherWidget";
import ThemeToggle from "@/components/ThemeToggle";

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
        <h2 className="mb-4 font-display text-2xl text-text">
          <span className="mr-2">⏱</span>서버 시각
        </h2>
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
        <h2 className="mb-4 font-display text-2xl text-text">
          <span className="mr-2">🎟</span>나의 멤버십
        </h2>
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
        <ScheduleTable />
      </section>

      {/* SECTION 5: 예매 안내 가이드 */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-2xl text-text">
          <span className="mr-2">📋</span>예매 안내
        </h2>

        {/* 공식 예매 링크 */}
        <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm text-text-dim">공식 티켓 예매</p>
          <a
            href="https://ticket.ssg.com/ticket"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block text-lg font-semibold text-landers-red hover:underline"
          >
            ticket.ssg.com/ticket
          </a>
          <p className="mt-1 text-sm text-text-dim">
            문의 전화: 1577-3419
          </p>
        </div>

        {/* 멤버십 등급별 선예매 안내 */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-3 bg-surface2">
            <h3 className="font-semibold text-text">멤버십 등급별 선예매 안내</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-dim">
                  <th className="px-6 py-3 text-left font-medium">등급</th>
                  <th className="px-6 py-3 text-left font-medium">가격</th>
                  <th className="px-6 py-3 text-left font-medium">선예매</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["시즌권 회원", "좌석별 상이", "경기 7일 전 11:00"],
                  ["랜디 멤버십", "199,000원", "경기 7일 전 11:00"],
                  ["배티 멤버십", "99,000원", "경기 7일 전 11:00"],
                  ["푸리 멤버십", "50,000원", "경기 6일 전 11:00"],
                  ["일반", "무료", "일반 예매와 동일"],
                ].map(([grade, price, open]) => (
                  <tr
                    key={grade}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-6 py-3 font-semibold text-text">{grade}</td>
                    <td className="px-6 py-3 text-text-dim">{price}</td>
                    <td className="px-6 py-3 text-text-dim">{open}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 text-xs text-text-muted border-t border-border bg-surface2">
            ※ 랜디·배티 등급은 3월 말까지만 한정 판매 (이후 가입 불가)
            <br />
            ※ 유료 멤버십 공통: 일반 입장 1시간 전 선입장 + 예매 수수료 면제
            <br />
            ※ 정확한 일정은 구단 공식 공지 확인 필수
          </div>
        </div>

        {/* 꿀팁 카드 */}
        <div className="grid gap-4 sm:grid-cols-2">
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
